"use client";

import Link from "next/link";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { ArrowUpRight } from "lucide-react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "framer-motion";

const SMOOTHING = 0.52;
const SEEK_EPSILON = 0.045;
const VIDEO_END_PROGRESS = 0.82;
const HANDOFF_START_PROGRESS = 0.76;

function dissolveOpacity(progress: number, delay: number) {
  const stageProgress = Math.min(
    1,
    Math.max(0, (progress - delay) / (1 - delay)),
  );
  return 1 - stageProgress * stageProgress * (3 - 2 * stageProgress);
}

interface ScrollVideoHeroProps {
  children: ReactNode;
}

export function ScrollVideoHero({ children }: ScrollVideoHeroProps) {
  const sceneRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const targetVideoProgressRef = useRef(0);
  const renderedProgressRef = useRef(0);
  const sceneProgressRef = useRef(0);
  const sceneIsVisibleRef = useRef(true);
  const animationFrameRef = useRef<number | null>(null);
  const copyFadeProgressRef = useRef(0);
  const handoffProgressRef = useRef(0);
  const [copyFadeProgress, setCopyFadeProgress] = useState(0);
  const [handoffProgress, setHandoffProgress] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sceneRef,
    offset: ["start start", "end end"],
  });

  const publishPortalState = useCallback(
    (nextProgress: number, isActive: boolean, isInMotion: boolean) => {
      document.documentElement.dataset.abhiPortalProgress =
        String(nextProgress);
      document.documentElement.dataset.abhiPortalLocked = String(isActive);
      document.documentElement.dataset.abhiPortalInMotion = String(isInMotion);
      window.dispatchEvent(
        new CustomEvent("abhi-portal-state", {
          detail: { progress: nextProgress, locked: isActive },
        }),
      );
    },
    [],
  );

  const renderVideoFrame = useCallback(function renderVideoFrame() {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration)) {
      animationFrameRef.current = null;
      return;
    }

    const difference =
      targetVideoProgressRef.current - renderedProgressRef.current;
    const nextRenderedProgress =
      Math.abs(difference) < 0.001
        ? targetVideoProgressRef.current
        : renderedProgressRef.current + difference * SMOOTHING;

    renderedProgressRef.current = nextRenderedProgress;
    const nextTime = video.duration * nextRenderedProgress;
    if (
      Math.abs(video.currentTime - nextTime) >= SEEK_EPSILON ||
      nextRenderedProgress === targetVideoProgressRef.current
    ) {
      video.currentTime = nextTime;
    }

    animationFrameRef.current =
      nextRenderedProgress === targetVideoProgressRef.current
        ? null
        : window.requestAnimationFrame(renderVideoFrame);
  }, []);

  const setSceneProgress = useCallback(
    (nextProgress: number) => {
      const normalizedProgress = Math.min(1, Math.max(0, nextProgress));
      sceneProgressRef.current = normalizedProgress;
      targetVideoProgressRef.current = Math.min(
        1,
        normalizedProgress / VIDEO_END_PROGRESS,
      );

      const nextCopyFadeProgress = Math.min(
        1,
        Math.max(0, (normalizedProgress - 0.012) / 0.24),
      );
      if (
        Math.abs(copyFadeProgressRef.current - nextCopyFadeProgress) >= 0.018 ||
        nextCopyFadeProgress === 0 ||
        nextCopyFadeProgress === 1
      ) {
        copyFadeProgressRef.current = nextCopyFadeProgress;
        setCopyFadeProgress(nextCopyFadeProgress);
      }

      const rawHandoffProgress = Math.min(
        1,
        Math.max(
          0,
          (normalizedProgress - HANDOFF_START_PROGRESS) /
            (1 - HANDOFF_START_PROGRESS),
        ),
      );
      const nextHandoffProgress =
        rawHandoffProgress * rawHandoffProgress * (3 - 2 * rawHandoffProgress);
      if (
        Math.abs(handoffProgressRef.current - nextHandoffProgress) >= 0.012 ||
        nextHandoffProgress === 0 ||
        nextHandoffProgress === 1
      ) {
        handoffProgressRef.current = nextHandoffProgress;
        setHandoffProgress(nextHandoffProgress);
      }

      publishPortalState(
        normalizedProgress,
        normalizedProgress < 1,
        sceneIsVisibleRef.current && normalizedProgress > 0.015,
      );

      if (!animationFrameRef.current) {
        animationFrameRef.current =
          window.requestAnimationFrame(renderVideoFrame);
      }
    },
    [publishPortalState, renderVideoFrame],
  );

  useMotionValueEvent(scrollYProgress, "change", setSceneProgress);

  useEffect(() => {
    setSceneProgress(scrollYProgress.get());
    const scene = sceneRef.current;
    const observer = scene
      ? new IntersectionObserver(([entry]) => {
          sceneIsVisibleRef.current = entry.isIntersecting;
          const progress = sceneProgressRef.current;
          publishPortalState(
            progress,
            progress < 1,
            entry.isIntersecting && progress > 0.015,
          );
        })
      : null;
    if (scene && observer) observer.observe(scene);

    return () => {
      observer?.disconnect();
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [publishPortalState, scrollYProgress, setSceneProgress]);

  const headingOpacity = dissolveOpacity(copyFadeProgress, 0.05);
  const descriptionOpacity = dissolveOpacity(copyFadeProgress, 0.16);
  const ctaOpacity = dissolveOpacity(copyFadeProgress, 0.26);
  const hintOpacity = dissolveOpacity(copyFadeProgress, 0.1);
  const handoffOpacity = prefersReducedMotion
    ? handoffProgress > 0.5
      ? 1
      : 0
    : handoffProgress;

  return (
    <section ref={sceneRef} className="relative h-[220svh] bg-[#05060d]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <video
          ref={videoRef}
          aria-label="A glowing portal opens into the skilloopz learning experience"
          className="absolute inset-0 h-full w-full object-cover object-[60%_center] will-change-[filter,opacity,transform] sm:object-center"
          style={{
            filter: prefersReducedMotion
              ? "none"
              : `blur(${handoffProgress * 3}px) brightness(${1 - handoffProgress * 0.2})`,
            opacity: 1 - handoffProgress * 0.12,
            transform: prefersReducedMotion
              ? "none"
              : `scale(${1 + handoffProgress * 0.025})`,
          }}
          muted
          playsInline
          preload="auto"
          onLoadedMetadata={() => setSceneProgress(scrollYProgress.get())}
        >
          <source src="/videos/abhi-portal-hero.mp4" type="video/mp4" />
        </video>
        <div
          aria-hidden={copyFadeProgress === 1}
          className="relative z-10 mx-auto flex h-full max-w-[1360px] items-center px-5 pt-20 sm:px-8 sm:pt-20 lg:px-12"
        >
          <motion.div
            initial={{ opacity: 0, filter: "blur(10px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-[18rem] [text-shadow:0_2px_22px_rgba(0,0,0,.7)] sm:max-w-[660px]"
          >
            <motion.div
              animate={{
                y: [0, -4, 0],
                filter: [
                  "drop-shadow(0 0 0 rgba(192,109,255,0))",
                  "drop-shadow(0 0 16px rgba(192,109,255,.2))",
                  "drop-shadow(0 0 0 rgba(192,109,255,0))",
                ],
              }}
              transition={{
                duration: 5.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <h1
                style={{
                  opacity: headingOpacity,
                  filter: `blur(${(1 - headingOpacity) * 9}px)`,
                  transform: `scale(${0.985 + headingOpacity * 0.015})`,
                }}
                className="origin-left font-serif text-[clamp(2.25rem,11vw,3.4rem)] leading-[.91] tracking-[-.055em] text-white will-change-[opacity,filter,transform] sm:text-[clamp(3.45rem,6.3vw,6.8rem)]"
              >
                Upskill to the
                <br />
                <span className="bg-gradient-to-r from-fuchsia-400 via-violet-400 to-blue-300 bg-clip-text text-transparent">
                  Top 1%
                </span>{" "}
                with
                <br />
                Expert-Led Programs
              </h1>
            </motion.div>
            <p
              style={{
                opacity: descriptionOpacity,
                filter: `blur(${(1 - descriptionOpacity) * 6}px)`,
              }}
              className="mt-3 max-w-[17rem] text-[13px] leading-5 text-white/85 will-change-[opacity,filter] sm:mt-6 sm:max-w-md sm:text-lg sm:leading-7"
            >
              Scroll through the portal to discover practical programs built for
              your career.
            </p>
            <Link
              href="#programs"
              style={{
                opacity: ctaOpacity,
                filter: `blur(${(1 - ctaOpacity) * 5}px)`,
                transform: `scale(${0.98 + ctaOpacity * 0.02})`,
              }}
              className="group mt-5 inline-flex w-full items-center justify-between gap-7 rounded-xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 px-5 py-3 text-[13px] font-semibold text-white shadow-[0_14px_38px_rgba(125,58,255,.35)] transition-transform will-change-[opacity,filter,transform] active:scale-[.98] sm:mt-8 sm:w-auto sm:px-7 sm:py-4 sm:text-sm sm:hover:-translate-y-0.5"
            >
              Explore Programs{" "}
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </motion.div>
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[11] bg-[linear-gradient(to_bottom,transparent_35%,rgba(5,6,13,.34)_64%,#05060d_100%)]"
          style={{ opacity: handoffOpacity }}
        />
        <div
          aria-hidden={handoffOpacity < 0.05}
          className="pointer-events-none absolute inset-x-0 bottom-24 z-20"
          style={{
            opacity: handoffOpacity,
            filter: prefersReducedMotion
              ? "none"
              : `blur(${(1 - handoffProgress) * 12}px)`,
            transform: prefersReducedMotion
              ? "none"
              : `translate3d(0, ${(1 - handoffProgress) * 36}px, 0) scale(${0.985 + handoffProgress * 0.015})`,
          }}
        >
          {children}
        </div>
        <div
          style={{ opacity: hintOpacity }}
          className="absolute bottom-7 right-5 z-10 hidden items-center gap-3 text-[10px] font-semibold tracking-[.2em] text-white/80 sm:right-8 sm:flex lg:right-12"
        >
          <span className="h-px w-12 bg-gradient-to-r from-transparent to-fuchsia-300" />
          SCROLL TO ENTER
          <span className="grid h-7 w-7 place-items-center rounded-full border border-white/25 text-base font-light">
            ↓
          </span>
        </div>
      </div>
    </section>
  );
}
