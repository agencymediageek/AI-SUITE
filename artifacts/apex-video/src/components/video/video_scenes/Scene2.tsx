import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const CONFIG_ITEMS = [
  { label: "LANGUAGE", value: "PT-BR / EN / ES" },
  { label: "AI NAME", value: "APEX_ASSISTANT_01" },
  { label: "VOICE_ENABLED", value: "TRUE" },
  { label: "CAMERA_ENABLED", value: "TRUE" },
  { label: "SITE_BUILDER", value: "ACTIVE" },
  { label: "DOCUMENT_GEN", value: "ACTIVE" },
  { label: "DNS_CONFIG", value: "AUTO" },
];

export function Scene2() {
  const [visibleItems, setVisibleItems] = useState<number>(0);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    CONFIG_ITEMS.forEach((_, idx) => {
      timers.push(setTimeout(() => setVisibleItems(idx + 1), 400 + idx * 600));
    });
    return () => timers.forEach((t) => clearTimeout(t));
  }, []);

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
          MEETING CONFIGURATION
        </h2>
        <div className="mt-2 h-[2px] bg-[#00FFFF] w-[30vw] mx-auto opacity-60" />
      </motion.div>

      {/* Config items */}
      <div className="space-y-[2vh] w-full max-w-[60vw]">
        {CONFIG_ITEMS.map((item, idx) => (
          <motion.div
            key={idx}
            className="flex items-center justify-between border border-[#003311] bg-black/60 px-[2vw] py-[1.5vh]"
            initial={{ opacity: 0, x: -50 }}
            animate={
              idx < visibleItems
                ? { opacity: 1, x: 0 }
                : { opacity: 0, x: -50 }
            }
            transition={{ duration: 0.4 }}
          >
            <span
              className="text-[1.8vw] font-bold"
              style={{
                fontFamily: "Space Mono, monospace",
                color: "#00FFFF",
              }}
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

      {/* Blinking cursor indicator at bottom */}
      {visibleItems >= CONFIG_ITEMS.length && (
        <motion.div
          className="mt-[4vh] text-[2vw]"
          style={{
            fontFamily: "Space Mono, monospace",
            color: "#00FF41",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          PRESS START TO ACTIVATE_
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
