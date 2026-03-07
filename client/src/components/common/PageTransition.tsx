/**
 * PageTransition Component
 * 
 * Wraps page content with smooth enter/exit animations.
 * Use this wrapper in all page components for consistent transitions.
 */

import { motion } from "framer-motion";
import { pageVariants } from "../../lib/motion";

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      className={className}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
    >
      {children}
    </motion.div>
  );
}
