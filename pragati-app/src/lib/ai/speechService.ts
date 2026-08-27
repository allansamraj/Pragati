export type SupportedLanguage = "en" | "mr" | "hi" | "ta";

export interface SpeechCallbacks {
  onTranscript: (transcript: string, isFinal: boolean) => void;
  onStateChange: (listening: boolean) => void;
  onError: (error: string) => void;
}

export const speechService = {
  recognitionInstance: null as any,

  startListening(
    language: SupportedLanguage,
    callbacks: SpeechCallbacks
  ) {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      callbacks.onError("Speech recognition not supported in this browser");
      return;
    }

    try {
      this.stopListening();

      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;

      const langMap: Record<SupportedLanguage, string> = {
        en: "en-IN",
        mr: "mr-IN",
        hi: "hi-IN",
        ta: "ta-IN",
      };
      rec.lang = langMap[language] || "en-IN";

      rec.onstart = () => {
        callbacks.onStateChange(true);
      };

      rec.onresult = (event: any) => {
        let interim = "";
        let final = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const trans = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += trans;
          } else {
            interim += trans;
          }
        }

        callbacks.onTranscript(final || interim, Boolean(final));
      };

      rec.onerror = (e: any) => {
        if (e.error !== "no-speech") {
          callbacks.onError(e.error);
        }
        callbacks.onStateChange(false);
      };

      rec.onend = () => {
        callbacks.onStateChange(false);
      };

      rec.start();
      this.recognitionInstance = rec;
    } catch (err: any) {
      callbacks.onError(err?.message || "Recognition start failed");
    }
  },

  stopListening() {
    if (this.recognitionInstance) {
      try {
        this.recognitionInstance.stop();
      } catch {}
      this.recognitionInstance = null;
    }
  },

  speak(
    text: string,
    language: SupportedLanguage,
    onStart?: () => void,
    onEnd?: () => void
  ) {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      if (onStart) onStart();
      setTimeout(() => {
        if (onEnd) onEnd();
      }, 3500);
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const clean = text.replace(/[*#_`]/g, "").replace(/\n+/g, ". ");
      const utterance = new SpeechSynthesisUtterance(clean);

      const langMap: Record<SupportedLanguage, string> = {
        en: "en-IN",
        mr: "mr-IN",
        hi: "hi-IN",
        ta: "ta-IN",
      };
      utterance.lang = langMap[language] || "en-IN";
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        if (onStart) onStart();
      };
      utterance.onend = () => {
        if (onEnd) onEnd();
      };
      utterance.onerror = () => {
        if (onEnd) onEnd();
      };

      window.speechSynthesis.speak(utterance);
    } catch {
      if (onStart) onStart();
      setTimeout(() => {
        if (onEnd) onEnd();
      }, 3500);
    }
  },

  stopSpeaking() {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  },
};
