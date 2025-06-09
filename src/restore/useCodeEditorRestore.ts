import { CodeEditorState } from "./../types/index";
import { LANGUAGE_CONFIG } from "@/app/(root)/_constants";
import { create } from "zustand";
import { Monaco } from "@monaco-editor/react";

const DEFAULT_LANGUAGE = "javascript";
const DEFAULT_THEME = "vs-dark";
const DEFAULT_FONT_SIZE = 16;

const isValidLanguage = (
  lang: string
): lang is keyof typeof LANGUAGE_CONFIG => {
  return lang in LANGUAGE_CONFIG;
};

const getInitialState = () => {
  if (typeof window === "undefined") {
    return {
      language: DEFAULT_LANGUAGE,
      fontSize: DEFAULT_FONT_SIZE,
      theme: DEFAULT_THEME,
    };
  }

  const storedLanguage =
    localStorage.getItem("editor-language") || DEFAULT_LANGUAGE;
  const language = isValidLanguage(storedLanguage)
    ? storedLanguage
    : DEFAULT_LANGUAGE;

  const savedTheme = localStorage.getItem("editor-theme") || DEFAULT_THEME;
  const savedFontSize = parseInt(
    localStorage.getItem("editor-font-size") || `${DEFAULT_FONT_SIZE}`
  );

  return {
    language,
    theme: savedTheme,
    fontSize: savedFontSize,
  };
};

export const useCodeEditorRestore = create<CodeEditorState>((set, get) => {
  const initialState = getInitialState();

  return {
    ...initialState,
    output: "",
    isRunning: false,
    error: null,
    editor: null,
    executionResult: null,

    getCode: () => get().editor?.getValue() || "",

    setEditor: (editor: Monaco) => {
      const savedCode = localStorage.getItem(`editor-code-${get().language}`);
      if (savedCode) editor.setValue(savedCode);
      set({ editor });
    },

    setTheme: (theme: string) => {
      localStorage.setItem("editor-theme", theme);
      set({ theme });
    },

    setFontSize: (fontSize: number) => {
      localStorage.setItem("editor-font-size", fontSize.toString());
      set({ fontSize });
    },

    setLanguage: (language: string) => {
      if (!isValidLanguage(language)) {
        console.warn(
          `Invalid language selected: ${language}. Falling back to default.`
        );
        language = DEFAULT_LANGUAGE;
      }

      const currentCode = get().editor?.getValue();
      if (currentCode) {
        localStorage.setItem(`editor-code-${get().language}`, currentCode);
      }

      localStorage.setItem("editor-language", language);

      set({
        language,
        output: "",
        error: null,
      });
    },

    runCode: async () => {},
  };
});

export const getExecutionResult = () =>
  useCodeEditorRestore.getState().executionResult;
