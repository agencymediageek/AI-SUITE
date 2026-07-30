import { motion } from "framer-motion";

export function Scanlines() {
  return (
    <>
      {/* Moving scanline */}
      <motion.div
        className="absolute left-0 right-0 h-24 pointer-events-none z-50"
        style={{
          background: "linear-gradient(to bottom, transparent 0%, rgba(0, 255, 65, 0.08) 50%, transparent 100%)",
        }}
        initial={{ y: "-100%" }}
        animate={{ y: "100vh" }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      
      {/* Static scanline texture */}
      <div
        className="absolute inset-0 pointer-events-none z-40 opacity-10"
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            rgba(0, 255, 65, 0.03) 0px,
            transparent 1px,
            transparent 2px,
            rgba(0, 255, 65, 0.03) 3px
          )`,
        }}
      />
    </>
  );
}
