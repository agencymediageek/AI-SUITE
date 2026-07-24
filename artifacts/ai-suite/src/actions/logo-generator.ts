"use server";

import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export interface LogoGenerationOptions {
    brandName: string;
    tagline?: string;
    style: string;
    primaryColor?: string;
    secondaryColor?: string;
    typographyStyle?: string;
    industry?: string;
    iconPreference?: string;
    additionalPrompt?: string;
}

function buildLogoPrompt(options: LogoGenerationOptions): string {
    const parts: string[] = [];
    parts.push(`Professional logo design for a brand called "${options.brandName}".`);
    if (options.tagline) parts.push(`Tagline: "${options.tagline}".`);

    const styleDescriptions: Record<string, string> = {
        minimal: "Minimalist design with clean lines, ample whitespace.",
        modern: "Modern, contemporary with sleek geometry.",
        luxury: "Upscale, premium, elegant serif typography.",
        tech: "Technology-forward, geometric precision, digital aesthetics.",
        mascot: "Character-based mascot, friendly and memorable.",
        flat: "Flat design, bold solid colors, no gradients.",
        "3d": "Three-dimensional with depth and realistic lighting.",
        gradient: "Smooth modern gradients with flowing color transitions.",
        monogram: "Monogram lettermark with typographic artistry.",
        geometric: "Geometric shapes — circles, triangles, hexagons.",
    };
    if (options.style && styleDescriptions[options.style]) parts.push(styleDescriptions[options.style]);
    if (options.primaryColor) parts.push(`Primary color: ${options.primaryColor}.`);
    if (options.secondaryColor) parts.push(`Secondary color: ${options.secondaryColor}.`);

    const typoMap: Record<string, string> = {
        serif: "Elegant serif typography.",
        "sans-serif": "Clean sans-serif typography.",
        display: "Distinctive display typography.",
        handwritten: "Handwritten script typography.",
        monospace: "Monospace typography.",
    };
    if (options.typographyStyle && typoMap[options.typographyStyle]) parts.push(typoMap[options.typographyStyle]);
    if (options.industry) parts.push(`Industry: ${options.industry}.`);

    const iconMap: Record<string, string> = {
        "icon-only": "Icon-only mark, no text.",
        "text-only": "Text-only wordmark, no icon.",
        "icon-text": "Icon combined with brand name.",
        abstract: "Abstract symbol for brand essence.",
        lettermark: "Brand initials as primary visual.",
    };
    if (options.iconPreference && iconMap[options.iconPreference]) parts.push(iconMap[options.iconPreference]);
    if (options.additionalPrompt?.trim()) parts.push(options.additionalPrompt.trim());

    parts.push("Clean solid white background. Vector-quality, scalable, professional. High contrast, balanced, centered composition.");
    return parts.join(" ");
}

export async function generateLogoAction(options: LogoGenerationOptions) {
    try {
        const session: any = await getSession();
        if (!session) return { error: "Unauthorized" };

        const settings = await db.getSettings();
        const cost = settings.aiLimits?.["logo-generator"] ?? settings.aiLimits?.["image-generator"] ?? 50;
        const balance = await db.getTokenBalance(session.email);
        if (balance.balance < cost) return { error: "Tokens insuficientes. Por favor, recarregue seu saldo." };

        const xaiKey = process.env.GROK || process.env.XAI_API_KEY;
        if (!xaiKey) return { error: "Serviço de geração de logo não configurado." };

        const prompt = buildLogoPrompt(options);

        const response = await fetch("https://api.x.ai/v1/images/generations", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${xaiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "grok-2-image",
                prompt,
                n: 1,
                response_format: "b64_json",
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("xAI Logo Error:", data);
            return { error: data?.error?.message || "Falha ao gerar logo. Tente novamente." };
        }

        const b64 = data?.data?.[0]?.b64_json;
        if (!b64) return { error: "Nenhuma imagem retornada. Ajuste o prompt e tente novamente." };

        await db.updateTokenBalance(session.email, cost, "consume", "logo-generator");

        return { success: true, image: b64, prompt };

    } catch (error: any) {
        console.error("Logo Generation Error:", error);
        return { error: error.message || "Falha ao gerar logo." };
    }
}
