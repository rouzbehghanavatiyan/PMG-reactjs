import express from 'express';
import path from 'path';
import fs from 'fs';
import pg from 'pg';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { GoogleGenAI } from "@google/genai";
import pdfParse from 'pdf-parse/lib/pdf-parse.js';

dotenv.config();

const app = express();
app.use(express.json({ limit: '200mb' }));

// Enable CORS for all origins, methods, and headers
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || '5s3tGQvTw0qwwRyaB48tdoMVVZtBNZoiRYl05ikFJOs';

// Setup Google GenAI client
let googleAi: GoogleGenAI | null = null;
function getGoogleAiClient(): GoogleGenAI {
    if (!googleAi) {
        const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
        googleAi = new GoogleGenAI({
            apiKey: apiKey,
            httpOptions: {
                headers: {
                    'User-Agent': 'aistudio-build',
                }
            }
        });
    }
    return googleAi;
}

// ----------------------------------------------------
// AVALAI & CASCADE PATHWAY ROUTING ARCHITECTURE HELPERS
// ----------------------------------------------------

function getAvalAiApiKey(useGoogleOriginal: boolean = false): string {
    if (useGoogleOriginal) {
        return process.env.GEMINI_API_KEY || process.env.API_KEY || '';
    }
    return process.env.AVALAI_API_KEY || '';
}

let cachedAvalAi: GoogleGenAI | null = null;
let cachedKey: string | null = null;

function getAvalAiClient(useGoogleOriginal: boolean = false): GoogleGenAI {
    if (useGoogleOriginal) {
        return getGoogleAiClient();
    }
    const apiKey = getAvalAiApiKey(false);
    if (!cachedAvalAi || cachedKey !== apiKey) {
        cachedKey = apiKey;
        cachedAvalAi = new GoogleGenAI({
            apiKey: apiKey,
            apiVersion: 'v1beta',
            httpOptions: {
                baseUrl: 'https://api.avalai.ir',
                apiVersion: 'v1beta',
                headers: {
                    'User-Agent': 'aistudio-build',
                    'Authorization': `Bearer ${apiKey}`,
                    'x-goog-api-key': apiKey,
                }
            }
        });
    }
    return cachedAvalAi;
}

// Bulletproof helper to perform embeddings exclusively via https://api.avalai.ir or raw Google
async function getActivePathwayConfig() {
    try {
        const result = await pool.query("SELECT value FROM app_settings WHERE key = 'ai_features'");
        if (result.rowCount && result.rowCount > 0) {
            let val = result.rows[0].value;
            if (typeof val === 'string') {
                try { val = JSON.parse(val); } catch (e) {}
            }
             return {
                pathway1_enabled: val.pathway1_enabled !== false,
                pathway2_enabled: val.pathway2_enabled !== false,
                pathway3_enabled: val.pathway3_enabled !== false,
                pathway4_enabled: val.pathway4_enabled !== false,
                preferred_pathway: Number(val.preferred_pathway) || 1,
                use_google_original_endpoint: val.use_google_original_endpoint === true,
                llm_rpm_limit: val.llm_rpm_limit !== undefined ? Number(val.llm_rpm_limit) : 0,
                llm_tpm_limit: val.llm_tpm_limit !== undefined ? Number(val.llm_tpm_limit) : 0,
                embed_rpm_limit: val.embed_rpm_limit !== undefined ? Number(val.embed_rpm_limit) : 0,
                embed_tpm_limit: val.embed_tpm_limit !== undefined ? Number(val.embed_tpm_limit) : 0,
                selected_llm_model: val.selected_llm_model || 'gemini-2.5-flash',
                selected_embed_model: val.selected_embed_model || 'gemini-embedding-001'
            };
        }
    } catch (e) {
        console.warn("[SETTINGS] Error reading active pathway config from DB:", e);
    }
    return {
        pathway1_enabled: true,
        pathway2_enabled: true,
        pathway3_enabled: true,
        pathway4_enabled: true,
        preferred_pathway: 1,
        use_google_original_endpoint: false,
        llm_rpm_limit: 0,
        llm_tpm_limit: 0,
        embed_rpm_limit: 0,
        embed_tpm_limit: 0,
        selected_llm_model: 'gemini-2.5-flash',
        selected_embed_model: 'gemini-embedding-001'
    };
}

let llmRequestTimes: number[] = [];
let llmTokenCounts: { time: number, tokens: number }[] = [];

let embedRequestTimes: number[] = [];
let embedTokenCounts: { time: number, tokens: number }[] = [];

async function checkAndTrackLlmRateLimit(tokens: number, config: any) {
    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;

    llmRequestTimes = llmRequestTimes.filter(t => t > oneMinuteAgo);
    llmTokenCounts = llmTokenCounts.filter(t => t.time > oneMinuteAgo);

    const rpmLimit = config.llm_rpm_limit || 0;
    const tpmLimit = config.llm_tpm_limit || 0;

    if (rpmLimit > 0 && llmRequestTimes.length >= rpmLimit) {
        throw new Error(`LLM Rate Limit Exceeded: Maximum ${rpmLimit} requests per minute.`);
    }

    const currentTokens = llmTokenCounts.reduce((sum, item) => sum + item.tokens, 0);
    if (tpmLimit > 0 && (currentTokens + tokens) > tpmLimit) {
        throw new Error(`LLM Rate Limit Exceeded: Maximum ${tpmLimit} tokens per minute. Current usage in window: ${currentTokens} tokens.`);
    }

    llmRequestTimes.push(now);
    llmTokenCounts.push({ time: now, tokens });
}

async function checkAndTrackEmbedRateLimit(tokens: number, config: any) {
    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;

    embedRequestTimes = embedRequestTimes.filter(t => t > oneMinuteAgo);
    embedTokenCounts = embedTokenCounts.filter(t => t.time > oneMinuteAgo);

    const rpmLimit = config.embed_rpm_limit || 0;
    const tpmLimit = config.embed_tpm_limit || 0;

    if (rpmLimit > 0 && embedRequestTimes.length >= rpmLimit) {
        throw new Error(`Embedding Rate Limit Exceeded: Maximum ${rpmLimit} requests per minute.`);
    }

    const currentTokens = embedTokenCounts.reduce((sum, item) => sum + item.tokens, 0);
    if (tpmLimit > 0 && (currentTokens + tokens) > tpmLimit) {
        throw new Error(`Embedding Rate Limit Exceeded: Maximum ${tpmLimit} tokens per minute. Current usage in window: ${currentTokens} tokens.`);
    }

    embedRequestTimes.push(now);
    embedTokenCounts.push({ time: now, tokens });
}

async function addFallbackLog(endpoint: string, modelRequested: string, errorExperienced: string, actionTaken: string) {
    try {
        await pool.query(
            "INSERT INTO ai_fallback_logs (endpoint, model_requested, error_experienced, action_taken) VALUES ($1, $2, $3, $4)",
            [endpoint, modelRequested, errorExperienced, actionTaken]
        );
    } catch (err: any) {
        console.error("[Fallback Log DB Error]", err.message);
    }
}

async function getAvalAIEmbedding(contents: string, model: string = 'gemini-embedding-001'): Promise<number[]> {
    const config = await getActivePathwayConfig();
    const activeModel = config.selected_embed_model || model;
    const estimatedTokens = Math.max(1, Math.ceil((contents || '').length / 4));
    await checkAndTrackEmbedRateLimit(estimatedTokens, config);

    const useGoogleOriginal = config.use_google_original_endpoint;
    const apiKey = getAvalAiApiKey(useGoogleOriginal);
    const ai = getAvalAiClient(useGoogleOriginal);

    const extractEmbedding = (response: any): number[] | null => {
        if (!response) return null;
        if (response.embedding?.values && Array.isArray(response.embedding.values) && response.embedding.values.length > 0) {
            return response.embedding.values;
        }
        if (response.embedding && Array.isArray(response.embedding) && response.embedding.length > 0) {
            return response.embedding;
        }
        if (response.embeddings && Array.isArray(response.embeddings) && response.embeddings.length > 0) {
            const first = response.embeddings[0];
            if (first?.values && Array.isArray(first.values) && first.values.length > 0) {
                return first.values;
            }
            if (Array.isArray(first) && first.length > 0) {
                return first;
            }
        }
        if (response.values && Array.isArray(response.values) && response.values.length > 0) {
            return response.values;
        }
        if (response.data?.[0]?.embedding && Array.isArray(response.data[0].embedding) && response.data[0].embedding.length > 0) {
            return response.data[0].embedding;
        }
        if (Array.isArray(response) && response.length > 0) {
            return response;
        }
        return null;
    };

    const pathways = [
        {
            id: 1,
            name: 'Path 1: Google GenAI SDK (models.embedContent)',
            enabled: config.pathway1_enabled,
            run: async () => {
                const response = await ai.models.embedContent({
                    model: activeModel,
                    contents: contents,
                });
                const extracted = extractEmbedding(response);
                if (extracted) {
                    return extracted;
                }
                throw new Error(`No values in SDK response. Response Keys: ${Object.keys(response || {})}`);
            }
        },
        {
            id: 2,
            name: 'Path 2: Direct HTTP POST (v1beta embedContent)',
            enabled: config.pathway2_enabled,
            run: async () => {
                const cleanModel = activeModel.startsWith('models/') ? activeModel : `models/${activeModel}`;
                const apiHost = useGoogleOriginal ? 'https://generativelanguage.googleapis.com' : 'https://api.avalai.ir';
                const url = `${apiHost}/v1beta/${cleanModel}:embedContent`;
                const headers: Record<string, string> = {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': apiKey,
                };
                if (!useGoogleOriginal) {
                    headers['Authorization'] = `Bearer ${apiKey}`;
                }
                const res = await fetch(url, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify({
                        content: {
                            parts: [{ text: contents }]
                        }
                    })
                });
                if (res.ok) {
                    const data: any = await res.json();
                    const extracted = extractEmbedding(data);
                    if (extracted) {
                        return extracted;
                    }
                    throw new Error("No values in direct API response structure");
                }
                const errText = await res.text();
                throw new Error(`Direct POST status ${res.status}: ${errText}`);
            }
        },
        {
            id: 3,
            name: 'Path 3: OpenAI v1 Compatible (v1/embeddings)',
            enabled: config.pathway3_enabled,
            run: async () => {
                const apiHost = useGoogleOriginal ? 'https://generativelanguage.googleapis.com/v1beta' : 'https://api.avalai.ir/v1';
                const url = apiHost.endsWith('/v1') ? `${apiHost}/embeddings` : `${apiHost}/v1/embeddings`;
                const headers: Record<string, string> = {
                    'Content-Type': 'application/json',
                };
                if (useGoogleOriginal) {
                    headers['x-goog-api-key'] = apiKey;
                } else {
                    headers['Authorization'] = `Bearer ${apiKey}`;
                }
                const res = await fetch(url, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify({
                        input: contents,
                        model: activeModel
                    })
                });
                if (res.ok) {
                    const data: any = await res.json();
                    const extracted = extractEmbedding(data);
                    if (extracted) {
                        return extracted;
                    }
                    throw new Error("No embedding in OpenAI response structure");
                }
                const errText = await res.text();
                throw new Error(`OpenAI embeddings HTTP status ${res.status}: ${errText}`);
            }
        },
        {
            id: 4,
            name: 'Path 4: Backup Model Embedding (v1beta text-embedding-004 fallback)',
            enabled: config.pathway4_enabled,
            run: async () => {
                const fallbackModel = 'text-embedding-004';
                const cleanModel = fallbackModel.startsWith('models/') ? fallbackModel : `models/${fallbackModel}`;
                const apiHost = useGoogleOriginal ? 'https://generativelanguage.googleapis.com' : 'https://api.avalai.ir';
                const url = `${apiHost}/v1beta/${cleanModel}:embedContent`;
                const headers: Record<string, string> = {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': apiKey,
                };
                if (!useGoogleOriginal) {
                    headers['Authorization'] = `Bearer ${apiKey}`;
                }
                const res = await fetch(url, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify({
                        content: {
                            parts: [{ text: contents }]
                        }
                    })
                });
                if (res.ok) {
                    const data: any = await res.json();
                    const extracted = extractEmbedding(data);
                    if (extracted) {
                        return extracted;
                    }
                    throw new Error("No values in fallback response structure");
                }
                const errText = await res.text();
                throw new Error(`Fallback direct status ${res.status}: ${errText}`);
            }
        }
    ];

    // Filter enabled pathways. If none is enabled, fallback to using all to prevent breakage
    let activePathways = pathways.filter(p => p.enabled);
    if (activePathways.length === 0) {
        activePathways = pathways;
    }

    // Sort pathways to prioritize preferred_pathway
    activePathways.sort((a, b) => {
        if (a.id === config.preferred_pathway) return -1;
        if (b.id === config.preferred_pathway) return 1;
        return a.id - b.id;
    });

    // Execute pathways sequentially in determined order
    for (const pw of activePathways) {
        try {
            const values = await pw.run();
            if (values && values.length > 0) {
                return values;
            }
        } catch (err: any) {
            console.warn(`[Embedding Cascade] ${pw.name} failed:`, err.message || err);
        }
    }

    return [];
}

// Call AvalAI API Endpoint with robust 4-tier Cascade Fallbacks of varying formats as requested.
// Directs all AI usage to api.avalai.ir in Google GenAI SDK format, Direct HTTP POST v1beta format, and OpenAI v1 standard format.
async function callAvalAI(messages: any[], model: string = 'gemini-2.5-flash', maxTokens: number = 4000, temperature: number = 0.7): Promise<any> {
    const config = await getActivePathwayConfig();
    const useGoogleOriginal = config.use_google_original_endpoint;
    const apiKey = getAvalAiApiKey(useGoogleOriginal);
    let currentModel = config.selected_llm_model || model;
    let fallbackNote: string | null = null;
    let success = false;
    let textResult = '';

    // Convert messages to Google SDK contents structure
    let systemInstruction = '';
    const contents: any[] = [];
    for (const msg of messages) {
        if (msg.role === 'system') {
            systemInstruction += (systemInstruction ? '\n' : '') + (typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content));
        } else {
            const role = msg.role === 'assistant' || msg.role === 'model' ? 'model' : 'user';
            const parts: any[] = [];
            if (typeof msg.content === 'string') {
                parts.push({ text: msg.content });
            } else if (Array.isArray(msg.content)) {
                for (const item of msg.content) {
                    if (item.type === 'text') {
                        parts.push({ text: item.text });
                    } else if (item.type === 'image_url' && item.image_url?.url) {
                        const match = item.image_url.url.match(/^data:([^;]+);base64,(.+)$/);
                        if (match) {
                            parts.push({
                                inlineData: {
                                    mimeType: match[1],
                                    data: match[2]
                                }
                            });
                        }
                    }
                }
            }
            contents.push({ role, parts });
        }
    }

    const rawInputText = JSON.stringify(contents) + systemInstruction;
    const estimatedTokens = Math.max(1, Math.ceil(rawInputText.length / 4));
    await checkAndTrackLlmRateLimit(estimatedTokens, config);

    const pathways = [
        {
            id: 1,
            name: 'Path 1: SDK Format (generateContent)',
            enabled: config.pathway1_enabled,
            run: async () => {
                const label = useGoogleOriginal ? 'Path 1 (Google Original SDK)' : 'Path 1 (SDK Format)';
                console.log(`[Cascade AI] Path 1: Attempting Google GenAI SDK generateContent call via model: ${currentModel}`);
                const ai = getAvalAiClient(useGoogleOriginal);
                const response = await ai.models.generateContent({
                    model: currentModel,
                    contents: contents,
                    config: {
                        systemInstruction: systemInstruction || undefined,
                        temperature: temperature,
                    }
                });
                if (response.text) {
                    return { text: response.text, label };
                }
                throw new Error("SDK response returned empty text");
            }
        },
        {
            id: 2,
            name: 'Path 2: Direct HTTP POST (v1beta/models)',
            enabled: config.pathway2_enabled,
            run: async () => {
                const apiHost = useGoogleOriginal ? 'https://generativelanguage.googleapis.com' : 'https://api.avalai.ir';
                const label = useGoogleOriginal ? 'Path 2 (Google Original HTTP POST)' : 'Path 2 (v1beta HTTP POST)';
                console.log(`[Cascade AI] Path 2: Attempting direct HTTP POST to ${apiHost}/v1beta/models/${currentModel}:generateContent`);
                const cleanModel = currentModel.startsWith('models/') ? currentModel : `models/${currentModel}`;
                const url = `${apiHost}/v1beta/${cleanModel}:generateContent`;
                
                const headers: Record<string, string> = {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': apiKey,
                };
                if (!useGoogleOriginal) {
                    headers['Authorization'] = `Bearer ${apiKey}`;
                }

                const res = await fetch(url, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify({
                        contents: contents,
                        systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
                        generationConfig: {
                            temperature: temperature,
                        }
                    })
                });

                if (res.ok) {
                    const data: any = await res.json();
                    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
                    if (rawText) {
                        return { text: rawText, label };
                    }
                    throw new Error("Direct POST returned empty candidates block");
                }
                const errText = await res.text();
                throw new Error(`Direct POST status ${res.status}: ${errText}`);
            }
        },
        {
            id: 3,
            name: 'Path 3: OpenAI API format (v1/chat/completions)',
            enabled: config.pathway3_enabled,
            run: async () => {
                const apiHost = useGoogleOriginal ? 'https://generativelanguage.googleapis.com/v1beta' : 'https://api.avalai.ir/v1';
                const label = useGoogleOriginal ? 'Path 3 (Google Chat Compatible)' : 'Path 3 (v1 OpenAI format)';
                console.log(`[Cascade AI] Path 3: Attempting OpenAI format on ${apiHost}/chat/completions`);
                const formattedMessages = [];
                if (systemInstruction) {
                    formattedMessages.push({ role: 'system', content: systemInstruction });
                }
                for (const msg of messages) {
                    if (msg.role !== 'system') {
                        formattedMessages.push(msg);
                    }
                }

                const headers: Record<string, string> = {
                    'Content-Type': 'application/json',
                };
                if (useGoogleOriginal) {
                    headers['x-goog-api-key'] = apiKey;
                } else {
                    headers['Authorization'] = `Bearer ${apiKey}`;
                }

                const res = await fetch(`${apiHost}/chat/completions`, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify({
                        model: currentModel,
                        messages: formattedMessages,
                        temperature: temperature,
                        max_tokens: maxTokens
                    })
                });

                if (res.ok) {
                    const data: any = await res.json();
                    const rawText = data.choices?.[0]?.message?.content || '';
                    if (rawText) {
                        return { text: rawText, label };
                    }
                    throw new Error("OpenAI completions returned empty content");
                }
                const errText = await res.text();
                throw new Error(`OpenAI completions status ${res.status}: ${errText}`);
            }
        },
        {
            id: 4,
            name: 'Path 4: Backup Model',
            enabled: config.pathway4_enabled,
            run: async () => {
                const backupModel = useGoogleOriginal ? 'gemini-1.5-flash' : 'gpt-4o-mini';
                const apiHost = useGoogleOriginal ? 'https://generativelanguage.googleapis.com/v1beta' : 'https://api.avalai.ir/v1';
                const label = useGoogleOriginal ? `Backup Model (${backupModel})` : `Backup Model (${backupModel})`;
                console.log(`[Cascade AI] Path 4: Absolute backup model: ${backupModel} on ${apiHost}/chat/completions`);
                const formattedMessages = [];
                if (systemInstruction) {
                    formattedMessages.push({ role: 'system', content: systemInstruction });
                }
                for (const msg of messages) {
                    if (msg.role !== 'system') {
                        formattedMessages.push(msg);
                    }
                }

                const headers: Record<string, string> = {
                    'Content-Type': 'application/json',
                };
                if (useGoogleOriginal) {
                    headers['x-goog-api-key'] = apiKey;
                } else {
                    headers['Authorization'] = `Bearer ${apiKey}`;
                }

                const res = await fetch(`${apiHost}/chat/completions`, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify({
                        model: backupModel,
                        messages: formattedMessages,
                        temperature: temperature,
                        max_tokens: maxTokens
                    })
                });

                if (res.ok) {
                    const data: any = await res.json();
                    const rawText = data.choices?.[0]?.message?.content || '';
                    if (rawText) {
                        return { text: rawText, label };
                    }
                    throw new Error("Backup Model completions returned empty content");
                }
                const errText = await res.text();
                throw new Error(`Backup Model status ${res.status}: ${errText}`);
            }
        }
    ];

    // Filter enabled pathways. If none enabled, fallback to default ordered pathways to prevent breakage
    let activePathways = pathways.filter(p => p.enabled);
    if (activePathways.length === 0) {
        activePathways = pathways;
    }

    // Sort pathways to prioritize preferred_pathway
    activePathways.sort((a, b) => {
        if (a.id === config.preferred_pathway) return -1;
        if (b.id === config.preferred_pathway) return 1;
        return a.id - b.id;
    });

    let currentErrorMsg = 'No active pathways executed';

    // Execute sequentially
    for (const pw of activePathways) {
        try {
            const res = await pw.run();
            textResult = res.text;
            fallbackNote = `Resolved. Pathway: ${res.label}`;
            success = true;
            break;
        } catch (err: any) {
            currentErrorMsg = err.message || JSON.stringify(err);
            console.warn(`[Cascade AI] ${pw.name} failed:`, currentErrorMsg);
            await addFallbackLog(
                `${pw.name} (${currentModel})`,
                currentModel,
                currentErrorMsg,
                'Cascade triggered - trying next pathway'
            );
        }
    }

    if (!success) {
        console.error(`[Cascade AI] Fatal Error: All fallback paths and backup models failed!`, currentErrorMsg);
        await addFallbackLog(
            `Cascade Engine`,
            currentModel,
            currentErrorMsg,
            'All paths failed. Throwing connection exception.'
        );
        throw new Error(`All AvalAI Cascade Paths failed: ${currentErrorMsg}`);
    }

    return {
        choices: [
            {
                message: {
                    role: 'assistant',
                    content: textResult
                }
            }
        ],
        text: textResult,
        fallbackCascadeAlert: fallbackNote
    };
}

// Robust PDF text extraction supporting ESModule, CommonJS, and various bundler formats
async function extractTextFromPdf(buffer: Buffer): Promise<{ text: string, pageCount: number }> {
    let parseFn: any = pdfParse;

    // Fallbacks if pdfParse isn't resolved directly
    if (typeof parseFn !== 'function' && pdfParse && typeof (pdfParse as any).default === 'function') {
        parseFn = (pdfParse as any).default;
    }

    if (typeof parseFn !== 'function') {
        try {
            const requireFn = typeof require !== 'undefined'
                ? require
                : (await import('module')).createRequire(import.meta.url);
            
            const rawInstance = requireFn('pdf-parse');
            if (typeof rawInstance === 'function') {
                parseFn = rawInstance;
            } else if (rawInstance && typeof rawInstance.default === 'function') {
                parseFn = rawInstance.default;
            }
        } catch (err: any) {
            console.warn('[PDF] require fallback failed:', err.message);
        }
    }

    if (typeof parseFn !== 'function') {
        console.error('[PDF] Resolution failed. Details:', {
            importType: typeof pdfParse,
            importKeys: pdfParse ? Object.keys(pdfParse) : [],
        });
        throw new Error('PDF parsing module failed to load correctly on the server.');
    }

    const data = await parseFn(buffer);
    const text = (data?.text || '').replace(/\0/g, '').replace(/\x00/g, '');
    const pageCount = data?.numpages || 1;
    return { text, pageCount };
}

// PostgreSQL connection pool
const poolConfig: any = {
    host: process.env.DB_HOST || '193.186.32.179',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'PersiakhodroApp',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'Hv2My94',
    max: 10,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 10000,
};

if (process.env.DB_SSL === 'true') {
    poolConfig.ssl = { rejectUnauthorized: false };
}

console.log(`[Database] Connecting to PostgreSQL at ${poolConfig.host}:${poolConfig.port}...`);
const pool = new pg.Pool(poolConfig);

// Initialize Tables inside Postgres
async function initDatabase() {
    try {
        const client = await pool.connect();
        console.log(`[Database] Successfully connected to PostgreSQL server.`);
        client.release();

        // Create RAG Documents tables
        await pool.query(`
            CREATE TABLE IF NOT EXISTS rag_documents (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                file_name VARCHAR(255),
                is_deleted BOOLEAN DEFAULT FALSE,
                is_enabled BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        await pool.query(`
            ALTER TABLE rag_documents ADD COLUMN IF NOT EXISTS is_enabled BOOLEAN DEFAULT TRUE;
        `);
        await pool.query(`
            ALTER TABLE rag_documents ADD COLUMN IF NOT EXISTS doc_year INTEGER DEFAULT 2026;
        `);
        await pool.query(`
            ALTER TABLE rag_documents ADD COLUMN IF NOT EXISTS doc_section VARCHAR(100) DEFAULT 'بخش عمومی';
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS rag_document_chunks (
                id SERIAL PRIMARY KEY,
                document_id INTEGER REFERENCES rag_documents(id) ON DELETE CASCADE,
                chunk_index INTEGER,
                content TEXT NOT NULL,
                embedding JSONB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS user_pdf_chats (
                id VARCHAR(100) PRIMARY KEY,
                user_id VARCHAR(255) NOT NULL,
                title VARCHAR(255) NOT NULL,
                active_document_ids JSONB DEFAULT '[]'::jsonb,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                is_deleted BOOLEAN DEFAULT FALSE
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS user_pdf_chat_messages (
                id SERIAL PRIMARY KEY,
                chat_id VARCHAR(100) REFERENCES user_pdf_chats(id) ON DELETE CASCADE,
                role VARCHAR(50) NOT NULL,
                message TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Create app_settings table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS app_settings (
                key VARCHAR(255) PRIMARY KEY,
                value JSONB NOT NULL
            );
        `);

        // Create ai_fallback_logs table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS ai_fallback_logs (
                id SERIAL PRIMARY KEY,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                endpoint VARCHAR(255),
                model_requested VARCHAR(255),
                error_experienced TEXT,
                action_taken VARCHAR(255)
            );
        `);

        // Create Graph RAG tables
        await pool.query(`
            CREATE TABLE IF NOT EXISTS graph_documents (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                file_name VARCHAR(255),
                is_deleted BOOLEAN DEFAULT FALSE,
                is_enabled BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await pool.query(`
            ALTER TABLE graph_documents ADD COLUMN IF NOT EXISTS is_enabled BOOLEAN DEFAULT TRUE;
        `);

        await pool.query(`
            ALTER TABLE graph_documents ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
        `);

        await pool.query(`
            ALTER TABLE graph_documents ADD COLUMN IF NOT EXISTS strict_mode BOOLEAN DEFAULT FALSE;
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS graph_entities (
                id SERIAL PRIMARY KEY,
                document_id INTEGER REFERENCES graph_documents(id) ON DELETE CASCADE,
                name VARCHAR(255) NOT NULL,
                type VARCHAR(100),
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(document_id, name)
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS graph_relationships (
                id SERIAL PRIMARY KEY,
                document_id INTEGER REFERENCES graph_documents(id) ON DELETE CASCADE,
                source_entity VARCHAR(255) NOT NULL,
                target_entity VARCHAR(255) NOT NULL,
                relation_type VARCHAR(100) NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS graph_communities (
                id SERIAL PRIMARY KEY,
                document_id INTEGER REFERENCES graph_documents(id) ON DELETE CASCADE,
                name VARCHAR(255) NOT NULL,
                title VARCHAR(255),
                summary TEXT,
                entities JSONB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS graph_chats (
                id VARCHAR(100) PRIMARY KEY,
                user_id VARCHAR(255) NOT NULL,
                title VARCHAR(255) NOT NULL,
                active_document_ids JSONB DEFAULT '[]'::jsonb,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                is_deleted BOOLEAN DEFAULT FALSE
            );
        `);

        await pool.query(`
            ALTER TABLE graph_chats ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
        `);

        await pool.query(`
            ALTER TABLE graph_chats ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS graph_chat_messages (
                id SERIAL PRIMARY KEY,
                chat_id VARCHAR(100) REFERENCES graph_chats(id) ON DELETE CASCADE,
                role VARCHAR(50) NOT NULL,
                message TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await pool.query(`
            ALTER TABLE user_pdf_chat_messages ADD COLUMN IF NOT EXISTS reaction VARCHAR(10) DEFAULT NULL;
        `);

        await pool.query(`
            ALTER TABLE graph_chat_messages ADD COLUMN IF NOT EXISTS reaction VARCHAR(10) DEFAULT NULL;
        `);

        await pool.query(`
            ALTER TABLE graph_chat_messages ADD COLUMN IF NOT EXISTS subgraph JSONB DEFAULT NULL;
        `);

        await pool.query(`
            ALTER TABLE graph_chat_messages ADD COLUMN IF NOT EXISTS communities JSONB DEFAULT NULL;
        `);

        // Seed default app setting if not present
        await pool.query(`
            INSERT INTO app_settings (key, value)
            VALUES ('ai_features', '{"pathway1_enabled": true, "pathway2_enabled": true, "pathway3_enabled": true, "pathway4_enabled": true, "preferred_pathway": 1, "use_google_original_endpoint": false, "llm_rpm_limit": 0, "llm_tpm_limit": 0, "embed_rpm_limit": 0, "embed_tpm_limit": 0, "selected_llm_model": "gemini-2.5-flash", "selected_embed_model": "gemini-embedding-001"}'::jsonb)
            ON CONFLICT (key) DO NOTHING;
        `);

        console.log("[Database] RAG database tables and settings initialized successfully.");
    } catch (err: any) {
        console.error("[Database] Initialization failed:", err.message);
    }
}

initDatabase().catch(err => {
    console.error("[Database] Error running schema initialization:", err);
});

// Helper for generating vector embedding with gemini-embedding-001 or fallback via AvalAI
async function getGeminiEmbedding(text: string): Promise<number[]> {
    try {
        const values = await getAvalAIEmbedding(text);
        if (values && values.length > 0) {
            return values;
        }
    } catch (err: any) {
        console.warn('[Gemini Embedding Cascade] Cascade failed, falling back to pseudo-embedding:', err.message);
    }
    
    // Pseudo-embedding fallback in case API key is missing/limit exceeded
    const embeddingArray = Array.from({ length: 768 }, (_, idx) => {
        let hash = 0;
        for (let charIdx = 0; charIdx < text.length; charIdx++) {
            hash = (hash << 5) - hash + text.charCodeAt(charIdx);
            hash |= 0;
        }
        return Math.sin(hash + idx) * 0.1;
    });
    return embeddingArray;
}

// Helper to calculate cosine similarity
function cosineSimilarity(vecA: number[], vecB: number[]): number {
    let dotProduct = 0.0;
    let normA = 0.0;
    let normB = 0.0;
    const len = Math.min(vecA.length, vecB.length);
    for (let i = 0; i < len; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Helper to extract filters from query
function autoExtractFilters(query: string) {
    const filters: { year?: number; section?: string } = {};
    if (!query) return filters;
    
    // Replace Persian digits with English digits to handle Persian year queries beautifully
    const cleanQuery = query.replace(/[۰-۹]/g, d => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));
    
    const yearMatch = cleanQuery.match(/(?:سال|year)\s*([12]\d{3})/i);
    if (yearMatch) {
        filters.year = Number(yearMatch[1]);
    }
    
    // Check for sections / chapters / quarters
    if (cleanQuery.includes('فصل اول') || cleanQuery.toLowerCase().includes('chapter 1') || cleanQuery.toLowerCase().includes('q1') || cleanQuery.includes('فصل ۱')) {
        filters.section = 'فصل اول';
    } else if (cleanQuery.includes('فصل دوم') || cleanQuery.toLowerCase().includes('chapter 2') || cleanQuery.toLowerCase().includes('q2') || cleanQuery.includes('فصل ۲')) {
        filters.section = 'فصل دوم';
    } else if (cleanQuery.includes('فصل سوم') || cleanQuery.toLowerCase().includes('chapter 3') || cleanQuery.toLowerCase().includes('q3') || cleanQuery.includes('فصل ۳')) {
        filters.section = 'فصل سوم';
    } else if (cleanQuery.includes('فصل چهارم') || cleanQuery.toLowerCase().includes('chapter 4') || cleanQuery.toLowerCase().includes('q4') || cleanQuery.includes('فصل ۴')) {
        filters.section = 'فصل چهارم';
    }
    
    return filters;
}

// Scorer for BM25-like keyword search
function computeKeywordScores(chunks: any[], query: string): number[] {
    if (!query || chunks.length === 0) return Array(chunks.length).fill(0);
    
    // Clean and split terms
    const cleanQuery = query.toLowerCase().replace(/[^\w\s\u0600-\u06FF]/g, '');
    const terms = cleanQuery.split(/\s+/).filter(t => t.length > 1);
    if (terms.length === 0) return Array(chunks.length).fill(0);

    const N = chunks.length;
    const docTermFreqs = chunks.map(c => {
        const words = (c.content || '').toLowerCase().split(/\s+/);
        const freq: Record<string, number> = {};
        words.forEach(w => {
            freq[w] = (freq[w] || 0) + 1;
        });
        return { freq, docLen: words.length };
    });

    // Compute IDF for each term
    const idf: Record<string, number> = {};
    terms.forEach(term => {
        let n_t = 0;
        docTermFreqs.forEach(dtf => {
            if (dtf.freq[term] || Object.keys(dtf.freq).some(k => k.includes(term))) {
                n_t++;
            }
        });
        idf[term] = Math.log(1 + (N - n_t + 0.5) / (n_t + 0.5));
    });

    // BM25 parameters
    const k1 = 1.5;
    const b = 0.75;
    const avgDocLen = docTermFreqs.reduce((sum, dtf) => sum + dtf.docLen, 0) / (N || 1);

    return chunks.map((chunk, idx) => {
        const dtf = docTermFreqs[idx];
        let score = 0;
        terms.forEach(term => {
            let tf = dtf.freq[term] || 0;
            // Support substring matching for part numbers, specific names or serial numbers
            if (tf === 0) {
                for (const word in dtf.freq) {
                    if (word.includes(term)) {
                        tf += 0.5 * dtf.freq[word];
                    }
                }
            }
            const idfVal = idf[term] || 0;
            const num = tf * (k1 + 1);
            const denom = tf + k1 * (1 - b + b * (dtf.docLen / (avgDocLen || 1)));
            score += idfVal * (num / denom);
        });
        return score;
    });
}

// AI reranking of top chunks
async function rerankCandidates(query: string, candidates: any[]): Promise<any[]> {
    if (candidates.length <= 1) return candidates;
    
    const top20 = candidates.slice(0, 20);
    const rerankPrompt = `
    You are an advanced Cross-Encoder reranking model. Your task is to evaluate and rank the relevance of ${top20.length} text chunks with respect to the user's query.
    
    USER QUERY: "${query}"
    
    Below are the text chunks, each with an ID:
    ${top20.map((c, idx) => `--- CHUNK ID: ${idx} ---\n${c.content}`).join('\n\n')}
    
    INSTRUCTIONS:
    1. Score each chunk from 0 to 100 based on how directly, completely, and accurately it contains information to answer the user's query.
    2. Respond with ONLY a valid JSON array of objects. Do not include any markdown wrapper, commentary, or explanation.
    3. The JSON structure MUST be:
    [
      { "id": 0, "score": 95, "reason": "Brief reason in English" },
      { "id": 1, "score": 40, "reason": "Brief reason in English" }
    ]
    `;

    try {
        const rerankResult = await callAvalAI([
            { role: 'system', content: 'You are a precise JSON ranking engine. Return ONLY raw JSON.' },
            { role: 'user', content: rerankPrompt }
        ], 'gemini-2.5-flash', 1000);
        
        let replyText = rerankResult.text || '';
        replyText = replyText.replace(/```json/g, '').replace(/```/g, '').trim();
        const rankings = JSON.parse(replyText);
        
        if (Array.isArray(rankings)) {
            const ranked = rankings.map((r: any) => {
                const chunk = top20[r.id];
                if (chunk) {
                    return {
                        ...chunk,
                        rerankScore: Number(r.score) || 0,
                        rerankReason: r.reason || ''
                    };
                }
                return null;
            }).filter(Boolean);
            
            ranked.sort((a: any, b: any) => b.rerankScore - a.rerankScore);
            return ranked;
        }
    } catch (err) {
        console.warn('[Reranking failed - falling back to hybrid search score ranking]', err);
    }
    
    return top20;
}

// API Endpoints for PDF RAG System

// 1. Upload PDF
app.post('/api/rag/upload', async (req, res) => {
    const { title, fileName, fileBase64, docYear, docSection } = req.body;
    if (!title || !fileBase64) {
        return res.status(400).json({ error: 'Title and document content are required.' });
    }

    // Set headers for Event-Stream streaming (prevents proxy buffering)
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    const sendEvent = (obj: any) => {
        res.write(`data: ${JSON.stringify(obj)}\n\n`);
    };

    try {
        sendEvent({ event: 'start', message: 'Reading PDF and extracting text...' });

        const buffer = Buffer.from(fileBase64, 'base64');
        const { text, pageCount } = await extractTextFromPdf(buffer);
        
        if (!text.trim()) {
            sendEvent({ event: 'error', error: 'No readable text content could be extracted from this PDF.' });
            return res.end();
        }

        sendEvent({ event: 'parsed', pageCount, message: 'PDF parsed successfully.' });

        // Chunking parameters: 800 characters with 150 characters overlap
        const chunkSize = 800;
        const overlap = 150;
        const chunks: string[] = [];
        
        let curPos = 0;
        while (curPos < text.length) {
            const rawChunk = text.substring(curPos, curPos + chunkSize);
            const chunk = rawChunk.trim();
            if (chunk) chunks.push(chunk);
            curPos += (chunkSize - overlap);
            if (rawChunk.length < chunkSize) break;
        }

        if (chunks.length === 0) {
            sendEvent({ event: 'error', error: 'Failed to chunk document.' });
            return res.end();
        }

        sendEvent({ event: 'chunking', totalChunks: chunks.length, message: `Created ${chunks.length} chunks.` });

        // Save doc
        const docResult = await pool.query(
            'INSERT INTO rag_documents (title, file_name, doc_year, doc_section) VALUES ($1, $2, $3, $4) RETURNING id',
            [title, fileName || 'document.pdf', Number(docYear) || 2026, docSection || 'بخش عمومی']
        );
        const docId = docResult.rows[0].id;

        sendEvent({ event: 'doc_saved', docId, totalChunks: chunks.length, message: 'Document saved.' });

        // Insert chunks
        for (let i = 0; i < chunks.length; i++) {
            const chunkText = chunks[i];
            const embedding = await getGeminiEmbedding(chunkText);
            const insertResult = await pool.query(
                'INSERT INTO rag_document_chunks (document_id, chunk_index, content, embedding) VALUES ($1, $2, $3, $4) RETURNING id',
                [docId, i, chunkText, JSON.stringify(embedding)]
            );
            const chunkId = insertResult.rows[0].id;

            sendEvent({
                event: 'chunk_processed',
                index: i + 1,
                total: chunks.length,
                chunkId: chunkId,
                textSnippet: chunkText.substring(0, 50).replace(/\n/g, ' ')
            });
        }

        sendEvent({
            event: 'success',
            id: docId,
            stats: {
                pageCount,
                characterCount: text.length,
                wordCount: text.split(/\s+/).filter(Boolean).length,
                chunkCount: chunks.length
            }
        });
        res.end();
    } catch (err: any) {
        console.error('[RAG Upload Error]', err);
        sendEvent({ event: 'error', error: err.message || 'Error occurred while processing PDF.' });
        res.end();
    }
});

// 2. Get Documents
app.get('/api/rag/documents', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT d.*, COALESCE(COUNT(c.id), 0)::int as chunk_count 
            FROM rag_documents d 
            LEFT JOIN rag_document_chunks c ON d.id = c.document_id 
            WHERE d.is_deleted = FALSE 
            GROUP BY d.id 
            ORDER BY d.created_at DESC
        `);
        res.json(result.rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Delete Document
app.delete('/api/rag/documents/:id', async (req, res) => {
    const { id } = req.params;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        const docIdNum = Number(id);

        // A. Delete user chat sessions associated with this document ID in active_document_ids (JSONB array)
        // This will cascade delete user_pdf_chat_messages due to ON DELETE CASCADE foreign key constraint.
        await client.query(
            "DELETE FROM user_pdf_chats WHERE active_document_ids @> $1::jsonb OR active_document_ids @> $2::jsonb",
            [JSON.stringify([docIdNum]), JSON.stringify([String(id)])]
        );

        // B. Delete associated chunks from rag_document_chunks (ON DELETE CASCADE covers this too, but we do it explicitly for extra safety)
        await client.query('DELETE FROM rag_document_chunks WHERE document_id = $1', [docIdNum]);

        // C. Delete the document itself from rag_documents
        await client.query('DELETE FROM rag_documents WHERE id = $1', [docIdNum]);

        await client.query('COMMIT');
        res.json({ success: true });
    } catch (err: any) {
        await client.query('ROLLBACK');
        console.error('[DELETE /api/rag/documents/:id] Transaction failed. Rolled back.', err);
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

// 3.5 Toggle Document Enable/Disable State
app.post('/api/rag/documents/:id/toggle', async (req, res) => {
    const { id } = req.params;
    const { isEnabled } = req.body;
    try {
        await pool.query('UPDATE rag_documents SET is_enabled = $1 WHERE id = $2', [isEnabled, id]);
        res.json({ success: true });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// 3.6 Get Document Chunks Details for Editing
app.get('/api/rag/documents/:id/details', async (req, res) => {
    const { id } = req.params;
    const docId = Number(id);
    try {
        const chunksRes = await pool.query(
            "SELECT id, chunk_index, content FROM rag_document_chunks WHERE document_id = $1 ORDER BY chunk_index ASC, id ASC",
            [docId]
        );
        res.json({
            chunks: chunksRes.rows
        });
    } catch (err: any) {
        console.error('[GET /api/rag/documents/:id/details] failed:', err);
        res.status(500).json({ error: err.message });
    }
});

// 3.7 Update Document Chunks (Overwriting/Updating in a transaction, preserving unchanged embeddings)
app.post('/api/rag/documents/:id/update-chunks', async (req, res) => {
    const { id } = req.params;
    const docId = Number(id);
    const { title, docYear, docSection, chunks } = req.body;
    if (!Array.isArray(chunks)) {
        return res.status(400).json({ error: 'chunks must be an array' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Update document metadata if provided
        if (title || docYear || docSection) {
            await client.query(
                "UPDATE rag_documents SET title = COALESCE($1, title), doc_year = COALESCE($2, doc_year), doc_section = COALESCE($3, doc_section) WHERE id = $4",
                [title || null, docYear ? Number(docYear) : null, docSection || null, docId]
            );
        }

        // Fetch existing chunks to optimize embedding calls
        const existingRes = await client.query(
            "SELECT id, chunk_index, content, embedding FROM rag_document_chunks WHERE document_id = $1",
            [docId]
        );
        const existingChunks = existingRes.rows;

        // Delete existing chunks for this document
        await client.query("DELETE FROM rag_document_chunks WHERE document_id = $1", [docId]);

        // Insert updated/new chunks
        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            const content = chunk.content || '';
            
            if (content.trim().length > 0) {
                // Find matching existing chunk with exact same content to reuse its embedding
                const matchingExisting = existingChunks.find(ec => ec.content === content);
                
                let embeddingJson: any = null;
                if (matchingExisting && matchingExisting.embedding) {
                    embeddingJson = typeof matchingExisting.embedding === 'string' 
                        ? matchingExisting.embedding 
                        : JSON.stringify(matchingExisting.embedding);
                } else {
                    const embedding = await getGeminiEmbedding(content);
                    embeddingJson = JSON.stringify(embedding);
                }

                await client.query(
                    "INSERT INTO rag_document_chunks (document_id, chunk_index, content, embedding) VALUES ($1, $2, $3, $4)",
                    [docId, i, content, embeddingJson]
                );
            }
        }

        await client.query('COMMIT');
        res.json({ success: true });
    } catch (err: any) {
        await client.query('ROLLBACK');
        console.error('[POST /api/rag/documents/:id/update-chunks] failed:', err);
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

// 4. List User Sessions
app.get('/api/rag/chat/sessions', async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId is required' });
    try {
        const result = await pool.query(
            "SELECT id, title, active_document_ids, created_at, updated_at FROM user_pdf_chats WHERE user_id = $1 AND is_deleted = FALSE ORDER BY updated_at DESC",
            [userId]
        );
        res.json({ sessions: result.rows });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// 5. Delete PDF Chat Session
app.delete('/api/rag/chat/sessions/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query("UPDATE user_pdf_chats SET is_deleted = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = $1", [id]);
        res.json({ success: true });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// 6. Get Chat Session History
app.post('/api/rag/chat/history', async (req, res) => {
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ error: 'sessionId is required' });
    try {
        const result = await pool.query(
            "SELECT id, role, message as text, reaction FROM user_pdf_chat_messages WHERE chat_id = $1 ORDER BY id ASC",
            [sessionId]
        );
        res.json({ history: result.rows });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// 6.5 Save RAG Chat Message Reaction
app.post('/api/rag/chat/message/reaction', async (req, res) => {
    const { messageId, reaction } = req.body;
    if (!messageId) return res.status(400).json({ error: 'messageId is required' });
    try {
        await pool.query(
            "UPDATE user_pdf_chat_messages SET reaction = $1 WHERE id = $2",
            [reaction || null, messageId]
        );
        res.json({ success: true });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Helper function for Query Transformation (Intelligent Query Rewriting & Expansion)
async function transformQuery(originalQuery: string, isPersian: boolean): Promise<{ transformedQuery: string; variations: string[] }> {
    try {
        console.log(`[Query Transformation] Initiating query transformation for: "${originalQuery}"`);
        const systemPrompt = `
        You are an advanced search query optimization engine for Persia Khodro PDF RAG Search.
        The user has submitted an input query that might be brief, ambiguous, or conversational.
        Your task is to analyze it, clarify any ambiguous terms, and expand/rewrite it into 2 to 3 clearer, highly specific search query variations (focusing on key automotive, diagnostic, compliance, or handbook terms).

        Provide your response ONLY as a raw JSON object. Do not include any greeting, introduction, conversational text, markdown formatting blocks (like \`\`\`json), or explanations.

        Structure:
        {
          "clarifiedQuery": "A single optimized, highly direct version of the original query",
          "variations": ["Variation 1 focused on specific handbook rules", "Variation 2 focused on technical or diagnostic keywords", "Variation 3 focused on corporate or procedural aspects"]
        }

        Important:
        - If the user's query is in Persian (Farsi), generate all fields of the JSON in Persian.
        - If it is in English, generate all fields in English.
        - Do not output any conversational text, explanations, or backticks outside the valid JSON.
        `;

        const messages = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Analyze, rewrite, and optimize the following user query into the requested JSON schema. Do not answer or chat, only transform this query: "${originalQuery}"` }
        ];

        const response = await callAvalAI(messages, 'gemini-2.5-flash');
        const rawContent = (response.choices?.[0]?.message?.content || '').trim();
        console.log(`[Query Transformation] Raw LLM response: "${rawContent}"`);

        // Robust JSON extraction
        let cleanJsonStr = rawContent;
        const startIdx = rawContent.indexOf('{');
        const endIdx = rawContent.lastIndexOf('}');
        
        if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
            cleanJsonStr = rawContent.substring(startIdx, endIdx + 1);
        } else {
            cleanJsonStr = rawContent.replace(/```json/gi, '').replace(/```/g, '').trim();
        }

        const parsed = JSON.parse(cleanJsonStr);

        if (parsed && typeof parsed === 'object') {
            const clarifiedQuery = parsed.clarifiedQuery || originalQuery;
            const variations = Array.isArray(parsed.variations) ? parsed.variations : [];
            return {
                transformedQuery: clarifiedQuery,
                variations: variations
            };
        }
    } catch (err) {
        console.error('[Query Transformation Error] Fallback to original query:', err);
    }
    return { transformedQuery: originalQuery, variations: [] };
}

// 7. Core PDF Chat Query (RAG search + LLM call)
app.post('/api/rag/chat', async (req, res) => {
    const { messages, documentIds, appLanguage, sessionId, userId, searchSettings } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'messages are required' });
    }

    const lastMsg = messages[messages.length - 1];
    const userQuery = lastMsg.content || lastMsg.text || '';
    const activeUserId = userId || 'behzad-naderloo';

    let userMsgId: number | undefined;
    let modelMsgId: number | undefined;

    // Persist User Message if session exists
    if (sessionId) {
        try {
            const check = await pool.query("SELECT id FROM user_pdf_chats WHERE id = $1", [sessionId]);
            if (check.rowCount === 0) {
                let title = userQuery.trim().split('\n')[0];
                if (title.length > 50) title = title.substring(0, 47) + '...';
                await pool.query(
                    "INSERT INTO user_pdf_chats (id, user_id, title, active_document_ids, created_at, updated_at, is_deleted) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, FALSE)",
                    [sessionId, activeUserId, title || 'New PDF Chat', JSON.stringify(documentIds || [])]
                );
            } else {
                await pool.query(
                    "UPDATE user_pdf_chats SET updated_at = CURRENT_TIMESTAMP, active_document_ids = $1 WHERE id = $2",
                    [JSON.stringify(documentIds || []), sessionId]
                );
            }

            const userInsertRes = await pool.query(
                "INSERT INTO user_pdf_chat_messages (chat_id, role, message, created_at) VALUES ($1, 'user', $2, CURRENT_TIMESTAMP) RETURNING id",
                [sessionId, userQuery]
            );
            userMsgId = userInsertRes.rows[0]?.id;
        } catch (dbErr) {
            console.error('[RAG DB Save User Msg Error]', dbErr);
        }
    }

    try {
        // A. Query Transformation (Intelligent Query Rewriting & Expansion)
        const isTransformationEnabled = searchSettings?.queryTransformation !== false;
        let searchQuery = userQuery;
        let queryVariations: string[] = [];

        if (isTransformationEnabled) {
            const isPersian = appLanguage === 'fa' || /[\u0600-\u06FF]/.test(userQuery);
            const transformResult = await transformQuery(userQuery, isPersian);
            searchQuery = transformResult.transformedQuery;
            queryVariations = transformResult.variations;
        }

        // Embed user query
        const queryEmbedding = await getGeminiEmbedding(searchQuery);

        // Fetch candidate chunks
        let queryStr = `
            SELECT c.content, c.embedding, d.title as doc_title, d.doc_year, d.doc_section
            FROM rag_document_chunks c
            JOIN rag_documents d ON c.document_id = d.id
            WHERE d.is_deleted = FALSE AND d.is_enabled = TRUE
        `;
        let params: any[] = [];
        let placeholderIdx = 1;

        if (Array.isArray(documentIds) && documentIds.length > 0) {
            const placeholders = documentIds.map((_, i) => `$${placeholderIdx++}`).join(',');
            queryStr += ` AND d.id IN (${placeholders})`;
            params.push(...documentIds);
        }

        // Apply metadata filters (manual + auto-extracted)
        const activeFilters: any = {};
        if (searchSettings?.metadataFilters?.year) {
            activeFilters.year = searchSettings.metadataFilters.year;
        }
        if (searchSettings?.metadataFilters?.section) {
            activeFilters.section = searchSettings.metadataFilters.section;
        }

        // Auto-extract from query if any mentions found
        const extracted = autoExtractFilters(userQuery);
        if (extracted.year) activeFilters.year = extracted.year;
        if (extracted.section) activeFilters.section = extracted.section;

        if (activeFilters.year && activeFilters.year !== 'all') {
            queryStr += ` AND d.doc_year = $${placeholderIdx++}`;
            params.push(Number(activeFilters.year));
        }

        if (activeFilters.section && activeFilters.section !== 'all') {
            queryStr += ` AND (d.doc_section ILIKE $${placeholderIdx} OR d.title ILIKE $${placeholderIdx})`;
            placeholderIdx++;
            params.push(`%${activeFilters.section}%`);
        }

        const chunksResult = await pool.query(queryStr, params);
        const candidates = chunksResult.rows;

        // Score candidates
        // A. Semantic/Vector Similarity
        const semanticScores = candidates.map(row => {
            let vec: number[] = [];
            try {
                vec = typeof row.embedding === 'string' ? JSON.parse(row.embedding) : row.embedding;
            } catch {
                vec = [];
            }
            return cosineSimilarity(queryEmbedding, vec);
        });

        // B. Keyword TF-IDF / BM25 Similarity
        const keywordScores = computeKeywordScores(candidates, [searchQuery, ...queryVariations].join(' '));

        // C. Combine and Normalize
        const maxSemantic = Math.max(...semanticScores, 1e-5);
        const minSemantic = Math.min(...semanticScores, 0);
        const semanticRange = maxSemantic - minSemantic || 1;

        const maxKeyword = Math.max(...keywordScores, 1e-5);
        const minKeyword = Math.min(...keywordScores, 0);
        const keywordRange = maxKeyword - minKeyword || 1;

        const isHybridEnabled = searchSettings?.hybridSearch !== false;
        const semanticWeight = Number(searchSettings?.semanticWeight ?? 0.6);
        const keywordWeight = Number(searchSettings?.keywordWeight ?? 0.4);

        const scored = candidates.map((row, idx) => {
            const rawSem = semanticScores[idx];
            const normSem = (rawSem - minSemantic) / semanticRange;
            
            const rawKey = keywordScores[idx];
            const normKey = (rawKey - minKeyword) / keywordRange;

            let finalScore = rawSem;
            if (isHybridEnabled) {
                finalScore = (semanticWeight * normSem) + (keywordWeight * normKey);
            }

            return {
                content: row.content,
                title: row.doc_title,
                doc_year: row.doc_year,
                doc_section: row.doc_section,
                semanticScore: rawSem,
                keywordScore: rawKey,
                score: finalScore
            };
        });

        // Sort by final combined score
        scored.sort((a, b) => b.score - a.score);

        // Retrieve top candidate chunks (up to 20 for reranking)
        let topChunks = scored.slice(0, 20);

        // D. Reranking (Cross-Encoder)
        const isRerankingEnabled = searchSettings?.reranking !== false;
        let finalRankedChunks = topChunks.slice(0, 5); // Default to top 5 from hybrid search

        if (isRerankingEnabled && topChunks.length > 0) {
            console.log(`[RAG Reranking] Reranking top ${topChunks.length} chunks via model...`);
            const reranked = await rerankCandidates(userQuery, topChunks);
            if (reranked && reranked.length > 0) {
                finalRankedChunks = reranked.slice(0, 5);
            }
        } else {
            finalRankedChunks = scored.slice(0, 5);
        }

        const isPersian = appLanguage === 'fa';

        // Map unique retrieved document titles to simple short names to prevent response cluttering
        const uniqueTitles = finalRankedChunks.map(c => c.title).filter((v, i, a) => a.indexOf(v) === i);
        const docMapping = uniqueTitles.map((title, index) => {
            const docNum = index + 1;
            const shortLabel = isPersian ? `سند ${docNum}` : `Doc ${docNum}`;
            return {
                fullTitle: title,
                shortLabel: shortLabel
            };
        });

        // Determine if there is more than one document involved
        const selectedCount = Array.isArray(documentIds) ? documentIds.length : 0;
        const isMultiDoc = selectedCount > 1 || (selectedCount === 0 && uniqueTitles.length > 1);

        let contextText = '';
        if (finalRankedChunks.length > 0) {
            contextText = "Here are the most relevant sections found in the PDF documents:\n\n";
            finalRankedChunks.forEach(c => {
                const mapping = docMapping.find(m => m.fullTitle === c.title);
                const label = mapping ? mapping.shortLabel : c.title;
                contextText += `[Document: ${label}] (Full Original Title: ${c.title})\n${c.content}\n\n`;
            });
        } else {
            contextText = "No relevant document context found. Answer based on general knowledge.";
        }

        let citationInstructions = '';
        if (isPersian) {
            if (isMultiDoc) {
                citationInstructions = `دستورالعمل ارجاعات درون‌متنی (بسیار مهم برای تمیزی و عدم شلوغی پاسخ):
1. برای ارجاع به اسناد، از نام کوتاه آنها به صورت [سند: نام کوتاه] استفاده کنید. برای مثال: [سند: سند ۱]. به هیچ عنوان نام کامل و طولانی سند را درون متن تکرار نکنید.
2. از تکرار بیش از حد ارجاعات خودداری کنید! به هیچ وجه بعد از هر جمله ارجاع نزنید. ارجاع را فقط به صورت بسیار محدود (حداکثر ۱ بار در انتهای هر پاراگراف یا برای هر فکت کلیدی) درج کنید تا پاسخ شلوغ نشود.
3. در انتهای پاسخ خود، بخش منابع را به صورت زیر قالب‌بندی کنید تا کاربر بتواند تناظر نام کوتاه با عنوان کامل سند را ببیند:
   \\n\\n📚 **منابع و اسناد مرجع:**
${docMapping.map(m => `   - [سند: ${m.shortLabel}] : ${m.fullTitle}`).join('\n')}`;
            } else {
                citationInstructions = `دستورالعمل عدم درج ارجاعات درون‌متنی (بسیار مهم):
1. به هیچ عنوان و تحت هیچ شرایطی در داخل متن پاسخ یا در انتهای پاراگراف‌ها از ارجاعات درون‌متنی (مانند [سند: سند ۱]، [سند ۱]، یا [Document: Doc 1]) استفاده نکنید! هیچ ارجاعی در بدنه اصلی متن نباید وجود داشته باشد.
2. فقط و فقط در انتهای پاسخ خود، بخش منابع را به صورت زیر قالب‌بندی کنید تا کاربر منبع پاسخ را ببیند:
   \\n\\n📚 **منابع و اسناد مرجع:**
${docMapping.map(m => `   - ${m.fullTitle}`).join('\n')}`;
            }
        } else {
            if (isMultiDoc) {
                citationInstructions = `INSTRUCTIONS FOR INLINE CITATIONS (CRITICAL FOR CLEANLINESS):
1. For claims or key facts derived from the documents, use the short label in this format: [Document: Short Label] (e.g. [Document: Doc 1]). Do NOT repeat the full and long document titles in the main text body.
2. Avoid excessive citations! Do NOT cite after every single sentence. Use them sparingly (maximum of once per major paragraph or key section) to keep the text clean and highly readable.
3. At the very end of your response, provide the clear mapping of short labels to full document titles under a references heading:
   \\n\\n📖 **Reference Sources:**
${docMapping.map(m => `   - [Document: ${m.shortLabel}] : ${m.fullTitle}`).join('\n')}`;
            } else {
                citationInstructions = `CRITICAL INSTRUCTIONS (NO INLINE CITATIONS):
1. Do NOT include any inline citations (such as [Document: Doc 1], [Doc 1], etc.) inside the body of the response or at the end of paragraphs! Absolutely no citation tags in the text body.
2. At the very end of your response, simply list the reference sources under a references heading:
   \\n\\n📖 **Reference Sources:**
${docMapping.map(m => `   - ${m.fullTitle}`).join('\n')}`;
            }
        }

        const systemPrompt = `
        You are a smart, professional corporate portal assistant for Persia Khodro (the official BMW representative and luxury auto-portal).
        Your task is to answer the user query accurately, relying primarily on the retrieved PDF document context below:
        
        RETRIEVED DOCUMENT CONTEXT:
        =============================
        ${contextText}
        =============================
        
        LANGUAGES SUPPORT:
        - If the application language is set to 'fa' or the user query is in Persian, you MUST answer in Persian (Farsi) beautifully and professionally.
        - Otherwise, answer in English.
        
        CITATIONS POLICY:
        ${citationInstructions}
        
        ADDITIONAL RULES:
        - Do NOT mention similarity percentages, vector dimensions, or backend retrieval statistics.
        `;

        // Make model call via AvalAI cascade routing
        const apiMessages = [
            { role: 'system', content: systemPrompt }
        ];

        // Format history
        const finalMessages = messages.map((m: any) => ({
            role: m.role === 'assistant' || m.role === 'model' ? 'assistant' : 'user',
            content: m.content || m.text || ''
        }));

        apiMessages.push(...finalMessages);

        const response = await callAvalAI(apiMessages, 'gemini-2.5-flash');
        const reply = response.choices?.[0]?.message?.content || "Could not generate response.";

        // Persist Model Reply if session exists
        if (sessionId) {
            try {
                const modelInsertRes = await pool.query(
                    "INSERT INTO user_pdf_chat_messages (chat_id, role, message, created_at) VALUES ($1, 'model', $2, CURRENT_TIMESTAMP) RETURNING id",
                    [sessionId, reply]
                );
                modelMsgId = modelInsertRes.rows[0]?.id;
            } catch (dbErr) {
                console.error('[RAG DB Save Model Reply Error]', dbErr);
            }
        }

        res.json({
            reply,
            sources: finalRankedChunks.map(c => c.title).filter((v, i, a) => a.indexOf(v) === i),
            userMessageId: userMsgId,
            modelMessageId: modelMsgId,
            searchDiagnostics: {
                filtersApplied: activeFilters,
                extractedFilters: extracted,
                isHybridEnabled,
                isRerankingEnabled,
                queryTransformation: {
                    enabled: isTransformationEnabled,
                    clarifiedQuery: searchQuery,
                    variations: queryVariations
                },
                semanticWeight,
                keywordWeight,
                retrievedCount: candidates.length,
                topChunks: finalRankedChunks.map(c => ({
                    title: c.title,
                    snippet: c.content.substring(0, 100) + '...',
                    semanticScore: Number(c.semanticScore?.toFixed(4) || 0),
                    keywordScore: Number(c.keywordScore?.toFixed(4) || 0),
                    combinedScore: Number(c.score?.toFixed(4) || 0),
                    rerankScore: c.rerankScore,
                    rerankReason: c.rerankReason
                }))
            }
        });
    } catch (err: any) {
        console.error('[RAG Query Error]', err);
        res.status(500).json({ error: err.message || 'Error occurred during RAG chat.' });
    }
});

// RAG Parser Diagnostics & Content Analyzer endpoint
app.post('/api/rag/diagnose', async (req, res) => {
    const { fileName, fileBase64 } = req.body;
    if (!fileBase64) {
        return res.status(400).json({ error: 'document content is required.' });
    }

    try {
        const buffer = Buffer.from(fileBase64, 'base64');
        const { text, pageCount } = await extractTextFromPdf(buffer);
        
        const characterCount = text.length;
        const wordCount = text.split(/\s+/).filter(Boolean).length;
        const lineCount = text.split('\n').length;
        const paragraphCount = text.split(/\n\s*\n/).filter(Boolean).length;

        // Chunking preview simulation
        const chunkSize = 800;
        const overlap = 150;
        const chunks: any[] = [];
        
        let curPos = 0;
        let index = 0;
        while (curPos < text.length) {
            const rawChunk = text.substring(curPos, curPos + chunkSize);
            const chunk = rawChunk.trim();
            if (chunk) {
                chunks.push({
                    index: index++,
                    startChar: curPos,
                    endChar: Math.min(curPos + chunkSize, text.length),
                    characterCount: chunk.length,
                    wordCount: chunk.split(/\s+/).filter(Boolean).length,
                    contentPreview: chunk.substring(0, 200) + (chunk.length > 200 ? '...' : '')
                });
            }
            curPos += (chunkSize - overlap);
            if (rawChunk.length < chunkSize) break;
        }

        const previewBeginning = text.substring(0, 1500);
        const previewEnding = text.length > 1500 ? text.substring(text.length - 1500) : '';

        res.json({
            success: true,
            stats: {
                pageCount,
                characterCount,
                wordCount,
                lineCount,
                paragraphCount,
                chunkCount: chunks.length
            },
            preview: {
                beginning: previewBeginning,
                ending: previewEnding
            },
            chunks: chunks.slice(0, 50) // Return first 50 chunks
        });
    } catch (err: any) {
        console.error('[RAG Diagnose Error]', err);
        res.status(500).json({ success: false, error: err.message || 'Error occurred while analyzing PDF.' });
    }
});

// GET active AI settings features and pathways configuration
app.get('/api/admin/ai-features', async (req, res) => {
    try {
        const result = await pool.query("SELECT value FROM app_settings WHERE key = 'ai_features'");
        if (result.rowCount && result.rowCount > 0) {
            res.json(result.rows[0].value);
        } else {
            res.json({
                pathway1_enabled: true,
                pathway2_enabled: true,
                pathway3_enabled: true,
                pathway4_enabled: true,
                preferred_pathway: 1,
                use_google_original_endpoint: false,
                llm_rpm_limit: 0,
                llm_tpm_limit: 0,
                embed_rpm_limit: 0,
                embed_tpm_limit: 0,
                selected_llm_model: 'gemini-2.5-flash',
                selected_embed_model: 'gemini-embedding-001'
            });
        }
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// POST update active AI settings features and pathways configuration
app.post('/api/admin/ai-features', async (req, res) => {
    try {
        const val = req.body;
        await pool.query(
            "INSERT INTO app_settings (key, value) VALUES ('ai_features', $1) ON CONFLICT (key) DO UPDATE SET value = $1",
            [JSON.stringify(val)]
        );
        res.json({ success: true });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// GET 100 recent AI Cascade Fallback log records
app.get('/api/admin/ai-fallback-logs', async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM ai_fallback_logs ORDER BY id DESC LIMIT 100");
        res.json(result.rows.map(row => ({
            id: row.id,
            timestamp: row.timestamp,
            endpoint: row.endpoint,
            modelRequested: row.model_requested,
            errorExperienced: row.error_experienced,
            actionTaken: row.action_taken
        })));
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// GRAPH RAG BACKEND ENDPOINTS
// ==========================================

// 1. Upload Graph Document and Extract Knowledge Graph
app.post('/api/graph/upload', async (req, res) => {
    const { title, fileName, fileBase64 } = req.body;
    if (!title || !fileBase64) {
        return res.status(400).json({ error: 'Title and document content are required.' });
    }

    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    const sendEvent = (obj: any) => {
        res.write(`data: ${JSON.stringify(obj)}\n\n`);
    };

    try {
        sendEvent({ event: 'start', message: 'Reading PDF and extracting text...' });

        const buffer = Buffer.from(fileBase64, 'base64');
        const { text, pageCount } = await extractTextFromPdf(buffer);
        
        if (!text.trim()) {
            sendEvent({ event: 'error', error: 'No readable text content could be extracted.' });
            return res.end();
        }

        sendEvent({ event: 'parsed', pageCount, message: 'PDF parsed successfully.' });

        // Chunking for Graph extraction: larger chunks (e.g. 1500 chars) for better semantic context
        const chunkSize = 1500;
        const overlap = 200;
        const chunks: string[] = [];
        
        let curPos = 0;
        while (curPos < text.length) {
            const rawChunk = text.substring(curPos, curPos + chunkSize);
            const chunk = rawChunk.trim();
            if (chunk) chunks.push(chunk);
            curPos += (chunkSize - overlap);
            if (rawChunk.length < chunkSize) break;
        }

        if (chunks.length === 0) {
            sendEvent({ event: 'error', error: 'Failed to split document text into chunks.' });
            return res.end();
        }

        sendEvent({ event: 'chunking', totalChunks: chunks.length, message: `Created ${chunks.length} sections for extraction.` });

        // Save Graph Document
        const docResult = await pool.query(
            'INSERT INTO graph_documents (title, file_name) VALUES ($1, $2) RETURNING id',
            [title, fileName || 'document.pdf']
        );
        const docId = docResult.rows[0].id;

        sendEvent({ event: 'doc_saved', docId, totalChunks: chunks.length, message: 'Graph Document saved.' });

        let totalEntities = 0;
        let totalRelations = 0;

        const systemPrompt = `You are an advanced knowledge graph extraction AI.
Analyze the provided text carefully and extract key entities and relationships.
Return your response STRICTLY as a valid JSON object matching this structure:
{
  "entities": [
    {"name": "Concise Entity Name", "type": "Person|Organization|Brand|Product|Policy|Process|Location|Concept", "description": "Short description of what/who it is"}
  ],
  "relationships": [
    {"source": "Source Entity Name", "target": "Target Entity Name", "relation": "VERB_OR_PHRASE", "description": "Short explanation of their relation"}
  ]
}
The text may be in English or Persian. Extract names and descriptions in the same language as the text to keep them natural. Standardize types and relation verbs to simple English or Persian.
Do not include any pre-text, post-text, markdown block, or backticks. Only return a valid JSON string.`;

        // Process each section
        for (let i = 0; i < chunks.length; i++) {
            const chunkText = chunks[i];
            sendEvent({
                event: 'chunk_processing',
                index: i + 1,
                total: chunks.length,
                message: `Extracting knowledge from section ${i + 1} of ${chunks.length}...`
            });

            try {
                const messages = [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: `Extract entities and relationships from the following text:\n\n${chunkText}` }
                ];
                
                // Call Gemini via the cascading callAvalAI function
                const aiResponse = await callAvalAI(messages, 'gemini-2.5-flash');
                const rawText = aiResponse?.text || aiResponse?.choices?.[0]?.message?.content || '';

                // Clean and Parse JSON robustly
                let cleaned = rawText.trim();
                const jsonStart = cleaned.indexOf('{');
                const jsonEnd = cleaned.lastIndexOf('}');
                if (jsonStart !== -1 && jsonEnd !== -1) {
                    cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
                }

                const graphData = JSON.parse(cleaned);
                let entitiesAdded = 0;
                let relationsAdded = 0;

                if (graphData && Array.isArray(graphData.entities)) {
                    for (const ent of graphData.entities) {
                        if (ent.name && ent.name.trim().length > 1) {
                            await pool.query(`
                                INSERT INTO graph_entities (document_id, name, type, description)
                                VALUES ($1, $2, $3, $4)
                                ON CONFLICT (document_id, name) 
                                DO UPDATE SET 
                                    type = COALESCE(graph_entities.type, EXCLUDED.type),
                                    description = COALESCE(graph_entities.description || ' | ' || EXCLUDED.description, EXCLUDED.description)
                            `, [docId, ent.name.trim(), ent.type || 'Concept', ent.description || '']);
                            entitiesAdded++;
                        }
                    }
                }

                if (graphData && Array.isArray(graphData.relationships)) {
                    for (const rel of graphData.relationships) {
                        if (rel.source && rel.target && rel.relation) {
                            await pool.query(`
                                INSERT INTO graph_relationships (document_id, source_entity, target_entity, relation_type, description)
                                VALUES ($1, $2, $3, $4, $5)
                            `, [docId, rel.source.trim(), rel.target.trim(), rel.relation.trim().toUpperCase(), rel.description || '']);
                            relationsAdded++;
                        }
                    }
                }

                totalEntities += entitiesAdded;
                totalRelations += relationsAdded;

                sendEvent({
                    event: 'chunk_processed',
                    index: i + 1,
                    total: chunks.length,
                    entitiesFound: entitiesAdded,
                    relationsFound: relationsAdded,
                    textSnippet: chunkText.substring(0, 50).replace(/\n/g, ' ')
                });

            } catch (err: any) {
                console.error(`[Graph RAG Upload] Error processing chunk ${i}:`, err.message);
                // Continue to next chunk even if one fails
            }
        }

        // --- Document Structure Graph Extraction ---
        try {
            const isRtl = /[\u0600-\u06FF]/.test(text.substring(0, 5000));
            sendEvent({
                event: 'status_update',
                message: isRtl ? 'در حال استخراج ساختار سلسله‌مراتبی فایل (سند -> بخش‌ها -> بندها)...' : 'Extracting document structural hierarchy (Document -> Sections -> Paragraphs)...'
            });

            const docNodeName = title.trim();
            await pool.query(`
                INSERT INTO graph_entities (document_id, name, type, description)
                VALUES ($1, $2, 'Document', $3)
                ON CONFLICT (document_id, name) DO NOTHING
            `, [docId, docNodeName, isRtl ? `فایل سند اصلی: ${fileName || 'document.pdf'}` : `The root document file: ${fileName || 'document.pdf'}`]);

            // Try to extract real headings from the first portion of the text
            let sections: string[] = [];
            try {
                const sampleLength = Math.min(text.length, 12000);
                const sampleText = text.substring(0, sampleLength);
                const structPrompt = `You are a document analyzer. Read the text sample below and extract 3 to 5 main section headers, chapter titles, or logical parts of this document.
Format your output STRICTLY as a valid JSON array of strings. Do not include any explanation or markdown formatting.
Text Sample:
${sampleText}

JSON Output:`;
                const aiStructRes = await callAvalAI([{ role: 'user', content: structPrompt }], 'gemini-2.5-flash');
                const structRaw = aiStructRes?.text || aiStructRes?.choices?.[0]?.message?.content || '';
                let structCleaned = structRaw.trim();
                const startIdx = structCleaned.indexOf('[');
                const endIdx = structCleaned.lastIndexOf(']');
                if (startIdx !== -1 && endIdx !== -1) {
                    structCleaned = structCleaned.substring(startIdx, endIdx + 1);
                }
                sections = JSON.parse(structCleaned);
            } catch (secErr) {
                console.warn('[Graph Upload] Logical structure extraction failed, using default divisions:', secErr);
            }

            if (!Array.isArray(sections) || sections.length === 0) {
                sections = isRtl 
                    ? ['مقدمه و کلیات سند', 'سیاست‌ها و ضوابط اصلی', 'فرآیندها و دستورالعمل‌های اجرایی']
                    : ['Introduction & Overview', 'Core Policies & Guidelines', 'Execution Processes & Operations'];
            }

            const chunksPerSection = Math.ceil(chunks.length / sections.length);
            for (let sIdx = 0; sIdx < sections.length; sIdx++) {
                const secName = sections[sIdx].trim();
                if (!secName) continue;

                await pool.query(`
                    INSERT INTO graph_entities (document_id, name, type, description)
                    VALUES ($1, $2, 'Section', $3)
                    ON CONFLICT (document_id, name) DO NOTHING
                `, [docId, secName, isRtl ? `بخش شماره ${sIdx + 1} سند` : `Section ${sIdx + 1} of the document`]);

                await pool.query(`
                    INSERT INTO graph_relationships (document_id, source_entity, target_entity, relation_type, description)
                    VALUES ($1, $2, $3, 'HAS_SECTION', $4)
                `, [docId, docNodeName, secName, isRtl ? 'سند شامل این بخش است' : 'Document contains this section']);

                const startChunk = sIdx * chunksPerSection;
                const endChunk = Math.min(startChunk + chunksPerSection, chunks.length);

                for (let cIdx = startChunk; cIdx < endChunk; cIdx++) {
                    const snippet = chunks[cIdx].substring(0, 150).replace(/\r?\n/g, ' ') + '...';
                    const paraName = isRtl ? `بند ${cIdx + 1} (${secName.substring(0, 15)})` : `Paragraph ${cIdx + 1} (${secName.substring(0, 15)})`;

                    await pool.query(`
                        INSERT INTO graph_entities (document_id, name, type, description)
                        VALUES ($1, $2, 'Paragraph', $3)
                        ON CONFLICT (document_id, name) DO NOTHING
                    `, [docId, paraName, snippet]);

                    await pool.query(`
                        INSERT INTO graph_relationships (document_id, source_entity, target_entity, relation_type, description)
                        VALUES ($1, $2, $3, 'HAS_PARAGRAPH', $4)
                    `, [docId, secName, paraName, isRtl ? 'این بخش شامل این بند است' : 'Section contains this paragraph']);
                }
            }
        } catch (structErr: any) {
            console.error('[Graph Upload] Error building Document Structure Graph:', structErr.message);
        }

        // --- Automatic AI Entity Resolution ---
        try {
            const isRtl = /[\u0600-\u06FF]/.test(text.substring(0, 5000));
            sendEvent({
                event: 'status_update',
                message: isRtl ? 'در حال اجرای ادغام و ابهام‌زدایی خودکار موجودیت‌ها با هوش مصنوعی...' : 'Running automatic AI entity resolution and deduplication...'
            });
            const mergedGroups = await runEntityResolution(docId);
            if (mergedGroups.length > 0) {
                console.log(`[Upload Auto Entity Resolution] Merged ${mergedGroups.length} entity clusters.`);
            }
        } catch (resErr: any) {
            console.error('[Upload Auto Entity Resolution] failed:', resErr.message);
        }

        sendEvent({
            event: 'success',
            id: docId,
            totalEntities,
            totalRelations,
            message: `Knowledge Graph extraction complete! Extracted ${totalEntities} entities and ${totalRelations} relations.`
        });
        res.end();

    } catch (err: any) {
        console.error('[Graph RAG Upload Error]', err);
        sendEvent({ event: 'error', error: err.message || 'Error occurred during Graph RAG extraction.' });
        res.end();
    }
});

// 2. List Graph Documents with Entities and Relationships Count
app.get('/api/graph/documents', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT d.*, 
                   COALESCE(e.ent_count, 0)::int as entity_count,
                   COALESCE(r.rel_count, 0)::int as relation_count
            FROM graph_documents d 
            LEFT JOIN (
                SELECT document_id, COUNT(*) as ent_count 
                FROM graph_entities 
                GROUP BY document_id
            ) e ON d.id = e.document_id
            LEFT JOIN (
                SELECT document_id, COUNT(*) as rel_count 
                FROM graph_relationships 
                GROUP BY document_id
            ) r ON d.id = r.document_id
            WHERE d.is_deleted = FALSE 
            ORDER BY d.created_at DESC
        `);
        res.json(result.rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Toggle Graph Document Enabled/Disabled state
app.post('/api/graph/documents/:id/toggle', async (req, res) => {
    const { id } = req.params;
    const { isEnabled } = req.body;
    try {
        await pool.query('UPDATE graph_documents SET is_enabled = $1 WHERE id = $2', [isEnabled, id]);
        res.json({ success: true });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// 3.5 Toggle Graph Document Strict Mode (restricted to document content only)
app.post('/api/graph/documents/:id/strict-mode', async (req, res) => {
    const { id } = req.params;
    const { strictMode } = req.body;
    try {
        await pool.query('UPDATE graph_documents SET strict_mode = $1 WHERE id = $2', [strictMode, id]);
        res.json({ success: true });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Delete Graph Document
app.delete('/api/graph/documents/:id', async (req, res) => {
    const { id } = req.params;
    const docIdNum = Number(id);
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        // Delete chat sessions associated with this Graph document
        await client.query(
            "DELETE FROM graph_chats WHERE active_document_ids @> $1::jsonb OR active_document_ids @> $2::jsonb",
            [JSON.stringify([docIdNum]), JSON.stringify([String(id)])]
        );

        // Delete the document, cascade handles entities and relationships
        await client.query('DELETE FROM graph_documents WHERE id = $1', [docIdNum]);

        await client.query('COMMIT');
        res.json({ success: true });
    } catch (err: any) {
        await client.query('ROLLBACK');
        console.error('[DELETE /api/graph/documents/:id] failed:', err);
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

// 4.5 Get Document Entities & Relationships Details for Editing
app.get('/api/graph/documents/:id/details', async (req, res) => {
    const { id } = req.params;
    const docId = Number(id);
    try {
        const entitiesRes = await pool.query(
            "SELECT id, name, type, description FROM graph_entities WHERE document_id = $1 ORDER BY id ASC",
            [docId]
        );
        const relationshipsRes = await pool.query(
            "SELECT id, source_entity, target_entity, relation_type, description FROM graph_relationships WHERE document_id = $1 ORDER BY id ASC",
            [docId]
        );
        res.json({
            entities: entitiesRes.rows,
            relationships: relationshipsRes.rows
        });
    } catch (err: any) {
        console.error('[GET /api/graph/documents/:id/details] failed:', err);
        res.status(500).json({ error: err.message });
    }
});

// 4.6 Update Document Entities & Relationships (Fully overwriting in a transaction)
app.post('/api/graph/documents/:id/update-graph', async (req, res) => {
    const { id } = req.params;
    const docId = Number(id);
    const { entities, relationships } = req.body;
    if (!Array.isArray(entities) || !Array.isArray(relationships)) {
        return res.status(400).json({ error: 'entities and relationships must be arrays' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Delete existing entities and relationships for this document
        await client.query("DELETE FROM graph_entities WHERE document_id = $1", [docId]);
        await client.query("DELETE FROM graph_relationships WHERE document_id = $1", [docId]);

        // Insert updated entities
        for (const ent of entities) {
            if (ent.name && ent.name.trim().length > 1) {
                await client.query(`
                    INSERT INTO graph_entities (document_id, name, type, description)
                    VALUES ($1, $2, $3, $4)
                    ON CONFLICT (document_id, name) 
                    DO UPDATE SET 
                        type = EXCLUDED.type,
                        description = EXCLUDED.description
                `, [docId, ent.name.trim(), ent.type || 'Concept', ent.description || '']);
            }
        }

        // Insert updated relationships
        for (const rel of relationships) {
            if (rel.source_entity && rel.target_entity && rel.relation_type) {
                await client.query(`
                    INSERT INTO graph_relationships (document_id, source_entity, target_entity, relation_type, description)
                    VALUES ($1, $2, $3, $4, $5)
                `, [docId, rel.source_entity.trim(), rel.target_entity.trim(), rel.relation_type.trim().toUpperCase(), rel.description || '']);
            }
        }

        await client.query('COMMIT');
        res.json({ success: true });
    } catch (err: any) {
        await client.query('ROLLBACK');
        console.error('[POST /api/graph/documents/:id/update-graph] failed:', err);
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

// Helper function for AI Entity Resolution
async function runEntityResolution(docId: number): Promise<{ canonical: string; aliases: string[]; explanation: string }[]> {
    // 1. Fetch all entities and relationships
    const entitiesRes = await pool.query("SELECT name, type, description FROM graph_entities WHERE document_id = $1", [docId]);
    const entities = entitiesRes.rows;
    if (entities.length <= 1) return [];

    const systemPrompt = `You are an expert knowledge graph curation and entity resolution AI.
Your job is to identify duplicate, identical, near-identical, translations, or spelling variants of the same entity in a list of extracted entities.
For each group of duplicates, select ONE best "canonical" name, and list all its "aliases" that should be merged into it.
Return your response STRICTLY as a valid JSON object matching this structure:
{
  "merges": [
    {
      "canonical": "Apple Inc.",
      "aliases": ["Apple", "شرکت اپل", "اپل"],
      "explanation": "Different forms and translations of Apple"
    }
  ]
}
Rules:
- Only group entities that are genuinely referring to the exact same real-world concept, person, or organization.
- Do not invent names; the "canonical" name and all "aliases" must come directly from the list below.
- Do not output any preamble, postamble, markdown blocks, or backticks. Return strictly the JSON object.`;

    const entityNamesList = entities.map(e => `- ${e.name} (${e.type})`).join('\n');
    const userPrompt = `Here is the list of entities extracted from the document. Analyze them and identify which ones represent the same entity and should be merged:\n\n${entityNamesList}`;

    try {
        const aiResponse = await callAvalAI([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ], 'gemini-2.5-flash');

        const rawText = aiResponse?.text || aiResponse?.choices?.[0]?.message?.content || '';

        let cleaned = rawText.trim();
        const jsonStart = cleaned.indexOf('{');
        const jsonEnd = cleaned.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
            cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
        }

        const mergeData = JSON.parse(cleaned);
        const mergedGroups: { canonical: string; aliases: string[]; explanation: string }[] = [];

        if (mergeData && Array.isArray(mergeData.merges) && mergeData.merges.length > 0) {
            const client = await pool.connect();
            try {
                await client.query('BEGIN');

                for (const merge of mergeData.merges) {
                    const canonical = merge.canonical?.trim();
                    const aliases = Array.isArray(merge.aliases) ? merge.aliases.map((a: string) => a?.trim()) : [];
                    
                    if (!canonical || aliases.length === 0) continue;

                    const activeAliases = aliases.filter((a: string) => a && a !== canonical);
                    if (activeAliases.length === 0) continue;

                    const canonicalEnt = entities.find(e => e.name === canonical);
                    const aliasEnts = entities.filter(e => activeAliases.includes(e.name));

                    if (canonicalEnt) {
                        const allDescriptions = [
                            canonicalEnt.description,
                            ...aliasEnts.map(e => e.description)
                        ].filter(Boolean);
                        
                        const mergedDescription = Array.from(new Set(allDescriptions)).join(' | ');

                        await client.query(
                            "UPDATE graph_entities SET description = $1 WHERE document_id = $2 AND name = $3",
                            [mergedDescription, docId, canonical]
                        );
                    }

                    for (const alias of activeAliases) {
                        await client.query(
                            "UPDATE graph_relationships SET source_entity = $1 WHERE document_id = $2 AND source_entity = $3",
                            [canonical, docId, alias]
                        );
                        await client.query(
                            "UPDATE graph_relationships SET target_entity = $1 WHERE document_id = $2 AND target_entity = $3",
                            [canonical, docId, alias]
                        );
                        await client.query(
                            "DELETE FROM graph_entities WHERE document_id = $1 AND name = $2",
                            [docId, alias]
                        );
                    }

                    mergedGroups.push({
                        canonical,
                        aliases: activeAliases,
                        explanation: merge.explanation || ''
                    });
                }

                // Deduplicate relationships with same source, target, type for this doc
                await client.query(`
                    DELETE FROM graph_relationships a USING graph_relationships b
                    WHERE a.id > b.id 
                      AND a.document_id = b.document_id
                      AND a.source_entity = b.source_entity 
                      AND a.target_entity = b.target_entity 
                      AND a.relation_type = b.relation_type
                      AND a.document_id = $1
                `, [docId]);

                await client.query('COMMIT');
            } catch (txErr) {
                await client.query('ROLLBACK');
                throw txErr;
            } finally {
                client.release();
            }
        }

        return mergedGroups;
    } catch (err) {
        console.error('Error executing runEntityResolution helper:', err);
        return [];
    }
}

// 4.7 HTTP Endpoint for manually triggering Entity Resolution on a document
app.post('/api/graph/documents/:id/entity-resolution', async (req, res) => {
    const { id } = req.params;
    const docId = Number(id);

    try {
        const mergedGroups = await runEntityResolution(docId);
        res.json({
            success: true,
            message: `Entity resolution completed successfully. Merged ${mergedGroups.length} entity clusters.`,
            mergedGroups
        });
    } catch (err: any) {
        console.error('[POST /api/graph/documents/:id/entity-resolution] failed:', err);
        res.status(500).json({ error: err.message });
    }
});

// Helper for Label Propagation clustering algorithm
function runLabelPropagation(entities: any[], relationships: any[], maxIterations = 10): string[][] {
    const labels: { [key: string]: string } = {};
    const adjacency: { [key: string]: string[] } = {};

    entities.forEach(ent => {
        labels[ent.name] = ent.name;
        adjacency[ent.name] = [];
    });

    relationships.forEach(rel => {
        const s = rel.source_entity;
        const t = rel.target_entity;
        if (adjacency[s] && adjacency[t]) {
            adjacency[s].push(t);
            adjacency[t].push(s);
        }
    });

    const nodes = entities.map(e => e.name);

    for (let iter = 0; iter < maxIterations; iter++) {
        let changed = false;
        const shuffledNodes = [...nodes].sort(() => Math.random() - 0.5);

        for (const node of shuffledNodes) {
            const neighbors = adjacency[node] || [];
            if (neighbors.length === 0) continue;

            const labelCounts: { [key: string]: number } = {};
            neighbors.forEach(neighbor => {
                const label = labels[neighbor];
                labelCounts[label] = (labelCounts[label] || 0) + 1;
            });

            let maxCount = 0;
            let bestLabels: string[] = [];
            for (const [label, count] of Object.entries(labelCounts)) {
                if (count > maxCount) {
                    maxCount = count;
                    bestLabels = [label];
                } else if (count === maxCount) {
                    bestLabels.push(label);
                }
            }

            const chosenLabel = bestLabels[Math.floor(Math.random() * bestLabels.length)];
            if (labels[node] !== chosenLabel) {
                labels[node] = chosenLabel;
                changed = true;
            }
        }

        if (!changed) break;
    }

    const communityGroups: { [label: string]: string[] } = {};
    for (const [node, label] of Object.entries(labels)) {
        if (!communityGroups[label]) {
            communityGroups[label] = [];
        }
        communityGroups[label].push(node);
    }

    return Object.values(communityGroups).filter(group => group.length > 0);
}

// 4.8 Get Communities for a Document
app.get('/api/graph/documents/:id/communities', async (req, res) => {
    const { id } = req.params;
    const docId = Number(id);
    try {
        const result = await pool.query(
            "SELECT id, name, title, summary, entities FROM graph_communities WHERE document_id = $1 ORDER BY id ASC",
            [docId]
        );
        res.json({ success: true, communities: result.rows });
    } catch (err: any) {
        console.error('[GET /api/graph/documents/:id/communities] failed:', err);
        res.status(500).json({ error: err.message });
    }
});

// 4.9 Run AI-assisted Community Detection and Summarization for a Document
app.post('/api/graph/documents/:id/communities', async (req, res) => {
    const { id } = req.params;
    const docId = Number(id);

    try {
        const entitiesRes = await pool.query(
            "SELECT name, type, description FROM graph_entities WHERE document_id = $1",
            [docId]
        );
        const relationshipsRes = await pool.query(
            "SELECT source_entity, target_entity, relation_type, description FROM graph_relationships WHERE document_id = $1",
            [docId]
        );

        const entities = entitiesRes.rows;
        const relationships = relationshipsRes.rows;

        if (entities.length === 0) {
            return res.json({
                success: true,
                message: 'No entities found to form communities.',
                communities: []
            });
        }

        const clusters = runLabelPropagation(entities, relationships);
        const sortedClusters = clusters.sort((a, b) => b.length - a.length);

        const clustersToSummarize = sortedClusters.slice(0, 5);
        const remainingEntities: string[] = [];
        sortedClusters.slice(5).forEach(c => remainingEntities.push(...c));

        if (remainingEntities.length > 0) {
            clustersToSummarize.push(remainingEntities);
        }

        const generatedCommunities: { name: string; title: string; summary: string; entities: string[] }[] = [];

        for (let i = 0; i < clustersToSummarize.length; i++) {
            const clusterEnts = clustersToSummarize[i];
            if (clusterEnts.length === 0) continue;

            const clusterDetails = entities.filter(e => clusterEnts.includes(e.name));
            const entitiesListText = clusterDetails.map(e => `- ${e.name} (${e.type}): ${e.description || ''}`).join('\n');

            let title = `Community ${i + 1}`;
            let summary = `This community contains elements related to: ${clusterEnts.join(', ')}.`;

            try {
                const systemPrompt = `You are a professional knowledge graph thematic modeler.
Analyze this list of entities belonging to a highly dense topological community in the document's knowledge graph.
Determine the common theme, subject, or domain linking these entities.
Write:
1. An elegant, professional thematic title (e.g. "BMW Persia Khodro Warranty Policies").
2. A detailed, comprehensive, and cohesive summary (at least 2-3 sentences) explaining the connections, context, and relevance of this group in the document.

Respond in the language dominant in the entities list (Persian/Farsi if text is mostly in Persian, otherwise English).

Format your output STRICTLY as a valid JSON object matching this schema:
{
  "title": "A thematic title in the correct language",
  "summary": "A detailed, structured paragraph in the correct language summarizing the community"
}
Do not return any other text, preambles, or markdown formatting.`;

                const aiResponse = await callAvalAI([
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: `Here is the list of entities:\n\n${entitiesListText}` }
                ], 'gemini-2.5-flash');

                const rawText = aiResponse?.text || aiResponse?.choices?.[0]?.message?.content || '';
                let cleaned = rawText.trim();
                const jsonStart = cleaned.indexOf('{');
                const jsonEnd = cleaned.lastIndexOf('}');
                if (jsonStart !== -1 && jsonEnd !== -1) {
                    cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
                }

                const data = JSON.parse(cleaned);
                if (data.title) title = data.title;
                if (data.summary) summary = data.summary;
            } catch (aiErr) {
                console.warn(`[Community Summarization] AI summary generation failed for community ${i + 1}:`, aiErr);
            }

            generatedCommunities.push({
                name: `community_${i + 1}`,
                title,
                summary,
                entities: clusterEnts
            });
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            await client.query("DELETE FROM graph_communities WHERE document_id = $1", [docId]);

            for (const comm of generatedCommunities) {
                await client.query(
                    `INSERT INTO graph_communities (document_id, name, title, summary, entities)
                     VALUES ($1, $2, $3, $4, $5)`,
                    [docId, comm.name, comm.title, comm.summary, JSON.stringify(comm.entities)]
                );
            }
            await client.query('COMMIT');
        } catch (dbErr) {
            await client.query('ROLLBACK');
            throw dbErr;
        } finally {
            client.release();
        }

        res.json({
            success: true,
            message: `Successfully detected and summarized ${generatedCommunities.length} thematic communities.`,
            communities: generatedCommunities
        });

    } catch (err: any) {
        console.error('[POST /api/graph/documents/:id/communities] failed:', err);
        res.status(500).json({ error: err.message });
    }
});

// 5. List Graph Chat Sessions
app.get('/api/graph/chat/sessions', async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId is required' });
    try {
        const result = await pool.query(
            "SELECT id, title, active_document_ids, created_at, updated_at FROM graph_chats WHERE user_id = $1 AND is_deleted = FALSE ORDER BY updated_at DESC",
            [userId]
        );
        res.json({ sessions: result.rows });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// 6. Delete Graph Chat Session
app.delete('/api/graph/chat/sessions/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query("DELETE FROM graph_chats WHERE id = $1", [id]);
        res.json({ success: true });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// 7. Get Graph Chat History
app.post('/api/graph/chat/history', async (req, res) => {
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ error: 'sessionId is required' });
    try {
        const result = await pool.query(
            "SELECT id, role, message as text, reaction, subgraph, communities FROM graph_chat_messages WHERE chat_id = $1 ORDER BY id ASC",
            [sessionId]
        );
        res.json({ history: result.rows });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// 7.5 Save Graph RAG Chat Message Reaction
app.post('/api/graph/chat/message/reaction', async (req, res) => {
    const { messageId, reaction } = req.body;
    if (!messageId) return res.status(400).json({ error: 'messageId is required' });
    try {
        await pool.query(
            "UPDATE graph_chat_messages SET reaction = $1 WHERE id = $2",
            [reaction || null, messageId]
        );
        res.json({ success: true });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// 7.6 Retrieve or Reconstruct Graph Chat Message Sub-graph (For clicking historic messages)
app.get('/api/graph/chat/message/:id/subgraph', async (req, res) => {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'messageId is required' });
    try {
        // A. Fetch message
        const msgRes = await pool.query(
            "SELECT id, chat_id, role, message as text, subgraph FROM graph_chat_messages WHERE id = $1",
            [id]
        );
        if (msgRes.rowCount === 0) {
            return res.status(404).json({ error: 'Message not found' });
        }
        const message = msgRes.rows[0];
        if (message.subgraph) {
            let parsed = message.subgraph;
            if (typeof parsed === 'string') {
                try { parsed = JSON.parse(parsed); } catch (e) {}
            }
            return res.json({ subgraph: parsed });
        }

        // B. Reconstruct subgraph if NULL (fallback logic)
        // Find user query right before this message in the same chat
        const prevMsgRes = await pool.query(
            "SELECT message FROM graph_chat_messages WHERE chat_id = $1 AND id < $2 AND role = 'user' ORDER BY id DESC LIMIT 1",
            [message.chat_id, id]
        );
        const queryText = prevMsgRes.rowCount > 0 ? prevMsgRes.rows[0].message : message.text;

        // Fetch document IDs that were active for this session
        const chatRes = await pool.query("SELECT active_document_ids FROM graph_chats WHERE id = $1", [message.chat_id]);
        let activeDocIds: number[] = [];
        if (chatRes.rowCount > 0 && chatRes.rows[0].active_document_ids) {
            let rawIds = chatRes.rows[0].active_document_ids;
            if (typeof rawIds === 'string') {
                try { rawIds = JSON.parse(rawIds); } catch (e) {}
            }
            if (Array.isArray(rawIds)) {
                activeDocIds = rawIds.map(id => Number(id));
            }
        }
        if (activeDocIds.length === 0) {
            const docsResult = await pool.query('SELECT id FROM graph_documents WHERE is_deleted = FALSE AND is_enabled = TRUE');
            activeDocIds = docsResult.rows.map(row => row.id);
        }

        // Extract keywords from queryText
        let keywords: string[] = [];
        try {
            const extractionPrompt = `Analyze the user's question and extract 1 to 4 key entities, terms, abbreviations, or topics to search in our database. Return them strictly as a simple comma-separated list of terms in the same language. Do not output anything else.
Question: "${queryText}"
Output Example: BMW, Persia Khodro, Warranty
Terms:`;
            const aiExtractResponse = await callAvalAI([{ role: 'user', content: extractionPrompt }], 'gemini-2.5-flash');
            const extractText = aiExtractResponse?.text || aiExtractResponse?.choices?.[0]?.message?.content || '';
            keywords = extractText.split(',').map((t: string) => t.trim().toLowerCase()).filter((t: string) => t.length > 1);
        } catch (err) {
            console.warn('[Message Subgraph Fallback Extract Error]', err);
        }

        if (keywords.length === 0) {
            keywords = queryText.replace(/[?.!,:;()]/g, ' ')
                .split(/\s+/)
                .map((w: string) => w.trim().toLowerCase())
                .filter((w: string) => w.length > 2);
        }

        let nodes: any[] = [];
        let links: any[] = [];

        if (keywords.length > 0 && activeDocIds.length > 0) {
            const likeTerms = keywords.map((k: string) => `%${k}%`);
            const entitiesQuery = `
                SELECT DISTINCT name, type, description 
                FROM graph_entities 
                WHERE document_id = ANY($1::int[]) 
                  AND (
                    name ILIKE ANY($2::text[]) 
                    OR description ILIKE ANY($2::text[])
                  )
                LIMIT 15
            `;
            const entitiesRes = await pool.query(entitiesQuery, [activeDocIds, likeTerms]);
            const matchedEntities = entitiesRes.rows;

            if (matchedEntities.length > 0) {
                const matchedEntityNames = matchedEntities.map(e => e.name);
                const relationshipsQuery = `
                    SELECT DISTINCT source_entity, target_entity, relation_type, description 
                    FROM graph_relationships 
                    WHERE document_id = ANY($1::int[]) 
                      AND (
                        source_entity = ANY($2::text[])
                        OR target_entity = ANY($2::text[])
                        OR source_entity ILIKE ANY($3::text[])
                        OR target_entity ILIKE ANY($3::text[])
                      )
                    LIMIT 20
                `;
                const relsRes = await pool.query(relationshipsQuery, [activeDocIds, matchedEntityNames, likeTerms]);
                const matchedRelationships = relsRes.rows;

                const nodesMap = new Map();
                matchedEntities.forEach(ent => {
                    nodesMap.set(ent.name, { id: ent.name, type: ent.type, val: 1.5, description: ent.description });
                });

                matchedRelationships.forEach(rel => {
                    if (!nodesMap.has(rel.source_entity)) {
                        nodesMap.set(rel.source_entity, { id: rel.source_entity, type: 'Entity', val: 1.0, description: '' });
                    }
                    if (!nodesMap.has(rel.target_entity)) {
                        nodesMap.set(rel.target_entity, { id: rel.target_entity, type: 'Entity', val: 1.0, description: '' });
                    }
                    links.push({
                        source: rel.source_entity,
                        target: rel.target_entity,
                        label: rel.relation_type,
                        description: rel.description
                    });
                });
                nodes = Array.from(nodesMap.values());
            }
        }

        if (nodes.length === 0 && activeDocIds.length > 0) {
            const fallbackEnts = await pool.query(
                `SELECT name, type, description FROM graph_entities WHERE document_id = ANY($1::int[]) LIMIT 8`,
                [activeDocIds]
            );
            const fallbackRels = await pool.query(
                `SELECT source_entity, target_entity, relation_type, description FROM graph_relationships WHERE document_id = ANY($1::int[]) LIMIT 10`,
                [activeDocIds]
            );

            const nodesMap = new Map();
            fallbackEnts.rows.forEach(ent => {
                nodesMap.set(ent.name, { id: ent.name, type: ent.type, val: 1.2, description: ent.description });
            });
            fallbackRels.rows.forEach(rel => {
                if (!nodesMap.has(rel.source_entity)) nodesMap.set(rel.source_entity, { id: rel.source_entity, type: 'Entity', val: 1.0, description: '' });
                if (!nodesMap.has(rel.target_entity)) nodesMap.set(rel.target_entity, { id: rel.target_entity, type: 'Entity', val: 1.0, description: '' });
                links.push({ source: rel.source_entity, target: rel.target_entity, label: rel.relation_type, description: rel.description });
            });
            nodes = Array.from(nodesMap.values());
        }

        const computedSubgraph = { nodes, links };

        // Save computed subgraph back to database to accelerate subsequent requests
        await pool.query(
            "UPDATE graph_chat_messages SET subgraph = $1 WHERE id = $2",
            [JSON.stringify(computedSubgraph), id]
        );

        res.json({ subgraph: computedSubgraph });
    } catch (err: any) {
        console.error('[GET /api/graph/chat/message/:id/subgraph] failed:', err);
        res.status(500).json({ error: err.message });
    }
});

// 8. Core Graph RAG Chat API (Sub-graph Retrieval + Context Fusion + LLM Answer)
app.post('/api/graph/chat', async (req, res) => {
    const { messages, documentIds, appLanguage, sessionId, userId } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'messages are required' });
    }

    const lastMsg = messages[messages.length - 1];
    const userQuery = lastMsg.content || lastMsg.text || '';
    const activeUserId = userId || 'behzad-naderloo';
    const isRtl = appLanguage === 'fa';

    let userMsgId: number | undefined;
    let modelMsgId: number | undefined;

    // A. Save user message to database
    if (sessionId) {
        try {
            const check = await pool.query("SELECT id FROM graph_chats WHERE id = $1", [sessionId]);
            if (check.rowCount === 0) {
                let title = userQuery.trim().split('\n')[0];
                if (title.length > 50) title = title.substring(0, 47) + '...';
                await pool.query(
                    "INSERT INTO graph_chats (id, user_id, title, active_document_ids, created_at, updated_at, is_deleted) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, FALSE)",
                    [sessionId, activeUserId, title || 'New Graph Chat', JSON.stringify(documentIds || [])]
                );
            } else {
                await pool.query(
                    "UPDATE graph_chats SET updated_at = CURRENT_TIMESTAMP, active_document_ids = $1 WHERE id = $2",
                    [JSON.stringify(documentIds || []), sessionId]
                );
            }

            const userInsertRes = await pool.query(
                "INSERT INTO graph_chat_messages (chat_id, role, message, created_at) VALUES ($1, 'user', $2, CURRENT_TIMESTAMP) RETURNING id",
                [sessionId, userQuery]
            );
            userMsgId = userInsertRes.rows[0]?.id;
        } catch (dbErr) {
            console.error('[Graph Chat DB Save User Msg Error]', dbErr);
        }
    }

    try {
        // B. Query matching documents IDs
        let activeDocIds: number[] = [];
        if (Array.isArray(documentIds) && documentIds.length > 0) {
            activeDocIds = documentIds.map(id => Number(id));
        } else {
            // Retrieve all enabled graph docs
            const docsResult = await pool.query('SELECT id FROM graph_documents WHERE is_deleted = FALSE AND is_enabled = TRUE');
            activeDocIds = docsResult.rows.map(row => row.id);
        }

        // Check if any of the active documents has strict_mode enabled
        let isStrictMode = false;
        if (activeDocIds.length > 0) {
            try {
                const strictCheckRes = await pool.query(
                    "SELECT COUNT(*)::int as count FROM graph_documents WHERE id = ANY($1::int[]) AND strict_mode = TRUE",
                    [activeDocIds]
                );
                isStrictMode = strictCheckRes.rows[0]?.count > 0;
            } catch (strictErr) {
                console.error('[Graph Chat] Error checking strict mode:', strictErr);
            }
        }

        if (activeDocIds.length === 0) {
            const noDocsReply = isRtl 
                ? 'لطفاً ابتدا اسناد دانش را در بخش مدیریت بارگذاری کنید یا مطمئن شوید که اسناد فعال هستند.' 
                : 'Please upload knowledge documents in the administration panel first or make sure they are active.';
            
            if (sessionId) {
                await pool.query(
                    "INSERT INTO graph_chat_messages (chat_id, role, message, created_at) VALUES ($1, 'model', $2, CURRENT_TIMESTAMP)",
                    [sessionId, noDocsReply]
                );
            }
            return res.json({ text: noDocsReply, subgraph: { nodes: [], links: [] } });
        }

        // C. Smart Keyword Extraction from User Query
        let keywords: string[] = [];
        try {
            const extractionPrompt = `Analyze the user's question and extract 1 to 4 key entities, terms, abbreviations, or topics to search in our database. Return them strictly as a simple comma-separated list of terms in the same language. Do not output anything else.
Question: "${userQuery}"
Output Example: BMW, Persia Khodro, Warranty
Terms:`;
            
            const aiExtractResponse = await callAvalAI([{ role: 'user', content: extractionPrompt }], 'gemini-2.5-flash');
            const extractText = aiExtractResponse?.text || aiExtractResponse?.choices?.[0]?.message?.content || '';
            keywords = extractText.split(',').map((t: string) => t.trim().toLowerCase()).filter((t: string) => t.length > 1);
        } catch (err) {
            console.warn('[Graph Chat] LLM keyword extraction failed, using fallback regex:', err);
        }

        // Fallback: tokenize query
        if (keywords.length === 0) {
            keywords = userQuery.replace(/[?.!,:;()]/g, ' ')
                .split(/\s+/)
                .map((w: string) => w.trim().toLowerCase())
                .filter((w: string) => w.length > 2);
        }

        // D. Retrieve Sub-graph from Database with Multi-hop Extraction & Community Fusion
        let nodes: any[] = [];
        let links: any[] = [];
        let formattedGraphContext = '';

        // Query active community summaries to include as Global Context
        let communitiesContext = '';
        try {
            const commsRes = await pool.query(
                "SELECT title, summary, entities FROM graph_communities WHERE document_id = ANY($1::int[])",
                [activeDocIds]
            );
            if (commsRes.rowCount > 0) {
                communitiesContext = '--- THEMATIC COMMUNITIES & GLOBAL SUMMARIES ---\n';
                commsRes.rows.forEach(c => {
                    communitiesContext += `Theme: "${c.title}"\n- Summary: ${c.summary}\n`;
                    if (Array.isArray(c.entities)) {
                        communitiesContext += `- Related entities: ${c.entities.slice(0, 8).join(', ')}${c.entities.length > 8 ? '...' : ''}\n`;
                    }
                    communitiesContext += '\n';
                });
            }
        } catch (commErr) {
            console.warn('[Graph Chat] Fetching communities failed:', commErr);
        }

        if (keywords.length > 0) {
            const likeTerms = keywords.map((k: string) => `%${k}%`);

            // Step 1: Find matching entities (Local Graph Search seed)
            const entitiesQuery = `
                SELECT DISTINCT name, type, description 
                FROM graph_entities 
                WHERE document_id = ANY($1::int[]) 
                  AND (
                    name ILIKE ANY($2::text[]) 
                    OR description ILIKE ANY($2::text[])
                  )
                LIMIT 15
            `;
            const entitiesRes = await pool.query(entitiesQuery, [activeDocIds, likeTerms]);
            const matchedEntities = entitiesRes.rows;

            if (matchedEntities.length > 0) {
                const matchedEntityNames = matchedEntities.map(e => e.name);

                // Step 2: Fetch 1-hop relationships (directly connected to seed nodes)
                const rels1Res = await pool.query(`
                    SELECT DISTINCT id, source_entity, target_entity, relation_type, description 
                    FROM graph_relationships 
                    WHERE document_id = ANY($1::int[]) 
                      AND (
                        source_entity = ANY($2::text[])
                        OR target_entity = ANY($2::text[])
                      )
                    LIMIT 20
                `, [activeDocIds, matchedEntityNames]);
                const rels1 = rels1Res.rows;

                // Gather 1-hop neighbor names
                const hop1NamesSet = new Set<string>(matchedEntityNames);
                rels1.forEach(rel => {
                    hop1NamesSet.add(rel.source_entity);
                    hop1NamesSet.add(rel.target_entity);
                });
                const hop1Names = Array.from(hop1NamesSet);

                // Step 3: Fetch 2-hop relationships (Multi-hop Reasoning expansion)
                let rels2: any[] = [];
                if (hop1Names.length > 0 && hop1Names.length < 50) {
                    const rels1Ids = rels1.map(r => r.id);
                    const rels2Res = await pool.query(`
                        SELECT DISTINCT source_entity, target_entity, relation_type, description 
                        FROM graph_relationships 
                        WHERE document_id = ANY($1::int[]) 
                          AND (
                            source_entity = ANY($2::text[])
                            OR target_entity = ANY($2::text[])
                          )
                          AND NOT (id = ANY($3::int[]))
                        LIMIT 15
                    `, [activeDocIds, hop1Names, rels1Ids.length > 0 ? rels1Ids : [-1]]);
                    rels2 = rels2Res.rows;
                }

                const allRelationships = [...rels1, ...rels2];

                // Step 4: Fetch detailed descriptions for all neighbor entities in the multi-hop sub-graph
                const allEntityNamesSet = new Set<string>(matchedEntityNames);
                allRelationships.forEach(rel => {
                    allEntityNamesSet.add(rel.source_entity);
                    allEntityNamesSet.add(rel.target_entity);
                });
                const allEntityNames = Array.from(allEntityNamesSet);

                let subGraphEntities: any[] = [];
                if (allEntityNames.length > 0) {
                    const subEntsRes = await pool.query(`
                        SELECT DISTINCT name, type, description 
                        FROM graph_entities 
                        WHERE document_id = ANY($1::int[]) 
                          AND name = ANY($2::text[])
                    `, [activeDocIds, allEntityNames]);
                    subGraphEntities = subEntsRes.rows;
                } else {
                    subGraphEntities = matchedEntities;
                }

                // Format textual sub-graph context for LLM with Multi-hop information
                formattedGraphContext = '--- LOCAL GRAPH SEARCH: MATCHED ENTITIES ---\n';
                subGraphEntities.forEach(ent => {
                    formattedGraphContext += `- ${ent.name} (${ent.type}): ${ent.description || ''}\n`;
                });

                if (allRelationships.length > 0) {
                    formattedGraphContext += '\n--- MULTI-HOP GRAPH PATHWAYS & RELATIONSHIPS ---\n';
                    allRelationships.forEach(rel => {
                        formattedGraphContext += `- ${rel.source_entity} --[${rel.relation_type}]--> ${rel.target_entity}: "${rel.description || ''}"\n`;
                    });
                }

                // Prepare nodes and links JSON for Interactive Frontend Visual Graph rendering
                const nodesMap = new Map();
                subGraphEntities.forEach(ent => {
                    nodesMap.set(ent.name, { id: ent.name, type: ent.type, val: matchedEntityNames.includes(ent.name) ? 1.6 : 1.1, description: ent.description });
                });

                allRelationships.forEach(rel => {
                    if (!nodesMap.has(rel.source_entity)) {
                        nodesMap.set(rel.source_entity, { id: rel.source_entity, type: 'Entity', val: 0.9, description: '' });
                    }
                    if (!nodesMap.has(rel.target_entity)) {
                        nodesMap.set(rel.target_entity, { id: rel.target_entity, type: 'Entity', val: 0.9, description: '' });
                    }

                    links.push({
                        source: rel.source_entity,
                        target: rel.target_entity,
                        label: rel.relation_type,
                        description: rel.description
                    });
                });

                nodes = Array.from(nodesMap.values());
            }
        }

        if (!formattedGraphContext) {
            // Fallback: If no specific keywords matched, load some general top-degree nodes and links as context
            const fallbackEnts = await pool.query(
                `SELECT name, type, description FROM graph_entities WHERE document_id = ANY($1::int[]) LIMIT 10`,
                [activeDocIds]
            );
            const fallbackRels = await pool.query(
                `SELECT source_entity, target_entity, relation_type, description FROM graph_relationships WHERE document_id = ANY($1::int[]) LIMIT 12`,
                [activeDocIds]
            );

            if (fallbackEnts.rows.length > 0) {
                formattedGraphContext = '--- KNOWLEDGE GRAPH OVERVIEW ---\n';
                fallbackEnts.rows.forEach(ent => {
                    formattedGraphContext += `- ${ent.name} (${ent.type}): ${ent.description}\n`;
                });
                fallbackRels.rows.forEach(rel => {
                    formattedGraphContext += `- ${rel.source_entity} --[${rel.relation_type}]--> ${rel.target_entity}: "${rel.description}"\n`;
                });

                const nodesMap = new Map();
                fallbackEnts.rows.forEach(ent => {
                    nodesMap.set(ent.name, { id: ent.name, type: ent.type, val: 1.2, description: ent.description });
                });
                fallbackRels.rows.forEach(rel => {
                    if (!nodesMap.has(rel.source_entity)) nodesMap.set(rel.source_entity, { id: rel.source_entity, type: 'Entity', val: 1.0, description: '' });
                    if (!nodesMap.has(rel.target_entity)) nodesMap.set(rel.target_entity, { id: rel.target_entity, type: 'Entity', val: 1.0, description: '' });
                    links.push({ source: rel.source_entity, target: rel.target_entity, label: rel.relation_type, description: rel.description });
                });
                nodes = Array.from(nodesMap.values());
            } else {
                formattedGraphContext = isRtl 
                    ? 'پایگاه داده گراف دانش خالی است یا سندی یافت نشد.'
                    : 'The Knowledge Graph is currently empty or contains no extractable relational networks yet.';
            }
        }

        // Combine Global Communities Summary context and Local Multi-hop Search context
        if (communitiesContext) {
            formattedGraphContext = `${communitiesContext}\n\n${formattedGraphContext}`;
        }

        // E. Generate Answer via Gemini Cascade
        let promptInstruction = '';
        if (isStrictMode) {
            promptInstruction = `You are "BMW Persia Khodro Knowledge Graph Assistant", operating under STRICT FAITHFULNESS MODE.
Your absolute directive is to answer the user's question using ONLY the facts explicitly stated in the provided Knowledge Graph context (extracted entities, relationships, and community summaries) below.

CRITICAL RULES:
1. Do NOT use any external pre-trained knowledge, assumptions, or general information from outside the provided context.
2. If the provided context does not contain the answer or sufficient information to answer the question, you MUST respond exactly and only with:
"${isRtl ? 'پاسخی برای این سوال در سند(های) انتخاب شده یافت نشد.' : 'The answer to this question cannot be found in the selected document(s).'}".
3. Do NOT make up, assume, or guess anything. For example, do NOT mention any brands, companies, partnerships, or details (like BAIC, specific dealerships, or unstated features) unless they are explicitly written in the provided context below.
4. If a concept (like "امکانات رفاهی" / welfare amenities) is not explicitly present in the provided context, do NOT write a generic response. Instead, output the exact phrase in Rule 2.
5. Your response must be strictly 100% faithful and restricted to the document context. Do not add any conversational fluff or pre-trained facts.
6. Respond in the language of the query (${isRtl ? 'Persian/Farsi' : 'English'}).

--- KNOWLEDGE GRAPH CONTEXT ---
${formattedGraphContext}`;
        } else {
            promptInstruction = `You are "BMW Persia Khodro Knowledge Graph Assistant", a highly specialized AI designed to navigate relational company knowledge.
Answer the user's question accurately using the provided Knowledge Graph context.
- Prioritize facts from relationships and entity descriptions.
- Synthesize an elegant, comprehensive response that reveals connection paths.
- You are allowed to use general/external pre-trained knowledge to supplement and connect the concepts and facts in the graph to provide a richer, more complete explanation.
- Respond in the language of the query (${isRtl ? 'Persian/Farsi' : 'English'}).
- If the knowledge graph doesn't contain sufficient details to fully answer, answer as best as possible using the graph facts and general knowledge, and mention that it was answered using the extracted knowledge network.

--- KNOWLEDGE GRAPH CONTEXT ---
${formattedGraphContext}`;
        }

        // Construct full chat messages history for context (System instruction must be placed FIRST)
        const promptMessages = [];
        promptMessages.push({ role: 'system', content: promptInstruction });

        const prevMessages = messages.slice(0, messages.length - 1);
        for (const msg of prevMessages) {
            promptMessages.push({ role: msg.role === 'model' || msg.role === 'assistant' ? 'assistant' : 'user', content: msg.content || msg.text || '' });
        }
        
        // Add the user query
        promptMessages.push({ role: 'user', content: userQuery });

        // Pass 0.0 temperature for strict faithfulness, and 0.7 for standard creative exploration
        const runTemperature = isStrictMode ? 0.0 : 0.7;
        const aiResponse = await callAvalAI(promptMessages, 'gemini-2.5-flash', 4000, runTemperature);
        const replyText = aiResponse?.text || aiResponse?.choices?.[0]?.message?.content || (isRtl ? 'متاسفانه خطایی در پردازش پاسخ رخ داد.' : 'Apologies, an error occurred while processing the response.');

        // G. Match and associate thematic communities mentioned in user query or reply text
        let matchedCommunities: any[] = [];
        if (activeDocIds.length > 0) {
            try {
                const commsRes = await pool.query(
                    `SELECT c.id, c.name, c.title, c.summary, c.entities, d.title as document_title 
                     FROM graph_communities c 
                     JOIN graph_documents d ON c.document_id = d.id 
                     WHERE c.document_id = ANY($1::int[])`,
                    [activeDocIds]
                );
                
                const combinedText = (userQuery + " " + replyText).toLowerCase();
                
                for (const row of commsRes.rows) {
                    let entitiesList = row.entities;
                    if (typeof entitiesList === 'string') {
                        try { entitiesList = JSON.parse(entitiesList); } catch (e) {}
                    }
                    if (Array.isArray(entitiesList)) {
                        // Check if any entity in this community is mentioned
                        const isMentioned = entitiesList.some(entity => {
                            if (typeof entity === 'string' && entity.trim().length > 1) {
                                return combinedText.includes(entity.trim().toLowerCase());
                            }
                            return false;
                        });
                        
                        if (isMentioned) {
                            matchedCommunities.push({
                                id: row.id,
                                name: row.name,
                                title: row.title,
                                summary: row.summary,
                                entities: entitiesList,
                                document_title: row.document_title
                            });
                        }
                    }
                }
            } catch (err) {
                console.error('[Graph Chat] Error matching communities:', err);
            }
        }

        // H. Save model response
        if (sessionId) {
            try {
                const modelInsertRes = await pool.query(
                    "INSERT INTO graph_chat_messages (chat_id, role, message, subgraph, communities, created_at) VALUES ($1, 'model', $2, $3, $4, CURRENT_TIMESTAMP) RETURNING id",
                    [sessionId, replyText, JSON.stringify({ nodes, links }), JSON.stringify(matchedCommunities)]
                );
                modelMsgId = modelInsertRes.rows[0]?.id;
            } catch (dbErr) {
                console.error('[Graph Chat DB Save Model Msg Error]', dbErr);
            }
        }

        res.json({
            text: replyText,
            subgraph: { nodes, links },
            communities: matchedCommunities,
            userMessageId: userMsgId,
            modelMessageId: modelMsgId
        });

    } catch (err: any) {
        console.error('[Graph Chat Error]', err);
        res.status(500).json({ error: err.message || 'Error occurred during Graph RAG chat execution.' });
    }
});

// Serve frontend assets and start listening
async function startServer() {
    if (process.env.NODE_ENV !== "production") {
        const { createServer: createViteServer } = await import('vite');
        const vite = await createViteServer({
            server: { middlewareMode: true, hmr: false },
            appType: "spa",
        });
        app.use(vite.middlewares);
    } else {
        const distPath = path.join(process.cwd(), 'dist');
        app.use(express.static(distPath));
        app.get('*all', (req, res) => {
            res.sendFile(path.join(distPath, 'index.html'));
        });
    }

    app.listen(PORT, "0.0.0.0", () => {
        console.log(`[Server] Running on http://localhost:${PORT}`);
    });
}

startServer();
