// ─────────────────────────────────────────────────────────────────────────────
// MediaGeek A.I — Model Registry
// Providers:
//   google      → Gemini (GEMINI env var) — MANTER OFICIAL (melhor custo-benefício)
//   nvidia      → NVIDIA NIM (NVIDIA_API_KEY)
//   xai         → xAI / Grok (GROK env var) — substitui OpenAI (até 80% mais barato)
//   openrouter  → OpenRouter (OPENROUTER_API_KEY) — substitui Anthropic + Groq + Mistral
// ─────────────────────────────────────────────────────────────────────────────

export type ModelProvider = 'google' | 'xai' | 'openrouter' | 'nvidia' | 'other';

export interface AIModel {
    id: string;
    name: string;
    provider: ModelProvider;
    description: string;
    contextWindow?: number;
    maxOutput?: number;
    envKey?: string;
}

export const AVAILABLE_MODELS: AIModel[] = [

    // ── NVIDIA NIM (12 modelos) ────────────────────────────────────────────
    {
        id: 'moonshotai/kimi-k2.6',
        name: 'Kimi K2.6',
        provider: 'nvidia',
        description: 'Modelo de raciocínio avançado da Moonshot AI via NVIDIA',
        contextWindow: 128000,
        envKey: 'NVIDIA_API_KEY'
    },
    {
        id: 'mistralai/mistral-medium-3.5-128b',
        name: 'Mistral Medium 3.5',
        provider: 'nvidia',
        description: 'Modelo médio poderoso da Mistral AI via NVIDIA',
        contextWindow: 128000,
        envKey: 'NVIDIA_API_KEY'
    },
    {
        id: 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning',
        name: 'Nemotron 3 Nano Omni Reasoning',
        provider: 'nvidia',
        description: 'NVIDIA reasoning model for complex tasks',
        contextWindow: 128000,
        envKey: 'NVIDIA_API_KEY'
    },
    {
        id: 'deepseek-ai/deepseek-v4-flash',
        name: 'DeepSeek v4 Flash',
        provider: 'nvidia',
        description: 'Fast and efficient DeepSeek v4 model',
        contextWindow: 128000,
        envKey: 'NVIDIA_API_KEY'
    },
    {
        id: 'deepseek-ai/deepseek-v4-pro',
        name: 'DeepSeek v4 Pro',
        provider: 'nvidia',
        description: 'Highly capable DeepSeek v4 model',
        contextWindow: 128000,
        envKey: 'NVIDIA_API_KEY'
    },
    {
        id: 'z-ai/glm-5.1',
        name: 'GLM 5.1',
        provider: 'nvidia',
        description: 'Advanced Chinese/English bilingual model',
        contextWindow: 128000,
        envKey: 'NVIDIA_API_KEY'
    },
    {
        id: 'minimaxai/minimax-m2.7',
        name: 'MiniMax M2.7',
        provider: 'nvidia',
        description: 'MiniMax AI conversational model',
        contextWindow: 128000,
        envKey: 'NVIDIA_API_KEY'
    },
    {
        id: 'google/gemma-4-31b-it',
        name: 'Gemma 4 31B IT',
        provider: 'nvidia',
        description: "Google's open model optimized for instruction",
        contextWindow: 128000,
        envKey: 'NVIDIA_API_KEY'
    },
    {
        id: 'mistralai/mistral-small-4-119b-2603',
        name: 'Mistral Small 4',
        provider: 'nvidia',
        description: 'Efficient and high-performing Mistral Small 4',
        contextWindow: 128000,
        envKey: 'NVIDIA_API_KEY'
    },
    {
        id: 'openai/gpt-oss-120b',
        name: 'GPT-OSS 120B',
        provider: 'nvidia',
        description: 'Open-weights large model by OpenAI via NVIDIA',
        contextWindow: 128000,
        envKey: 'NVIDIA_API_KEY'
    },
    {
        id: 'meta/llama-3.1-8b-instruct',
        name: 'Llama 3.1 8B Instruct',
        provider: 'nvidia',
        description: "Meta's latest instruction-tuned 8B model",
        contextWindow: 128000,
        envKey: 'NVIDIA_API_KEY'
    },
    {
        id: 'meta/llama-3.2-11b-vision-instruct',
        name: 'Llama 3.2 11B Vision Instruct',
        provider: 'nvidia',
        description: "Meta's Llama 3.2 vision-capable 11B model",
        contextWindow: 128000,
        envKey: 'NVIDIA_API_KEY'
    },

    // ── GOOGLE GEMINI (manter oficial — melhor custo-benefício do mercado) ──
    {
        id: 'gemini-2.5-flash',
        name: 'Gemini 2.5 Flash',
        provider: 'google',
        description: "Google's latest fast and efficient model",
        contextWindow: 1000000,
        envKey: 'GEMINI'
    },
    {
        id: 'gemini-1.5-pro',
        name: 'Gemini 1.5 Pro',
        provider: 'google',
        description: "Google's most capable multimodal model",
        contextWindow: 1000000,
        envKey: 'GEMINI'
    },
    {
        id: 'gemini-1.5-flash',
        name: 'Gemini 1.5 Flash',
        provider: 'google',
        description: 'Fast and efficient multimodal model',
        contextWindow: 1000000,
        envKey: 'GEMINI'
    },

    // ── xAI / GROK (substitui OpenAI — até 80% mais barato) ──────────────
    // Chave: GROK (já configurada no Replit secrets e VPS .env.local)
    {
        id: 'grok-3-fast',
        name: 'Grok 3 Fast',
        provider: 'xai',
        description: 'xAI Grok 3 Fast — ultra-cheap, GPT-level speed ($0.20/M tokens)',
        contextWindow: 131072,
        envKey: 'GROK'
    },
    {
        id: 'grok-3',
        name: 'Grok 3',
        provider: 'xai',
        description: 'xAI Grok 3 — powerful reasoning with real-time web search',
        contextWindow: 131072,
        envKey: 'GROK'
    },
    {
        id: 'grok-3-mini-fast',
        name: 'Grok 3 Mini Fast',
        provider: 'xai',
        description: 'xAI smallest and fastest model — ideal for simple tasks',
        contextWindow: 131072,
        envKey: 'GROK'
    },

    // ── OPENROUTER (substitui Anthropic + Groq + Mistral) ─────────────────
    // Chave: OPENROUTER_API_KEY (adicionar em /admin após obter em openrouter.ai/keys)
    // Anthropic → DeepSeek (qualidade Claude, preço 10x menor)
    {
        id: 'deepseek/deepseek-chat-v3-0324',
        name: 'DeepSeek Chat V3',
        provider: 'openrouter',
        description: 'DeepSeek V3 via OpenRouter — Claude-level quality, fraction of cost',
        contextWindow: 64000,
        envKey: 'OPENROUTER_API_KEY'
    },
    {
        id: 'anthropic/claude-3.5-haiku',
        name: 'Claude 3.5 Haiku',
        provider: 'openrouter',
        description: 'Anthropic Claude 3.5 Haiku via OpenRouter — fast and balanced',
        contextWindow: 200000,
        envKey: 'OPENROUTER_API_KEY'
    },
    // Groq → Llama 3.3 via OpenRouter (melhor que Llama 3 70B original)
    {
        id: 'meta-llama/llama-3.3-70b-instruct',
        name: 'Llama 3.3 70B Instruct',
        provider: 'openrouter',
        description: 'Meta Llama 3.3 70B via OpenRouter — replaces direct Groq key',
        contextWindow: 128000,
        envKey: 'OPENROUTER_API_KEY'
    },
    // Mistral → Mixtral via OpenRouter
    {
        id: 'mistralai/mixtral-8x7b-instruct',
        name: 'Mixtral 8x7B Instruct',
        provider: 'openrouter',
        description: 'Mistral Mixtral 8x7B via OpenRouter — no Mistral API key needed',
        contextWindow: 32768,
        envKey: 'OPENROUTER_API_KEY'
    },
];

export const DEFAULT_MODEL_ID = 'gemini-2.5-flash';

// Primary fallback when Gemini quota is hit → Grok 3 Fast (ultra-cheap)
export const FALLBACK_MODEL_ID = 'grok-3-fast';

export function getModelById(id: string): AIModel | undefined {
    return AVAILABLE_MODELS.find(model => model.id === id);
}
