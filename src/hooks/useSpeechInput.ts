import { useCallback, useEffect, useRef, useState } from "react";

type ResultadoFala = {
  isFinal: boolean;
  transcripts: string[];
};

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: { results: ArrayLike<ResultadoFala> }) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  start: () => void;
  stop: () => void;
};

type JanelaComVoz = typeof window & {
  SpeechRecognition?: new () => SpeechRecognitionLike;
  webkitSpeechRecognition?: new () => SpeechRecognitionLike;
};

function construtorReconhecimento(): (new () => SpeechRecognitionLike) | undefined {
  const w = window as JanelaComVoz;
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

const SILENCIO_MS = 10000;

export function useSpeechInput(opts: { onFinal: (texto: string) => void }) {
  const [disponivel, setDisponivel] = useState(false);
  const [gravando, setGravando] = useState(false);
  const [interim, setInterim] = useState("");
  const [erro, setErro] = useState<string | undefined>(undefined);
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const acumuladoRef = useRef("");
  const parandoRef = useRef(false);
  const timerRef = useRef<number | null>(null);
  const optsRef = useRef(opts);
  optsRef.current = opts;

  const limparTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const reiniciarTimer = useCallback(() => {
    limparTimer();
    timerRef.current = window.setTimeout(() => {
      parandoRef.current = true;
      recRef.current?.stop();
    }, SILENCIO_MS);
  }, [limparTimer]);

  const finalizar = useCallback(() => {
    const deveEnviar = parandoRef.current;
    limparTimer();
    setGravando(false);
    setInterim("");
    const texto = acumuladoRef.current.trim();
    acumuladoRef.current = "";
    parandoRef.current = false;
    recRef.current = null;
    if (deveEnviar && texto) optsRef.current.onFinal(texto);
  }, [limparTimer]);

  useEffect(() => {
    if (construtorReconhecimento()) setDisponivel(true);
    return () => {
      parandoRef.current = false;
      recRef.current?.stop();
      limparTimer();
      recRef.current = null;
    };
  }, [limparTimer]);

  const parar = useCallback(() => {
    parandoRef.current = true;
    recRef.current?.stop();
  }, []);

  const cancelar = useCallback(() => {
    parandoRef.current = false;
    recRef.current?.stop();
  }, []);

  const iniciar = useCallback(() => {
    const SR = construtorReconhecimento();
    if (!SR || gravando) return;
    const rec = new SR();
    rec.lang = "pt-BR";
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (e) => {
      let interimTxt = "";
      for (let i = 0; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) {
          const t = (r.transcripts[0] ?? "").trim();
          if (t) acumuladoRef.current += acumuladoRef.current ? ` ${t}` : t;
        } else {
          interimTxt += r.transcripts[0] ?? "";
        }
      }
      setInterim(interimTxt);
      reiniciarTimer();
    };
    rec.onend = () => finalizar();
    rec.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        setErro("Sem acesso ao microfone. Permita o acesso nas configurações do navegador.");
      } else if (e.error === "no-speech") {
        setErro("Nada foi ouvido. Tente de novo.");
      } else if (e.error === "network") {
        setErro("Reconhecimento de voz indisponível agora. Tente novamente em instantes.");
      } else {
        setErro(undefined);
      }
    };
    recRef.current = rec;
    setErro(undefined);
    try {
      rec.start();
      setGravando(true);
      reiniciarTimer();
    } catch {
      setGravando(false);
    }
  }, [finalizar, gravando, reiniciarTimer]);

  return { disponivel, gravando, interim, erro, iniciar, parar, cancelar };
}
