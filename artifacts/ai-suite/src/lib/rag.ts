import { GoogleGenAI } from "@google/genai";
import { db } from './db';
import { supabaseAdmin } from './supabase';
import { extractTextFromFile, chunkText } from './docProcessor';
import fs from 'fs';

import path from 'path';
const LOG_DIR = path.join(process.cwd(), 'tmp');
const LOG_FILE = path.join(LOG_DIR, 'rag-logs.txt');

function debugLog(msg: string) {
    const timestamp = new Date().toISOString();
    const formattedMsg = `[${timestamp}] ${msg}\n`;
    try {
        fs.appendFileSync(LOG_FILE, formattedMsg);
    } catch (e) {}
}

const RAW_KEY = process.env.GEMINI || process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
const GEMINI_API_KEY = RAW_KEY;

const client = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export async function getEmbedding(text: string): Promise<number[]> {
    try {
        debugLog(`[getEmbedding] Generating for length: ${text.length}`);
        const result = await client.models.embedContent({
            model: "models/gemini-embedding-001",
            contents: [{ parts: [{ text }] }],
            config: {
                outputDimensionality: 768
            }
        });

        const embedding = result.embeddings?.[0]?.values;
        if (!embedding) throw new Error("No embedding returned");
        
        debugLog(`[getEmbedding] SUCCESS: length=${embedding.length}, first5=[${embedding.slice(0, 5)}]`);
        return embedding;
    } catch (error: any) {
        debugLog(`[getEmbedding] ERROR: ${error.message}`);
        throw error;
    }
}

export async function processDocument(buffer: Buffer, filename: string, docId: string) {
    try {
        debugLog(`[processDocument] START: ${filename} (id: ${docId})`);
        const text = await extractTextFromFile(buffer, filename);
        if (!text || text.length < 10) {
            throw new Error("Extracted text is too short or empty.");
        }

        const textChunks = chunkText(text);
        debugLog(`[processDocument] Created ${textChunks.length} chunks`);

        const chunksWithEmbeddings = await Promise.all(
            textChunks.map(async (content) => {
                const embedding = await getEmbedding(content);
                return { documentId: docId, content, embedding };
            })
        );

        await db.saveDocumentChunks(chunksWithEmbeddings);
        await db.updateDocumentStatus(docId, 'completed');
        debugLog(`[processDocument] SUCCESS: ${filename}`);

    } catch (error: any) {
        debugLog(`[processDocument] ERROR: ${error.message}`);
        await db.updateDocumentStatus(docId, 'error');
        throw error;
    }
}

export async function processText(text: string, filename: string, docId: string) {
    try {
        debugLog(`[processText] START: ${filename} (id: ${docId})`);
        if (!text || text.length < 10) {
            throw new Error("Text is too short or empty.");
        }

        const textChunks = chunkText(text);
        debugLog(`[processText] Created ${textChunks.length} chunks`);

        const chunksWithEmbeddings = await Promise.all(
            textChunks.map(async (content) => {
                const embedding = await getEmbedding(content);
                return { documentId: docId, content, embedding };
            })
        );

        await db.saveDocumentChunks(chunksWithEmbeddings);
        await db.updateDocumentStatus(docId, 'completed');
        debugLog(`[processText] SUCCESS: ${filename}`);

    } catch (error: any) {
        debugLog(`[processText] ERROR: ${error.message}`);
        await db.updateDocumentStatus(docId, 'error');
        throw error;
    }
}

export async function getRAGContext(userEmail: string, query: string, limit = 4): Promise<string> {
    try {
        debugLog(`[getRAGContext] START: email=${userEmail}, query="${query}"`);
        const queryEmbedding = await getEmbedding(query);

        // 1. Vector Match (Threshold 0.1)
        let matches = await db.matchDocumentChunks(userEmail, queryEmbedding, limit, 0.1);
        debugLog(`[getRAGContext] Vector matches (0.1): ${matches.length}`);

        // 2. Vector Match (Threshold 0.01Fallback)
        if (matches.length === 0) {
            matches = await db.matchDocumentChunks(userEmail, queryEmbedding, limit, 0.01);
            debugLog(`[getRAGContext] Vector fallback (0.01): ${matches.length}`);
        }

        // 3. Keyword Match Fallback
        if (matches.length === 0) {
            matches = await db.keywordSearchChunks(userEmail, query, limit);
            debugLog(`[getRAGContext] Keyword fallback: ${matches.length}`);
        }

        // 4. Emergency Latest Chunks Fallback
        if (matches.length === 0) {
            const { data: latest, error: latestErr } = await supabaseAdmin
                .from('document_chunks')
                .select('id, document_id, content')
                .limit(limit);
            
            if (latest && latest.length > 0) {
                debugLog(`[getRAGContext] Latest chunks fallback: ${latest.length}`);
                matches = latest.map((c: any) => ({
                    id: c.id,
                    documentId: c.document_id,
                    content: c.content
                }));
            }
        }

        if (matches.length === 0) {
            debugLog(`[getRAGContext] FINAL: No information found.`);
            return "";
        }

        return matches.map(m => m.content).join("\n\n---\n\n");
    } catch (error: any) {
        debugLog(`[getRAGContext] ERROR: ${error.message}`);
        return "";
    }
}

export async function generateGroundedResponseV3(userEmail: string, query: string, history: { role: string; content: string }[] = []): Promise<string> {
    try {
        const context = await getRAGContext(userEmail, query);

        const systemPrompt = `Você é o assistente de suporte da MediaGeek AI (mediageek.io) — plataforma SaaS brasileira de inteligência artificial.

REGRAS DE CONDUTA:
- Responda com base nestas informações. Se não souber algo específico, diga que não tem certeza e oriente o usuário a verificar o site.
- NUNCA concorde com o usuário se ele afirmar algo incorreto sobre a plataforma. Corrija educadamente com os dados corretos abaixo.
- Não invente informações. Prefira "não tenho certeza" a dar uma resposta errada.

PLANOS E FERRAMENTAS (informação oficial):

🆓 PLANO FREE — R$0 (sem cartão):
- 300 tokens válidos por 14 dias
- Acesso a APENAS 10 ferramentas básicas:
  1. AI Chat
  2. Tradutor (50+ idiomas)
  3. Corretor Gramatical
  4. Resumidor de Texto
  5. Content Writer
  6. Instagram Caption
  7. Hashtag Generator
  8. Gerador de Receitas
  9. Story Generator
  10. Gerador de Piadas

⚡ PLANO STARTER — $9/mês · 5.000 tokens:
- Tudo do Free + 23 ferramentas a mais (33 no total)
- Inclui: Image Generator, Code Generator, Blog Post, Article Writer, Content Improver, Headline Generator, Poem Generator, Paraphraser, Tone Converter, Social Media Suite, Twitter Thread, LinkedIn Post, YouTube Description, Content Calendar, Email Writer, Currículo, Interview Prep, Story Ideas, Song Lyrics, Character Creator, Name Generator, Sentiment, Quiz

🚀 PLANO PRO — $29/mês · 25.000 tokens:
- Tudo do Starter + 78 ferramentas a mais (111 no total)
- Inclui ferramentas avançadas: Reel Generator (IA de vídeo), Music Generator, Website Builder, Game Maker, Logo Generator, Avatar Studio, SQL Generator, OCR, ferramentas jurídicas, SEO, negócios, saúde e mais

🏢 PLANO ENTERPRISE — $99/mês · 100.000 tokens:
- Tudo do Pro + 6 ferramentas exclusivas (117 no total)
- Exclusivo: Browser Control, Trading Terminal, AI Agents (Research, Writing, Code, Marketing)

PAGAMENTO: Stripe (cartão internacional) ou Mercado Pago (PIX/boleto). Preços em USD.

Responda sempre em PT-BR por padrão, a menos que o usuário escreva em outro idioma. Seja direto, amigável e preciso.${context ? "\n\nCONTEXTO ADICIONAL:\n" + context : ""}`;

        // userPrompt now built inline with history

        const xaiKey = process.env.GROK || process.env.XAI_API_KEY;
        if (!xaiKey) {
            debugLog("[generateGroundedResponseV3] No xAI key found");
            return "Support assistant is not configured. Please contact the administrator.";
        }

        for (const model of ["grok-3-fast", "grok-3-mini"]) {
            try {
                debugLog(`[generateGroundedResponseV3] Trying ${model}`);
                const res = await fetch("https://api.x.ai/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${xaiKey}`
                    },
                    body: JSON.stringify({
                        model,
                        messages: [
                            { role: "system", content: systemPrompt },
                            ...history.map(h => ({ role: h.role === 'assistant' ? 'assistant' : 'user', content: h.content })),
                            { role: "user", content: query }
                        ],
                        max_tokens: 1024,
                        temperature: 0.3
                    })
                });

                if (!res.ok) {
                    const err = await res.text();
                    debugLog(`[generateGroundedResponseV3] ${model} error ${res.status}: ${err.slice(0, 200)}`);
                    continue;
                }

                const data = await res.json();
                const answer = data.choices?.[0]?.message?.content || "";
                if (answer) {
                    debugLog(`[generateGroundedResponseV3] ${model} OK, length=${answer.length}`);
                    return answer;
                }
            } catch (err: any) {
                debugLog(`[generateGroundedResponseV3] ${model} threw: ${err.message}`);
                continue;
            }
        }

        return "I could not generate a response at this time. Please try again.";

    } catch (error: any) {
        debugLog(`[generateGroundedResponseV3] ERROR: ${error.message}`);
        return "I encountered an error while searching the knowledge base. Please try again.";
    }
}
