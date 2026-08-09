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

export function useSpeechInput(opts: {
  onInterim: (texto: string) => void;
  onFinal: (texto: string) => void;
}) {
  const [disponivel, setDisponivel] = useState(false);
  const [gravando, setGravando] = useState(false);
  const [erro, setErro] = useState<string | undefined>(undefined);
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const optsRef = useRef(opts);
  optsRef.current = opts;

  useEffect(() => {
    if (construtorReconhecimento()) setDisponivel(true);
    return () => {
      recRef.current?.stop();
      recRef.current = null;
    };
  }, []);

  const parar = useCallback(() => {
    recRef.current?.stop();
    setGravando(false);
  }, []);

  const iniciar = useCallback(() => {
    const SR = construtorReconhecimento();
    if (!SR || gravando) return;
    const rec = new SR();
    rec.lang = "pt-BR";
    rec.continuous = false;
    rec.interimResults = true;
    rec.onresult = (e) => {
      let interim = "";
      let final = "";
      for (let i = 0; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) final += r.transcripts[0] ?? "";
        else interim += r.transcripts[0] ?? "";
      }
      if (interim) optsRef.current.onInterim(interim);
      if (final) optsRef.current.onFinal(final);
    };
    rec.onend = () => setGravando(false);
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
    } catch {
      setGravando(false);
    }
  }, [gravando]);

  return { disponivel, gravando, erro, iniciar, parar };
}
