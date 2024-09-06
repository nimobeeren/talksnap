// Generated with ChatGPT: https://chatgpt.com/share/a8a41e3e-ac10-4025-87aa-5b9c576a0217
// Based on Web IDL from: https://docs.google.com/document/d/1VG8HIyz361zGduWgNG7R_R8Xkv0OOJ8b5C9QKeCjU0c/edit?usp=sharing

interface Window {
  readonly ai: AI;
}

interface WorkerGlobalScope {
  readonly ai: AI;
}

interface AI {
  readonly assistant: AIAssistantFactory;
}

interface AICreateMonitor extends EventTarget {
  ondownloadprogress: ((this: AICreateMonitor, ev: Event) => any) | null;
}

type AICreateMonitorCallback = (monitor: AICreateMonitor) => void;

type AICapabilityAvailability = "readily" | "after-download" | "no";

// Assistant

interface AIAssistantFactory {
  create(options?: AIAssistantCreateOptions): Promise<AIAssistant>;
  capabilities(): Promise<AIAssistantCapabilities>;
}

interface AIAssistant extends EventTarget {
  prompt(input: string, options?: AIAssistantPromptOptions): Promise<string>;
  promptStreaming(input: string, options?: AIAssistantPromptOptions): ReadableStream<string>;

  countPromptTokens(input: string, options?: AIAssistantPromptOptions): Promise<number>;
  readonly maxTokens: number;
  readonly tokensSoFar: number;
  readonly tokensLeft: number;
  readonly topK: number;
  readonly temperature: number;

  clone(): Promise<AIAssistant>;
  destroy(): void;
}

interface AIAssistantCapabilities {
  readonly available: AICapabilityAvailability;

  readonly defaultTopK: number | null;
  readonly maxTopK: number | null;
  readonly defaultTemperature: number | null;
}

interface AIAssistantCreateOptions {
  signal?: AbortSignal;
  monitor?: AICreateMonitorCallback;

  systemPrompt?: string;
  initialPrompts?: AIAssistantPrompt[];
  topK?: number;
  temperature?: number;
}

interface AIAssistantPrompt {
  role: AIAssistantPromptRole;
  content: string;
}

interface AIAssistantPromptOptions {
  signal?: AbortSignal;
}

type AIAssistantPromptRole = "system" | "user" | "assistant";
