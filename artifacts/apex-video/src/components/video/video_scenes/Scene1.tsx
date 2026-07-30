import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const MATRIX_CHARS = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜｦﾝ01";
const LOGO_TEXT = "APEX CORE";

export function Scene1() {
  const [revealedChars, setRevealedChars] = useState<number>(0);
  const [showTagline, setShowTagline] = useState(false);

  useEffect(() => {
    // Reveal logo characters one by one
    const charTimers: NodeJS.Timeout[] = [];
    LOGO_TEXT.split("").forEach((_, idx) => {
      charTimers.push(
        setTimeout(() => setRevealedChars(idx + 1), 200 + idx * 150)
      );
    });

    // Show tagline after logo is fully revealed
    charTimers.push(
      setTimeout(() => setShowTagline(true), 200 + LOGO_TEXT.length * 150 + 600)
    );

    return () => charTimers.forEach((t) => clearTimeout(t));
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.8 }}
    >
      {/* Logo text with character reveal */}
      <div className="relative">
        <motion.h1
          className="text-[12vw] font-bold tracking-wider text-center"
          style={{
            fontFamily: "Space Mono, monospace",
            color: "#00FF41",
            textShadow: "0 0 30px rgba(0, 255, 65, 0.8), 0 0 60px rgba(0, 255, 65, 0.4)",
          }}
        >
          {LOGO_TEXT.split("").map((char, idx) => (
            <motion.span
              key={idx}
              initial={{ opacity: 0 }}
              animate={{
                opacity: idx < revealedChars ? 1 : 0,
              }}
              transition={{ duration: 0.1 }}
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </motion.h1>

        {/* Matrix character corruption effect during reveal */}
        {revealedChars < LOGO_TEXT.length && (
          <motion.span
            className="absolute text-[12vw] font-bold"
            style={{
              left: `${(revealedChars / LOGO_TEXT.length) * 100}%`,
              top: 0,
              color: "#00FFFF",
              fontFamily: "Space Mono, monospace",
            }}
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.3, repeat: Infinity }}
          >
            {MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)]}
          </motion.span>
        )}
      </div>

      {/* Tagline */}
      <motion.p
        className="mt-8 text-[2.5vw] tracking-widest text-center"
        style={{
          fontFamily: "Space Mono, monospace",
          color: "#00FFFF",
          textShadow: "0 0 15px rgba(0, 255, 255, 0.6)",
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={showTagline ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6 }}
      >
        AI THAT CONDUCTS YOUR MEETINGS
      </motion.p>

      {/* Pulsing border box around content */}
      <motion.div
        className="absolute border-2 pointer-events-none"
        style={{
          borderColor: "#00FF41",
          width: "80vw",
          height: "50vh",
        }}
        initial={{ opacity: 0, scale: 1.2 }}
        animate={{ opacity: [0, 0.4, 0.4], scale: 1 }}
        transition={{ duration: 1.5, times: [0, 0.5, 1] }}
      />
    </motion.div>
  );
}
