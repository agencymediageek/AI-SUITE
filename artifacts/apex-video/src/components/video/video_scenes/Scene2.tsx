import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { type Lang, VIDEO_I18N, t } from "@/lib/video/i18n";

export function Scene2({ lang = 'en' }: { lang?: Lang }) {
  const [visibleItems, setVisibleItems] = useState<number>(0);

  const items = VIDEO_I18N.scene2.items[lang] ?? VIDEO_I18N.scene2.items.en;
  const header = t(VIDEO_I18N.scene2.header, lang);
  const pressStart = t(VIDEO_I18N.scene2.pressStart, lang);

  useEffect(() => {
    setVisibleItems(0);
    const timers: NodeJS.Timeout[] = [];
    items.forEach((_, idx) => {
      timers.push(setTimeout(() => setVisibleItems(idx + 1), 400 + idx * 600));
    });
    return () => timers.forEach((t) => clearTimeout(t));
  }, [lang]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center px-[10vw]"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <motion.div
        className="mb-[4vh] text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <h2
          className="text-[5vw] font-bold tracking-widest"
          style={{
            fontFamily: "Space Mono, monospace",
            color: "#00FF41",
            textShadow: "0 0 20px rgba(0, 255, 65, 0.8)",
          }}
        >
          {header}
        </h2>
        <div className="mt-2 h-[2px] bg-[#00FFFF] w-[30vw] mx-auto opacity-60" />
      </motion.div>

      {/* Config items */}
      <div className="space-y-[2vh] w-full max-w-[60vw]">
        {items.map((item, idx) => (
          <motion.div
            key={idx}
            className="flex items-center justify-between border border-[#003311] bg-black/60 px-[2vw] py-[1.5vh]"
            initial={{ opacity: 0, x: -50 }}
            animate={idx < visibleItems ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.4 }}
          >
            <span
              className="text-[1.8vw] font-bold"
              style={{ fontFamily: "Space Mono, monospace", color: "#00FFFF" }}
            >
              {item.label}
            </span>
            <span
              className="text-[1.8vw]"
              style={{
                fontFamily: "Space Mono, monospace",
                color: "#00FF41",
                textShadow: "0 0 10px rgba(0, 255, 65, 0.6)",
              }}
            >
              {item.value}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Blinking cursor */}
      {visibleItems >= items.length && (
        <motion.div
          className="mt-[4vh] text-[2vw]"
          style={{ fontFamily: "Space Mono, monospace", color: "#00FF41" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {pressStart}
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          >
            █
          </motion.span>
        </motion.div>
      )}
    </motion.div>
  );
}
