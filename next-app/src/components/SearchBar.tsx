'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Search, Mic, MicOff } from 'lucide-react';

// ---------------------------------------------------------------------------
// SpeechRecognition type shim (not in standard TS lib)
// ---------------------------------------------------------------------------

interface ISpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => ISpeechRecognition;
    webkitSpeechRecognition?: new () => ISpeechRecognition;
  }
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  defaultValue?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SearchBar({
  onSearch,
  placeholder = 'Search products, box styles, use cases…',
  defaultValue = '',
}: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue);
  const [isListening, setIsListening] = useState(false);
  const [hasSpeechSupport, setHasSpeechSupport] = useState(false);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  // Detect SpeechRecognition support on mount (client-only)
  useEffect(() => {
    const SpeechRecognitionCtor =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;
    setHasSpeechSupport(Boolean(SpeechRecognitionCtor));
  }, []);

  // ---------------------------------------------------------------------------
  // Voice search
  // ---------------------------------------------------------------------------

  const startListening = useCallback(() => {
    const SpeechRecognitionCtor =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) return;

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      onSearch(transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [onSearch]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const toggleVoice = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // ---------------------------------------------------------------------------
  // Form submit
  // ---------------------------------------------------------------------------

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      onSearch(query.trim());
    },
    [onSearch, query]
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className="flex w-full items-center overflow-hidden rounded-2xl border border-stone-200 dark:border-stone-800 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md shadow-md transition-shadow focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-400/20"
    >
      {/* Search icon */}
      <span className="flex shrink-0 items-center pl-4 text-stone-900 dark:text-white" aria-hidden="true">
        <Search className="h-5 w-5" />
      </span>

      {/* Text input */}
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={isListening ? 'Listening for packaging keywords…' : placeholder}
        aria-label="Search"
        className="min-w-0 flex-1 bg-transparent px-3.5 py-3 text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 outline-none"
      />

      {/* Voice button */}
      {hasSpeechSupport && (
        <button
          type="button"
          onClick={toggleVoice}
          aria-label={isListening ? 'Stop voice search' : 'Start voice search'}
          className={`flex shrink-0 items-center justify-center px-3 py-3 transition-colors ${
            isListening
              ? 'text-red-500 hover:text-red-600'
              : 'text-stone-900 dark:text-white hover:opacity-80'
          }`}
        >
          {isListening ? (
            <MicOff className="h-4 w-4 animate-pulse text-red-500" />
          ) : (
            <Mic className="h-4 w-4" />
          )}
        </button>
      )}

      {/* Submit button */}
      <button
        type="submit"
        aria-label="Search"
        className="flex shrink-0 items-center justify-center bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-5 py-3 text-sm transition-colors"
      >
        Search
      </button>
    </form>
  );
}
