import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export function Scene3() {
  const [waveAmplitudes, setWaveAmplitudes] = useState<number[]>(
    Array(24).fill(0)
  );
  const [showLabel, setShowLabel] = useState(false);

  useEffect(() => {
    // Animate wave bars to simulate AI speaking
    const interval = setInterval(() => {
      setWaveAmplitudes((prev) =>
        prev.map(() => Math.random() * 0.7 + 0.3)
      );
    }, 120);

    setTimeout(() => setShowLabel(true), 800);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 0.7 }}
    >
      {/* Status label */}
      <motion.div
        className="mb-[6vh] text-center"
        initial={{ opacity: 0, y: -30 }}
        animate={showLabel ? { opacity: 1, y: 0 } : { opacity: 0, y: -30 }}
        transition={{ duration: 0.5 }}
      >
        <h3
          className="text-[3.5vw] font-bold tracking-widest"
          style={{
            fontFamily: "Space Mono, monospace",
            color: "#00FFFF",
            textShadow: "0 0 15px rgba(0, 255, 255, 0.8)",
          }}
        >
          SESSION ACTIVE
        </h3>
      </motion.div>

      {/* Matrix Globe - pulsing green sphere */}
      <motion.div
        className="relative flex items-center justify-center"
        animate={{
          filter: [
            "drop-shadow(0 0 40px rgba(0, 255, 65, 0.6))",
            "drop-shadow(0 0 80px rgba(0, 255, 65, 0.9))",
            "drop-shadow(0 0 40px rgba(0, 255, 65, 0.6))",
          ],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div
          className="w-[30vw] h-[30vw] rounded-full border-4 relative overflow-hidden"
          style={{
            borderColor: "#00FF41",
            background: "radial-gradient(circle at 30% 30%, #00FF41, #003311, #000000)",
          }}
        >
          {/* Matrix characters on the sphere surface */}
          {Array.from({ length: 40 }).map((_, idx) => (
            <motion.div
              key={idx}
              className="absolute text-[1vw] font-mono"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                color: "#00FF41",
                opacity: Math.random() * 0.6 + 0.2,
              }}
              animate={{
                opacity: [
                  Math.random() * 0.6 + 0.2,
                  Math.random() * 0.8 + 0.2,
                  Math.random() * 0.6 + 0.2,
                ],
              }}
              transition={{ duration: 2, repeat: Infinity, delay: Math.random() }}
            >
              {String.fromCharCode(65 + Math.floor(Math.random() * 26))}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Sound wave bars around the globe */}
      <div className="absolute flex items-end gap-[0.8vw] justify-center">
        {waveAmplitudes.map((amplitude, idx) => (
          <motion.div
            key={idx}
            className="w-[1.2vw] bg-[#00FFFF] rounded-t"
            style={{
              height: `${amplitude * 15}vh`,
              boxShadow: "0 0 10px rgba(0, 255, 255, 0.8)",
            }}
            animate={{
              height: `${amplitude * 15}vh`,
            }}
            transition={{ duration: 0.1 }}
          />
        ))}
      </div>

      {/* Status indicators */}
      <motion.div
        className="absolute bottom-[10vh] flex gap-[4vw] text-[1.5vw]"
        style={{
          fontFamily: "Space Mono, monospace",
          color: "#00FF41",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <div className="flex items-center gap-2">
          <motion.div
            className="w-[1vw] h-[1vw] rounded-full bg-[#00FF41]"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <span>LISTENING</span>
        </div>
        <div className="flex items-center gap-2">
          <motion.div
            className="w-[1vw] h-[1vw] rounded-full bg-[#00FFFF]"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
          />
          <span>PROCESSING</span>
        </div>
        <div className="flex items-center gap-2">
          <motion.div
            className="w-[1vw] h-[1vw] rounded-full bg-[#00FF41]"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
          />
          <span>EXECUTING</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
