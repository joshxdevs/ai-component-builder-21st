// src/App.tsx
// purpose: main app shell with state management, openai integration, and 3-panel layout

import { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import type { GenerationState, GalleryState } from './types';
import { Sidebar } from './prompt-input';
import { PreviewPanel } from './preview-panel';
import { GoogleGenerativeAI } from '@google/generative-ai';

// strip markdown fences and import/export lines from ai response
const cleanGeneratedCode = (raw: string): string => {
  let code = raw.trim();
  code = code.replace(/^```(?:jsx|tsx|javascript|typescript)?\s*\n?/i, '');
  code = code.replace(/\n?```\s*$/i, '');
  code = code.replace(/^import\s+.*;\s*\n?/gm, '');
  code = code.replace(/^export\s+(default\s+)?/gm, '');
  const fnMatch = code.match(/(?:function|const)\s+\w+\s*(?:=\s*)?(?:\([^)]*\)\s*(?:=>)?\s*)?[({]\s*\n?\s*return\s*\(\s*\n?([\s\S]*?)\n?\s*\)\s*;?\s*\n?\s*[})]\s*;?\s*$/);
  if (fnMatch?.[1]) {
    code = fnMatch[1].trim();
  }
  return code.trim();
};

const extractTitle = (prompt: string): string => {
  const words = prompt.split(/\s+/).slice(0, 6).join(' ');
  return words.length > 50 ? words.slice(0, 50) + '...' : words;
};

export const App = () => {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('openai_api_key') ?? '');
  const [generationState, setGenerationState] = useState<GenerationState>({ status: 'idle' });
  const [galleryState] = useState<GalleryState>({ status: 'idle' });
  const [isSaving] = useState(false);


const handleGenerate = useCallback(async (prompt: string) => {
  if (!apiKey) return;
  setGenerationState({ status: 'loading' });

  try {
    const ai = new GoogleGenAI({ apiKey });

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          config: {
            systemInstruction:
              "You are an expert frontend developer. Generate clean, self-contained JSX code only — no imports, no exports, no markdown. Return only the JSX markup.",
          },
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
        });
    

    const raw = response.text ?? "";
    const code = cleanGeneratedCode(raw);

    if (!code) {
      setGenerationState({ status: 'error', message: 'No code was generated. Try a different prompt.' });
      return;
    }

    setGenerationState({ status: 'success', code, prompt });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Generation failed';
    setGenerationState({ status: 'error', message });
  }
}, [apiKey]);

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      {/* left sidebar */}
      <Sidebar
        onGenerate={handleGenerate}
        isLoading={generationState.status === 'loading'}
        apiKey={apiKey}
        onApiKeySave={setApiKey}
      />

      {/* center - shows state for now */}
      <div className="flex-1 flex items-center justify-center p-8">
        {generationState.status === 'idle' && (
          <p className="text-gray-500">Describe a component to generate code</p>
        )}
        {generationState.status === 'loading' && (
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-400">Generating...</p>
          </div>
        )}
        {generationState.status === 'error' && (
          <p className="text-red-400">{generationState.message}</p>
        )}
        {generationState.status === 'success' && (
          <div className="max-w-2xl w-full">
            <p className="text-sm text-gray-400 mb-2">Generated code (preview coming in Class 4):</p>
            <pre className="bg-gray-900 p-4 rounded-lg text-sm text-green-400 overflow-auto max-h-96">
              {generationState.code}
            </pre>
          </div>
        )}
      </div>

      {/* right sidebar placeholder */}
      <aside className="w-48 bg-gray-900 border-l border-gray-800 flex items-center justify-center">
        <p className="text-xs text-gray-500">Gallery - Class 5</p>
      </aside>
    </div>
  );
}