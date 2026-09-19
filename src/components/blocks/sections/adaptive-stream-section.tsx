"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Sparkles, Brain, Zap, Target, BarChart3, Gem, Compass } from "lucide-react";

function HydratedCounter({ cycleStep }: { cycleStep: number }) {
  const [value, setValue] = useState("000");

  useEffect(() => {
    requestAnimationFrame(() => {
      setValue(String(Math.floor(Math.random() * 900 + 100) + cycleStep * 7).slice(0, 3));
    });
  }, [cycleStep]);

  return (
    <motion.span
      animate={{ opacity: [0.3, 1, 0.3] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      {value}
    </motion.span>
  );
}

const nodes = [
  { id: 0, label: "Analyze", desc: "Scanning knowledge gaps across your learning history", icon: Brain, color: "from-primary-500/25 to-primary-400/10", textColor: "text-primary-400", angle: -90 },
  { id: 1, label: "Map", desc: "Building a personalized knowledge graph of your strengths", icon: Compass, color: "from-secondary-500/25 to-secondary-400/10", textColor: "text-secondary-400", angle: -30 },
  { id: 2, label: "Adapt", desc: "Calibrating content difficulty to your optimal challenge zone", icon: Zap, color: "from-accent-500/25 to-accent-400/10", textColor: "text-accent-400", angle: 30 },
  { id: 3, label: "Guide", desc: "Recommending the next-best action for maximum growth", icon: Target, color: "from-emerald-500/25 to-emerald-400/10", textColor: "text-emerald-400", angle: 90 },
  { id: 4, label: "Track", desc: "Measuring retention, consistency, and skill acquisition", icon: BarChart3, color: "from-amber-500/25 to-amber-400/10", textColor: "text-amber-400", angle: 150 },
  { id: 5, label: "Predict", desc: "Forecasting learning outcomes to prevent drop-off", icon: Gem, color: "from-rose-500/25 to-rose-400/10", textColor: "text-rose-400", angle: 210 },
];

const PROCESS_CYCLE = [0, 1, 2, 3, 4, 5, 0, 1, 2, 3, 4, 5];

export function AdaptiveStreamSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ w: 700, h: 600 });
  const [activeNode, setActiveNode] = useState<number | null>(null);
  const [cycleStep, setCycleStep] = useState(0);

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const springX = useSpring(mouseX, { stiffness: 60, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 60, damping: 30 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      setDimensions({ w: el.offsetWidth, h: el.offsetHeight });
    };
    requestAnimationFrame(update);
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      mouseX.set((e.clientX - rect.left) / rect.width);
      mouseY.set((e.clientY - rect.top) / rect.height);
    };
    el.addEventListener("mousemove", handleMove);
    return () => el.removeEventListener("mousemove", handleMove);
  }, [mouseX, mouseY]);

  // Processing cycle animation
  useEffect(() => {
    const interval = setInterval(() => {
      setCycleStep((prev) => (prev + 1) % PROCESS_CYCLE.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  const cx = dimensions.w / 2;
  const cy = dimensions.h / 2;
  const radius = Math.min(dimensions.w, dimensions.h) * 0.32;

  const nodePositions = nodes.map((n) => {
    const rad = (n.angle * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  });

  return (
    <section className="relative overflow-hidden px-6 py-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-0 h-[500px] w-[500px] rounded-full bg-blue-200/10 dark:bg-blue-500/5 blur-[140px] animate-ambient-float" />
        <div className="absolute right-1/4 bottom-0 h-[450px] w-[450px] rounded-full bg-purple-200/8 dark:bg-purple-500/4 blur-[120px] animate-ambient-float" style={{ animationDelay: "-7s" }} />
      </div>

      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16 text-center"
        >
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-primary-400">
            Adaptive Intelligence Stream
          </p>
          <h2 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl text-foreground">
            Your personal AI learning engine
          </h2>
        </motion.div>

        <div
          ref={containerRef}
          className="relative mx-auto max-w-[700px]"
          style={{ aspectRatio: "700 / 600" }}
        >
          {/* SVG connections */}
          <svg className="absolute inset-0 h-full w-full pointer-events-none" viewBox={`0 0 ${dimensions.w} ${dimensions.h}`}>
            {/* Connection paths from center to each node */}
            {nodes.map((node, i) => {
              const pos = nodePositions[i];
              const isActive = activeNode === i || cycleStep === i;
              return (
                <motion.path
                  key={`conn-${i}`}
                  d={`M ${cx} ${cy} Q ${(cx + pos.x) / 2 + (i % 2 === 0 ? -40 : 40)} ${(cy + pos.y) / 2 + 20} ${pos.x} ${pos.y}`}
                  fill="none"
                  stroke={`var(--color-${i < 2 ? "primary" : i < 4 ? "accent" : "secondary"})`}
                  strokeWidth={isActive ? 1.5 : 0.5}
                  strokeOpacity={isActive ? 0.3 : 0.1}
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, delay: 0.3 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                />
              );
            })}

            {/* Orbital ring */}
            <motion.circle
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth="0.5"
              strokeOpacity="0.06"
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.5 }}
            />

            {/* Processing pulse ring */}
            <motion.circle
              cx={cx}
              cy={cy}
              r={radius * 0.7}
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth="0.5"
              strokeOpacity="0.08"
              animate={{ r: [radius * 0.7, radius * 0.9, radius * 0.7], opacity: [0.08, 0.02, 0.08] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
          </svg>

          {/* Central Hub */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1], type: "spring", stiffness: 80 }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <div className="glass-hero-panel flex h-24 w-24 items-center justify-center rounded-[28px] sm:h-28 sm:w-28">
              <div className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-primary-500/10 via-accent-500/5 to-transparent" />
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10 flex flex-col items-center gap-1"
              >
                <Brain className="h-8 w-8 text-primary-400 sm:h-9 sm:w-9" />
                <span className="text-[7px] font-bold uppercase tracking-[0.15em] text-primary-400/70">AI Core</span>
              </motion.div>
              <motion.div
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-[28px] bg-primary-400/5 blur-xl"
              />
            </div>
          </motion.div>

          {/* Satellite nodes */}
          {nodes.map((node, i) => {
            const pos = nodePositions[i];
            const Icon = node.icon;
            const isActive = activeNode === i;
            const isProcessing = cycleStep === i;
            const hubX = useTransform(springX, (v) => (v - 0.5) * 10);
            const hubY = useTransform(springY, (v) => (v - 0.5) * 10);

            return (
              <div
                key={node.id}
                className="absolute cursor-pointer"
                style={{
                  left: `${(pos.x / dimensions.w) * 100}%`,
                  top: `${(pos.y / dimensions.h) * 100}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                style={{ x: hubX, y: hubY }}
                onMouseEnter={() => setActiveNode(i)}
                onMouseLeave={() => setActiveNode(null)}
              >
                {/* Node glow */}
                <motion.div
                  animate={{
                    opacity: isProcessing ? 0.6 : isActive ? 0.4 : 0,
                    scale: isProcessing ? 1.3 : isActive ? 1.2 : 0.8,
                  }}
                  transition={{ duration: 0.4 }}
                  className={`absolute inset-0 rounded-full bg-gradient-to-br ${node.color} blur-xl`}
                />

                {/* Node body */}
                <motion.div
                  animate={{
                    scale: isProcessing ? 1.1 : isActive ? 1.05 : 1,
                  }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className={`glass-hero-card relative flex h-14 w-14 items-center justify-center rounded-[18px] sm:h-16 sm:w-16 shadow-lg transition-shadow duration-300 ${isActive ? "shadow-primary-500/20" : ""}`}
                >
                  <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${node.textColor}`} />
                  {isProcessing && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-primary-400 border-2 border-background"
                    />
                  )}
                </motion.div>

                {/* Label */}
                <motion.p
                  animate={{ opacity: isActive ? 1 : 0.5 }}
                  className="mt-2 text-center text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground"
                >
                  {node.label}
                </motion.p>

                {/* Detail card */}

                {/* Status text below */}
                <motion.div
                  animate={{ opacity: isProcessing ? 1 : 0, y: isProcessing ? 0 : 4 }}
                  transition={{ duration: 0.3 }}
                  className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-max max-w-[140px] text-center"
                >
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="flex items-center gap-1.5 text-[9px] font-medium text-primary-400/60"
                  >
                    <span className="h-1 w-1 rounded-full bg-primary-400/60" />
                    processing
                  </motion.div>
                </motion.div>
                </motion.div>
              </div>
              );
            })}

          {/* Inline detail cards shown on hover */}
          {activeNode !== null && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="absolute left-1/2 -translate-x-1/2 bottom-[8%] w-full max-w-sm px-4"
            >
              <div className="glass-hero-panel rounded-[20px] p-5 text-center">
                <p className="text-sm font-semibold text-foreground mb-1">{nodes[activeNode].label}</p>
                <p className="text-xs text-muted-foreground/70 leading-relaxed">{nodes[activeNode].desc}</p>
              </div>
            </motion.div>
          )}

          {/* Processing stream indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 1.5 }}
            className="absolute top-[6%] right-[6%] flex items-center gap-2"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="h-1.5 w-1.5 rounded-full bg-green-400/60"
            />
            <span className="text-[9px] font-medium uppercase tracking-[0.15em] text-green-400/50">Live</span>
          </motion.div>

          {/* Stream data counter */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 1.8 }}
            className="absolute top-[6%] left-[6%]"
          >
            <div className="flex items-center gap-1.5 text-[9px] font-mono text-muted-foreground/30">
              <motion.span
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                ~
              </motion.span>
              <HydratedCounter cycleStep={cycleStep} />
              <span>ops/s</span>
            </div>
          </motion.div>
        </div>

        {/* Bottom description */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-12 text-center text-sm text-muted-foreground/60 max-w-xl mx-auto leading-relaxed"
        >
          NEOT&apos;s adaptive intelligence continuously analyzes your learning patterns,
          calibrates content difficulty, and optimizes your personal growth trajectory in real time.
        </motion.p>

        {/* Stream activity feed */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1.2 }}
          className="mt-10 mx-auto max-w-lg"
        >
          <div className="flex flex-col gap-2">
            {[
              "Knowledge mapping complete — 12 strengths identified",
              "Adaptive path calibrated to visual-spatial learning style",
              "Difficulty optimized — challenge zone at 78%",
            ].map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 1.5 + i * 0.2 }}
                className="flex items-center gap-3 text-xs text-muted-foreground/50"
              >
                <motion.div
                  animate={{ opacity: [0.3, 0.8, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                  className="h-1 w-1 rounded-full bg-primary-400/60 flex-shrink-0"
                />
                <span>{msg}</span>
                <motion.span
                  animate={{ opacity: [0.2, 0.6, 0.2] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.5 }}
                  className="text-[9px] font-mono text-muted-foreground/20 ml-auto"
                >
                  {(120 + i * 30).toString()}ms
                </motion.span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
