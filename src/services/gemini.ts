import { GoogleGenAI, FunctionDeclaration, Type, ThinkingLevel, Modality } from "@google/genai";
import { themes, ThemeId } from "../lib/themes";

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const SYSTEM_INSTRUCTIONS: Record<ThemeId, string> = {
  'big-muddy': `
    You are Delta Dawn, the unified AI operator for Chase Pierson's Big Muddy Touring entity.
    Your tone is Southern, sharp, anti-corporate, and hospitality-warm.
    You think in terms of systems and leverage.
    Aesthetic: Iron & Earth.
    Focus: Music touring, hospitality, artist roster.
    Data Source: Scout Database (Tour Routing, Raw Intel, The Roster).
  `,
  'scan2plan': `
    You are the S2P Operator, an AI specialist for Scan2Plan.
    Your tone is technical, precise, enterprise-focused, and efficient.
    Aesthetic: Professional, Clean Blue.
    Focus: 3D scanning, building documentation, lead pipeline, pricing.
    Data Source: Pricing matrices, project tracker.
  `,
  'dt27': `
    You are the Chief of Staff for DT27 Command.
    Your tone is strategic, financial, authoritative, and high-level.
    Aesthetic: Iron Clad, Navy & Money Green.
    Focus: Master ledger, income, expenses, debt, taxes, portfolio strategy.
    Data Source: Master Ledger.
  `
};

const createTaskTool: FunctionDeclaration = {
  name: "createTask",
  description: "Create a new task in the project management system.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: {
        type: Type.STRING,
        description: "The title of the task.",
      },
      assignee: {
        type: Type.STRING,
        description: "The person assigned to the task (e.g., Chase, Ari).",
      },
      priority: {
        type: Type.STRING,
        description: "Priority level: High, Medium, or Low.",
        enum: ["High", "Medium", "Low"],
      },
      dueDate: {
        type: Type.STRING,
        description: "Due date in YYYY-MM-DD format.",
      },
    },
    required: ["title", "assignee", "priority"],
  },
};

export interface ChatConfig {
  useReasoning?: boolean;
  useSearch?: boolean;
  useMaps?: boolean;
}

export async function sendMessageToGemini(
  history: { role: 'user' | 'model', text: string }[], 
  message: string,
  themeId: ThemeId,
  chatConfig: ChatConfig = {},
  onToolCall?: (toolName: string, args: any) => void
) {
  try {
    const systemInstruction = SYSTEM_INSTRUCTIONS[themeId] || SYSTEM_INSTRUCTIONS['big-muddy'];
    
    // Select model based on config
    let modelName = "gemini-3-flash-preview"; // Default for general tasks
    if (chatConfig.useReasoning) {
      modelName = "gemini-3-pro-preview";
    } else if (chatConfig.useMaps) {
      modelName = "gemini-2.5-flash"; // Maps only on 2.5 Flash
    }

    const tools: any[] = [{ functionDeclarations: [createTaskTool] }];
    if (chatConfig.useSearch) tools.push({ googleSearch: {} });
    if (chatConfig.useMaps) tools.push({ googleMaps: {} });

    const config: any = {
      systemInstruction,
      tools,
    };

    if (chatConfig.useReasoning) {
      config.thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH, thinkingBudget: 32768 };
    }

    const chat = ai.chats.create({
      model: modelName,
      config,
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }],
      })),
    });

    const result = await chat.sendMessage({ message });
    
    // Check for tool calls
    const functionCalls = result.functionCalls;
    if (functionCalls && functionCalls.length > 0) {
      const call = functionCalls[0];
      if (call.name === 'createTask' && onToolCall) {
        onToolCall(call.name, call.args);
        return `I've created the task: "${call.args.title}" assigned to ${call.args.assignee}.`;
      }
    }

    return result.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm having trouble connecting to the neural link. Please try again.";
  }
}

// --- Image Generation (Pro) ---
export async function generateProImage(prompt: string, themeId: ThemeId, size: '1K' | '2K' | '4K' = '1K', aspectRatio: string = '16:9') {
  try {
    const theme = themes[themeId];
    const enhancedPrompt = `${prompt}. Style: ${theme.vibe}. Colors: ${theme.colors.primary}, ${theme.colors.accent}.`;
    
    // Check for API key selection for Veo/Pro Image
    if (window.aistudio && window.aistudio.hasSelectedApiKey) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await window.aistudio.openSelectKey();
        // Wait a moment or throw to retry
        throw new Error("Please select an API key to proceed.");
      }
    }

    // Re-init AI with potentially new key if needed, but for now assume global key or injected key works
    // For Pro Image we need to use the specific model
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { parts: [{ text: enhancedPrompt }] },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
          imageSize: size
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Pro Image Gen Error:", error);
    throw error;
  }
}

// --- Video Generation (Veo) ---
export async function generateVideo(prompt: string, aspectRatio: '16:9' | '9:16' = '16:9') {
  try {
    if (window.aistudio && window.aistudio.hasSelectedApiKey) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await window.aistudio.openSelectKey();
        throw new Error("Please select an API key to proceed.");
      }
    }

    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt,
      config: {
        numberOfVideos: 1,
        resolution: '1080p',
        aspectRatio
      }
    });

    // Poll for completion
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await ai.operations.getVideosOperation({ operation });
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (videoUri) {
      // Fetch the actual video bytes using the API key
      const res = await fetch(videoUri, {
        headers: { 'x-goog-api-key': process.env.GEMINI_API_KEY || '' }
      });
      const blob = await res.blob();
      return URL.createObjectURL(blob);
    }
    return null;
  } catch (error) {
    console.error("Veo Error:", error);
    throw error;
  }
}

// --- Image Editing (Flash Image) ---
export async function editImage(base64Image: string, prompt: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/png', data: base64Image.split(',')[1] } },
          { text: prompt }
        ]
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image Edit Error:", error);
    throw error;
  }
}

// --- Audio Transcription ---
export async function transcribeAudio(base64Audio: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'audio/wav', data: base64Audio } },
          { text: "Transcribe this audio." }
        ]
      }
    });
    return response.text;
  } catch (error) {
    console.error("Transcription Error:", error);
    throw error;
  }
}

// --- TTS ---
export async function generateSpeech(text: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return `data:audio/mp3;base64,${base64Audio}`;
    }
    return null;
  } catch (error) {
    console.error("TTS Error:", error);
    throw error;
  }
}
