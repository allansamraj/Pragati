import { ChatMessage, UserRole, AssistantLanguage } from "./types";
import { generateAssistantResponse } from "./mockAIResponse";
import { getAssistantConfig } from "./roleContext";

const STORAGE_PREFIX = "pragati_assist_history_";

export const aiService = {
  getHistory(role: UserRole): ChatMessage[] {
    if (typeof window === "undefined") return [];
    try {
      const data = localStorage.getItem(`${STORAGE_PREFIX}${role}`);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // Fallback
    }

    // Default Initial Welcome Message for the role
    const config = getAssistantConfig(role);
    const initialMsg: ChatMessage = {
      id: `welcome-${role}`,
      sender: "assistant",
      text: config.welcomeMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      role,
      suggestedPrompts: config.suggestedActions,
    };
    return [initialMsg];
  },

  saveHistory(role: UserRole, messages: ChatMessage[]): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${role}`, JSON.stringify(messages.slice(-30))); // retain last 30
    } catch {
      // LocalStorage full or private browsing
    }
  },

  clearHistory(role: UserRole): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(`${STORAGE_PREFIX}${role}`);
    } catch {}
  },

  async sendMessage(
    query: string,
    role: UserRole,
    language: AssistantLanguage = "en"
  ): Promise<ChatMessage> {
    // Simulate natural AI thinking time (300-600ms) for realistic UX
    await new Promise((resolve) => setTimeout(resolve, 350));

    // In production this can fetch from /api/ai/chat with OpenRouter gateway
    try {
      return await generateAssistantResponse(query, role, language);
    } catch (err) {
      return {
        id: `err-${Date.now()}`,
        sender: "assistant",
        text: "PRAGATI Assist is currently operating in offline-resilient mode. Core healthcare navigation functions remain fully operational.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        role,
        language,
        suggestedPrompts: ["Find Care", "Check My Token", "Emergency Help"],
      };
    }
  },
};
