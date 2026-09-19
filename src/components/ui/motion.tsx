"use client";

import { motion, type Variants, type HTMLMotionProps } from "framer-motion";

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const stagger: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const springEasing = [0.25, 0.1, 0.25, 1] as const;

interface FadeInProps extends HTMLMotionProps<"div"> {
  delay?: number;
}

export function FadeIn({ delay = 0, className, children, ...props }: FadeInProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={fadeInUp}
      transition={{ duration: 0.6, delay, ease: springEasing }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function FadeInView({ delay = 0, className, children, ...props }: FadeInProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
        },
      }}
      transition={{ duration: 0.6, delay, ease: springEasing }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

interface StaggerContainerProps extends HTMLMotionProps<"div"> {
  delay?: number;
}

export function StaggerContainer({ delay = 0, className, children, ...props }: StaggerContainerProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={stagger}
      transition={{ staggerChildren: 0.1, delayChildren: delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ className, children, ...props }: HTMLMotionProps<"div">) {
  return (
    <motion.div
      className={className}
      variants={staggerItem}
      transition={{ duration: 0.5, ease: springEasing }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

interface ScaleOnHoverProps {
  children: React.ReactNode;
  className?: string;
}

export function ScaleOnHover({ children, className }: ScaleOnHoverProps) {
  return (
    <motion.div
      className={className}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {children}
    </motion.div>
  );
}

interface CounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

export function Counter({ value, suffix = "", prefix = "", className }: CounterProps) {
  return (
    <motion.span
      className={className}
      initial={{ opacity: 0, y: 10 }}
      whileInView="visible"
      viewport={{ once: true }}
      variants={{
        visible: {
          opacity: 1,
          y: 0,
        },
      }}
      transition={{ duration: 0.6, ease: springEasing }}
    >
      {prefix}{value}{suffix}
    </motion.span>
  );
}

interface GlowOnHoverProps {
  children: React.ReactNode;
  className?: string;
}

export function GlowOnHover({ children, className }: GlowOnHoverProps) {
  return (
    <motion.div
      className={className}
      whileHover={{ boxShadow: "0 0 30px rgba(79, 124, 255, 0.25)" }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}
