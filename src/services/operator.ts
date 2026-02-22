/**
 * Operator Service — Routes business/C-Suite queries through velvet-grit's /api/operator.
 * This gives the wrapper access to Delta Dawn's 20-tool orchestration layer,
 * C-Suite persona delegation, task dispatch, and all business data.
 *
 * Media capabilities (image gen, video, TTS) stay in gemini.ts using AI Studio's native SDK.
 */

const OPERATOR_URL = import.meta.env.VITE_OPERATOR_URL || 'https://velvet-grit--dogteam27.us-east4.hosted.app';

export interface OperatorResponse {
    message: string;
    toolsUsed?: string[];
    rounds?: number;
    conversationId: string;
    persona?: string;
    domainViolation?: string;
}

/**
 * Send a message to the operator endpoint as Delta Dawn (Chief of Staff).
 * Dawn has access to all business tools + can delegate to other C-Suite personas.
 */
export async function sendMessageToOperator(
    message: string,
    history: { role: 'user' | 'assistant'; content: string }[] = [],
    conversationId?: string,
): Promise<OperatorResponse> {
    const res = await fetch(`${OPERATOR_URL}/api/operator`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            message,
            persona: 'Delta Dawn',
            history,
            conversationId: conversationId || `studio-${Date.now()}`,
        }),
        signal: AbortSignal.timeout(60000), // 60s — delegation can take time
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Operator error (${res.status}): ${err}`);
    }

    return res.json();
}
