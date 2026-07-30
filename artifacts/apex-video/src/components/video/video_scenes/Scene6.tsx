import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { type Lang, VIDEO_I18N, t } from "@/lib/video/i18n";

const MATRIX_CHARS = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜｦﾝ";

export function Scene6({ lang = 'en' }: { lang?: Lang }) {
  const [showGlobe, setShowGlobe] = useState(false);
  const [showUrl, setShowUrl] = useState(false);
  const [showTagline, setShowTagline] = useState(false);

  useEffect(() => {
    setTimeout(() => setShowGlobe(true), 400);
    setTimeout(() => setShowUrl(true), 1200);
    setTimeout(() => setShowTagline(true), 2000);
  }, []);

  const tagline = t(VIDEO_I18N.scene6.tagline, lang);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Matrix Globe */}
      <motion.div
        className="relative flex items-center justify-center mb-[6vh]"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={showGlobe ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
        transition={{ duration: 0.8, type: "spring", stiffness: 200 }}
      >
        <motion.div
          className="w-[20vw] h-[20vw] rounded-full border-4 relative overflow-hidden"
          style={{
            borderColor: "#00FF41",
            background: "radial-gradient(circle at 30% 30%, #00FF41, #003311, #000000)",
          }}
          animate={{
            filter: [
              "drop-shadow(0 0 30px rgba(0, 255, 65, 0.6))",
              "drop-shadow(0 0 60px rgba(0, 255, 65, 0.9))",
              "drop-shadow(0 0 30px rgba(0, 255, 65, 0.6))",
            ],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          {Array.from({ length: 30 }).map((_, idx) => (
            <motion.div
              key={idx}
              className="absolute text-[0.8vw] font-mono"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                color: "#00FF41",
                opacity: Math.random() * 0.5 + 0.3,
              }}
              animate={{
                opacity: [
                  Math.random() * 0.5 + 0.3,
                  Math.random() * 0.7 + 0.3,
                  Math.random() * 0.5 + 0.3,
                ],
              }}
              transition={{ duration: 2, repeat: Infinity, delay: Math.random() }}
            >
              {MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)]}
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* URL */}
      <motion.div
        className="text-[4.5vw] font-bold tracking-wider mb-[4vh]"
        style={{
          fontFamily: "Space Mono, monospace",
          color: "#00FF41",
          textShadow: "0 0 25px rgba(0, 255, 65, 0.8)",
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={showUrl ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6 }}
      >
        apex.techsites.ai
      </motion.div>

      {/* Tagline */}
      <motion.div
        className="text-[2vw] tracking-widest"
        style={{
          fontFamily: "Space Mono, monospace",
          color: "#00FFFF",
          textShadow: "0 0 15px rgba(0, 255, 255, 0.6)",
        }}
        initial={{ opacity: 0 }}
        animate={showTagline ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.8 }}
      >
        {tagline}
      </motion.div>

      {/* Corner accents */}
      <motion.div
        className="absolute top-[10vh] left-[10vw] w-[15vw] h-[15vh] border-t-4 border-l-4"
        style={{ borderColor: "#00FF41" }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.6, scale: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      />
      <motion.div
        className="absolute top-[10vh] right-[10vw] w-[15vw] h-[15vh] border-t-4 border-r-4"
        style={{ borderColor: "#00FFFF" }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.6, scale: 1 }}
        transition={{ delay: 0.8, duration: 0.8 }}
      />
      <motion.div
        className="absolute bottom-[10vh] left-[10vw] w-[15vw] h-[15vh] border-b-4 border-l-4"
        style={{ borderColor: "#00FFFF" }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.6, scale: 1 }}
        transition={{ delay: 1.0, duration: 0.8 }}
      />
      <motion.div
        className="absolute bottom-[10vh] right-[10vw] w-[15vw] h-[15vh] border-b-4 border-r-4"
        style={{ borderColor: "#00FF41" }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.6, scale: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
      />
    </motion.div>
  );
}
