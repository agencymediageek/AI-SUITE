import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const MATRIX_CHARS = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜｦﾝ01234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ";

interface RainColumn {
  id: number;
  left: string;
  chars: string[];
  duration: number;
  delay: number;
}

export function MatrixRain() {
  const [columns, setColumns] = useState<RainColumn[]>([]);

  useEffect(() => {
    const columnCount = 40;
    const newColumns: RainColumn[] = [];
    
    for (let i = 0; i < columnCount; i++) {
      const charCount = Math.floor(Math.random() * 15) + 10;
      const chars = Array.from({ length: charCount }, () => 
        MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)]
      );
      
      newColumns.push({
        id: i,
        left: `${(i / columnCount) * 100}%`,
        chars,
        duration: Math.random() * 10 + 15,
        delay: Math.random() * 5,
      });
    }
    
    setColumns(newColumns);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none opacity-20">
      {columns.map((column) => (
        <motion.div
          key={column.id}
          className="absolute top-0 font-mono text-xs leading-tight"
          style={{ left: column.left }}
          initial={{ y: "-100%" }}
          animate={{ y: "100vh" }}
          transition={{
            duration: column.duration,
            delay: column.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {column.chars.map((char, idx) => (
            <div
              key={idx}
              className="text-[#00FF41]"
              style={{
                opacity: idx === column.chars.length - 1 ? 1 : Math.random() * 0.5 + 0.3,
              }}
            >
              {char}
            </div>
          ))}
        </motion.div>
      ))}
    </div>
  );
}
