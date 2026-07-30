import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const STATS = [
  { label: "TASKS COMPLETED", value: "3" },
  { label: "WEBSITES DEPLOYED", value: "1" },
  { label: "DOCUMENTS GENERATED", value: "2" },
];

export function Scene5() {
  const [showHeader, setShowHeader] = useState(false);
  const [visibleStats, setVisibleStats] = useState<number>(0);

  useEffect(() => {
    setTimeout(() => setShowHeader(true), 400);
    
    const timers: NodeJS.Timeout[] = [];
    STATS.forEach((_, idx) => {
      timers.push(
        setTimeout(() => setVisibleStats(idx + 1), 1200 + idx * 800)
      );
    });

    return () => timers.forEach((t) => clearTimeout(t));
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <motion.div
        className="mb-[6vh] text-center"
        initial={{ opacity: 0, y: -40 }}
        animate={showHeader ? { opacity: 1, y: 0 } : { opacity: 0, y: -40 }}
        transition={{ duration: 0.6 }}
      >
        <h2
          className="text-[6vw] font-bold tracking-wider"
          style={{
            fontFamily: "Space Mono, monospace",
            color: "#00FF41",
            textShadow: "0 0 30px rgba(0, 255, 65, 0.9)",
          }}
        >
          REPORT GENERATED
        </h2>
        <div className="mt-4 h-[3px] bg-[#00FFFF] w-[40vw] mx-auto" />
      </motion.div>

      {/* Stats card */}
      <motion.div
        className="border-4 bg-black/80 px-[4vw] py-[4vh] space-y-[3vh]"
        style={{
          borderColor: "#00FF41",
          boxShadow: "0 0 40px rgba(0, 255, 65, 0.4), inset 0 0 20px rgba(0, 255, 65, 0.1)",
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        {STATS.map((stat, idx) => (
          <motion.div
            key={idx}
            className="flex items-center justify-between gap-[8vw]"
            initial={{ opacity: 0, x: -30 }}
            animate={
              idx < visibleStats
                ? { opacity: 1, x: 0 }
                : { opacity: 0, x: -30 }
            }
            transition={{ duration: 0.5 }}
          >
            <span
              className="text-[2.2vw] font-bold"
              style={{
                fontFamily: "Space Mono, monospace",
                color: "#00FFFF",
              }}
            >
              {stat.label}
            </span>
            <span
              className="text-[4vw] font-bold"
              style={{
                fontFamily: "Space Mono, monospace",
                color: "#00FF41",
                textShadow: "0 0 15px rgba(0, 255, 65, 0.8)",
              }}
            >
              {stat.value}
            </span>
          </motion.div>
        ))}
      </motion.div>

      {/* Checkmark animation */}
      <motion.div
        className="mt-[6vh]"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 3, duration: 0.4, type: "spring", stiffness: 300 }}
      >
        <svg
          width="80"
          height="80"
          viewBox="0 0 100 100"
          className="stroke-[#00FF41]"
          style={{
            filter: "drop-shadow(0 0 20px rgba(0, 255, 65, 0.8))",
          }}
        >
          <motion.path
            d="M 20 50 L 40 70 L 80 30"
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 3.2, duration: 0.6, ease: "easeOut" }}
          />
        </svg>
      </motion.div>
    </motion.div>
  );
}
