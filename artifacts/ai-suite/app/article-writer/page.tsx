"use client";

import { ToolPage } from "@/components/tools/ToolPage";
import { FileText } from "lucide-react";

export default function ArticleWriterPage() {
    return (
        <ToolPage
            toolId="article-writer"
            title="Redator de Artigos"
            description="Crie artigos bem fundamentados e informativos sobre qualquer tema."
            icon={FileText}
            placeholder="Descreva o tema do artigo, o tamanho e os pontos principais a cobrir..."
            examplePrompts={[
                "Escreva um artigo sobre o futuro das energias renováveis",
                "Crie um texto informativo sobre boas práticas de segurança cibernética",
                "Gere um artigo sobre dicas de produtividade no trabalho remoto",
            ]}
            tokenCost={25}
            gradient="from-blue-500 to-cyan-600"
            category="Writing"
        />
    );
}
