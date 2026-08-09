import { useCallback, useEffect, useRef, useState } from "react";
import { limparTextoParaVoz } from "@/lib/voz";

export function useSpeechOutput() {
  const [disponivel, setDisponivel] = useState(false);
  const [falando, setFalando] = useState(false);
  const vozRef = useRef<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    setDisponivel(true);
    const carregar = () => {
      const vozes = window.speechSynthesis.getVoices();
      vozRef.current =
        vozes.find((v) => v.lang.toLowerCase().startsWith("pt") && v.localService) ??
        vozes.find((v) => v.lang.toLowerCase().startsWith("pt")) ??
        null;
    };
    carregar();
    window.speechSynthesis.addEventListener("voiceschanged", carregar);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", carregar);
  }, []);

  const parar = useCallback(() => {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setFalando(false);
  }, []);

  const falar = useCallback((texto: string) => {
    if (!("speechSynthesis" in window)) return;
    const limpo = limparTextoParaVoz(texto);
    if (!limpo) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(limpo);
    if (vozRef.current) u.voice = vozRef.current;
    u.lang = "pt-BR";
    u.rate = 0.95;
    u.onend = () => setFalando(false);
    u.onerror = () => setFalando(false);
    setFalando(true);
    window.speechSynthesis.speak(u);
  }, []);

  return { disponivel, falando, falar, parar };
}
