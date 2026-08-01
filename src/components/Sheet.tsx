"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

export default function Sheet({
  title,
  onClose,
  children,
}: {
  title?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div onClick={onClose} className="absolute inset-0 bg-black/50" />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="relative z-10 max-h-[88vh] w-full overflow-y-auto rounded-t-[28px] px-5 pb-8 pt-2.5"
        style={{
          backgroundColor: "var(--bg-elevated)",
          boxShadow: "0 -12px 40px rgba(0,0,0,0.35)",
          maxWidth: 480,
          margin: "0 auto",
        }}
      >
        <div
          className="mx-auto mb-4 h-1 w-9 rounded-full"
          style={{ backgroundColor: "var(--border)" }}
        />
        {title && <h2 className="mb-4 text-center text-base font-bold">{title}</h2>}
        {children}
      </motion.div>
    </div>
  );
}
