import { NextRequest, NextResponse } from "next/server";
import { generateAssistantResponse } from "@/lib/ai/mockAIResponse";
import { UserRole, AssistantLanguage } from "@/lib/ai/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, role = "patient", language = "en" } = body as {
      query: string;
      role: UserRole;
      language: AssistantLanguage;
    };

    if (!query) {
      return NextResponse.json({ error: "Query is required." }, { status: 400 });
    }

    const openRouterApiKey = process.env.OPENROUTER_API_KEY;

    if (openRouterApiKey) {
      // Production OpenRouter LLM Call Bridge
      const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openRouterApiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://pragati.health",
          "X-Title": "PRAGATI Healthcare Platform",
        },
        body: JSON.stringify({
          model: "anthropic/claude-3.5-sonnet",
          messages: [
            {
              role: "system",
              content: `You are PRAGATI Assist, a role-aware public healthcare navigation assistant for Maharashtra, India. Current Role: ${role}. Language: ${language}. Always adhere to role permissions. Do not diagnose. For emergencies, recommend calling 108.`,
            },
            {
              role: "user",
              content: query,
            },
          ],
        }),
      });

      if (openRouterResponse.ok) {
        const data = await openRouterResponse.json();
        const responseText = data.choices?.[0]?.message?.content;
        return NextResponse.json({
          id: `openrouter-${Date.now()}`,
          sender: "assistant",
          text: responseText,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          role,
          language,
        });
      }
    }

    // Default High-Performance Local Clinical & Operational Engine
    const result = generateAssistantResponse(query, role, language);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message || "Failed to process PRAGATI Assist request.",
      },
      { status: 500 }
    );
  }
}
