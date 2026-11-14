"use client";

import { useEffect } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";

type Props = {
  value: number;
  format?: (value: number) => string;
  duration?: number;
  className?: string;
};

export function AnimatedNumber({ value, format, duration = 900, className }: Props) {
  const reduceMotion = useReducedMotion();
  const count = useMotionValue(0);
  const text = useTransform(count, (latest) =>
    format ? format(latest) : Math.round(latest).toLocaleString(),
  );

  useEffect(() => {
    if (reduceMotion) {
      count.set(value);
      return;
    }

    const controls = animate(count, value, {
      duration: duration / 1000,
      ease: [0.16, 1, 0.3, 1],
    });

    return () => controls.stop();
  }, [value, duration, reduceMotion, count]);

  return <motion.span className={className}>{text}</motion.span>;
}
