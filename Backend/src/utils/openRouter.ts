import dotenv from 'dotenv';
import { Model, Role, Message, Messages } from '../types';
import { EventEmitter } from 'events';
import { rejects } from 'assert';
dotenv.config();

const MAX_ITERATION_TOKENS = 1000;
const apiKey = process.env.OPENROUTER_API_KEY;
export const sendMessage = async (model: Model, messages: Messages, cb: (chunk: string)=>void) => {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model,
            messages: messages,
            stream: true,
        }),
    });

    const reader = response.body?.getReader();
    if (!reader) {
        throw new Error('Response body is not readable');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
        let iterationTokens = 0;
        while (true) {
            iterationTokens++;
            if(iterationTokens > MAX_ITERATION_TOKENS) {
                break;
            }
            const { done, value } = await reader.read();
            if (done) break;

            // Append new chunk to buffer
            buffer += decoder.decode(value, { stream: true });

            // Process complete lines from buffer
            while (true) {
                const lineEnd = buffer.indexOf('\n');
                if (lineEnd === -1) break;

                const line = buffer.slice(0, lineEnd).trim();
                buffer = buffer.slice(lineEnd + 1);

                if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    if (data === '[DONE]') break;

                    try {
                        const parsed = JSON.parse(data);
                        const content = parsed.choices[0].delta.content;
                        if (content) {
                            cb(content);
                        }
                    } catch (e) {
                        // Ignore invalid JSON
                    }
                }
            }
        }
    } finally {
        reader.cancel();
    }
}


