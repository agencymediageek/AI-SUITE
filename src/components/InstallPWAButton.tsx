"use client";

import { useState, useEffect } from "react";
import { Download, Smartphone, X, Share } from "lucide-react";
import { cn } from "@/lib/utils";

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

interface InstallPWAButtonProps {
    isCollapsed?: boolean;
    isMobile?: boolean;
}

export function InstallPWAButton({ isCollapsed = false, isMobile = false }: InstallPWAButtonProps) {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isInstalled, setIsInstalled] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") return;
        if (window.matchMedia("(display-mode: standalone)").matches) { setIsInstalled(true); return; }
        const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window as any).MSStream;
        setIsIOS(ios);
        const handler = (e: Event) => { e.preventDefault(); setDeferredPrompt(e as BeforeInstallPromptEvent); };
        const installedHandler = () => { setIsInstalled(true); setDeferredPrompt(null); };
        window.addEventListener("beforeinstallprompt", handler);
        window.addEventListener("appinstalled", installedHandler);
        return () => { window.removeEventListener("beforeinstallprompt", handler); window.removeEventListener("appinstalled", installedHandler); };
    }, []);

    if (isInstalled) return null;

    const handleInstall = async () => {
        if (deferredPrompt) {
            await deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === "accepted") { setDeferredPrompt(null); setIsInstalled(true); }
        } else { setShowModal(true); }
    };

    if (isCollapsed && !isMobile) {
        return (
            <button onClick={handleInstall} title="Baixar App"
                className="w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-all duration-200 mx-auto mb-1">
                <Download className="w-[18px] h-[18px]" />
            </button>
        );
    }

    return (
        <>
            <div className="px-3 pb-2">
                <button onClick={handleInstall}
                    className={cn(
                        "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl",
                        "bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20",
                        "hover:from-primary/20 hover:border-primary/40",
                        "text-primary transition-all duration-200 active:scale-95 group"
                    )}>
                    <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/30 transition-colors">
                        <Smartphone className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex flex-col items-start min-w-0">
                        <span className="text-[12px] font-semibold leading-tight">Baixar App</span>
                        <span className="text-[10px] text-muted-foreground leading-tight">Instalar na tela inicial</span>
                    </div>
                    <Download className="w-3.5 h-3.5 ml-auto flex-shrink-0 opacity-60" />
                </button>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}>
                    <div className="w-full max-w-sm rounded-2xl bg-card border border-border shadow-2xl p-5 space-y-4" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center">
                                    <Smartphone className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold">Instalar MediaGeek AI</p>
                                    <p className="text-[11px] text-muted-foreground">Adicionar à tela inicial</p>
                                </div>
                            </div>
                            <button onClick={() => setShowModal(false)} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-muted transition-colors">
                                <X className="w-4 h-4 text-muted-foreground" />
                            </button>
                        </div>

                        {isIOS ? (
                            <div className="space-y-3">
                                <p className="text-xs text-muted-foreground">Siga os passos no <strong>Safari</strong>:</p>
                                <div className="space-y-2">
                                    {[
                                        { n: 1, text: "Toque no ícone Compartilhar", icon: <Share className="w-4 h-4 inline text-blue-500 mx-1" /> },
                                        { n: 2, text: '"Adicionar à Tela de Início"' },
                                        { n: 3, text: '"Adicionar" para confirmar' }
                                    ].map(({ n, text, icon }) => (
                                        <div key={n} className="flex items-start gap-2.5">
                                            <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{n}</span>
                                            <p className="text-xs text-foreground leading-snug">{text}{icon}</p>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-[10px] text-muted-foreground/60 text-center">⚠️ Funciona apenas pelo Safari no iPhone/iPad</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <p className="text-xs text-muted-foreground">Siga os passos no seu navegador:</p>
                                <div className="space-y-2">
                                    {[
                                        "Toque no menu ⋮ (três pontos) no canto superior direito",
                                        '"Adicionar à tela inicial" ou "Instalar app"',
                                        '"Adicionar" para confirmar'
                                    ].map((text, i) => (
                                        <div key={i} className="flex items-start gap-2.5">
                                            <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                                            <p className="text-xs text-foreground leading-snug">{text}</p>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-[10px] text-muted-foreground/60 text-center">Disponível no Chrome, Edge e Samsung Internet</p>
                            </div>
                        )}

                        <button onClick={() => setShowModal(false)} className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                            Entendido
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
