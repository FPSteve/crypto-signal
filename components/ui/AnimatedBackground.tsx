"use client";

import { motion } from "framer-motion";

export function AnimatedBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Green orb */}
      <motion.div
        className="absolute h-[300px] w-[300px] rounded-full opacity-[0.07]"
        style={{
          background: "radial-gradient(circle, rgba(52,211,153,0.6) 0%, transparent 70%)",
          filter: "blur(60px)",
          top: "10%",
          left: "15%",
        }}
        animate={{
          x: [0, 30, -20, 0],
          y: [0, -25, 15, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      {/* Blue orb */}
      <motion.div
        className="absolute h-[250px] w-[250px] rounded-full opacity-[0.05]"
        style={{
          background: "radial-gradient(circle, rgba(96,165,250,0.6) 0%, transparent 70%)",
          filter: "blur(60px)",
          top: "20%",
          right: "20%",
        }}
        animate={{
          x: [0, -25, 20, 0],
          y: [0, 20, -30, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      {/* Warm accent orb */}
      <motion.div
        className="absolute h-[200px] w-[200px] rounded-full opacity-[0.04]"
        style={{
          background: "radial-gradient(circle, rgba(248,113,113,0.5) 0%, transparent 70%)",
          filter: "blur(60px)",
          bottom: "15%",
          left: "40%",
        }}
        animate={{
          x: [0, 20, -15, 0],
          y: [0, -15, 25, 0],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}
