import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { type Lang, VIDEO_I18N } from "@/lib/video/i18n";

export function Scene4({ lang = 'en' }: { lang?: Lang }) {
  const lines = VIDEO_I18N.scene4.lines[lang] ?? VIDEO_I18N.scene4.lines.en;
  const [visibleLines, setVisibleLines] = useState<number>(0);

  useEffect(() => {
    setVisibleLines(0);
    const timers: NodeJS.Timeout[] = [];
    lines.forEach((_, idx) => {
      timers.push(setTimeout(() => setVisibleLines(idx + 1), idx * 400 + 600));
    });
    return () => timers.forEach((t) => clearTimeout(t));
  }, [lang]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center px-[8vw]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.5 }}
    >
      {/* Terminal header */}
      <motion.div
        className="w-full max-w-[80vw] mb-[2vh]"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div
          className="text-[2vw] font-bold px-[2vw] py-[1vh] border-b-2"
          style={{
            fontFamily: "Space Mono, monospace",
            color: "#00FFFF",
            borderColor: "#00FF41",
            background: "linear-gradient(to bottom, #001100, #000000)",
          }}
        >
          APEX TERMINAL v2.0.1
        </div>
      </motion.div>

      {/* Terminal content */}
      <div
        className="w-full max-w-[80vw] h-[60vh] overflow-hidden border-2 px-[2vw] py-[2vh]"
        style={{
          fontFamily: "Space Mono, monospace",
          borderColor: "#00FF41",
          background: "#000000",
        }}
      >
        <div className="space-y-[1vh]">
          {lines.map((line, idx) => (
            <motion.div
              key={idx}
              className="text-[1.6vw]"
              style={{
                color: line.includes("[ OK ]") ? "#00FF41" : "#00FFFF",
                textShadow: "0 0 8px rgba(0, 255, 65, 0.5)",
              }}
              initial={{ opacity: 0, x: -10 }}
              animate={idx < visibleLines ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
            >
              {line}
              {idx === visibleLines - 1 && idx < lines.length - 1 && (
                <motion.span
                  className="inline-block ml-1"
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                >
                  █
                </motion.span>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Glitch effect */}
      <motion.div
        className="absolute w-[80vw] h-[60vh] border-2 pointer-events-none"
        style={{ borderColor: "#00FFFF" }}
        animate={{ opacity: [0, 0.3, 0], x: [0, 2, -2, 0] }}
        transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 3 }}
      />
    </motion.div>
  );
}
