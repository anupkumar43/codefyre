import { CodeEditorState } from "./../types/index";
import { LANGUAGE_CONFIG } from "@/app/(root)/_constants";
import { create } from "zustand";
import type { editor as MonacoEditor } from "monaco-editor"; // Correct type import

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

export const useCodeEditorRestore = create<
  CodeEditorState & {
    editor: MonacoEditor.IStandaloneCodeEditor | null;
    setEditor: (editor: MonacoEditor.IStandaloneCodeEditor) => void;
  }
>((set, get) => {
  const initialState = getInitialState();

  return {
    ...initialState,
    output: "",
    isRunning: false,
    error: null,
    editor: null,
    executionResult: null,

    getCode: () => get().editor?.getValue() || "",

    setEditor: (editor: MonacoEditor.IStandaloneCodeEditor) => {
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

    runCode: async () => {
      const { language, getCode } = get();
      const code = getCode();

      if (!code) {
        set({ error: "Please enter some code" });
        return;
      }

      set({ isRunning: true, error: null, output: "" });

      try {
        const runtime = LANGUAGE_CONFIG[language].pistonRuntime;
        const response = await fetch("https://emkc.org/api/v2/piston/execute", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            language: runtime.language,
            version: runtime.version,
            files: [{ content: code }],
          }),
        });

        const data = await response.json();

        if (data.message) {
          set({
            error: data.message,
            executionResult: { code, output: "", error: data.message },
          });
          return;
        }

        if (data.compile && data.compile.code !== 0) {
          const error = data.compile.stderr || data.compile.output;
          set({
            error,
            executionResult: {
              code,
              output: "",
              error,
            },
          });
          return;
        }

        if (data.run && data.run.code !== 0) {
          const error = data.run.stderr || data.run.output;
          set({
            error,
            executionResult: {
              code,
              output: "",
              error,
            },
          });
          return;
        }

        // Successful execution
        const output = data.run.output;

        set({
          output: output.trim(),
          error: null,
          executionResult: {
            code,
            output: output.trim(),
            error: null,
          },
        });
      } catch (error) {
        console.error("Error running code:", error);
        set({
          error: "Error running code",
          executionResult: { code, output: "", error: "Error running code" },
        });
      } finally {
        set({ isRunning: false });
      }
    },
  };
});

export const getExecutionResult = () =>
  useCodeEditorRestore.getState().executionResult;
