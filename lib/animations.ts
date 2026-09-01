import type { Variants, Transition } from "motion/react";

/**
 * Premium physics & cubic-bezier easing curves
 * Modeled after high-end fintech & design platforms (Linear, Apple, Stripe)
 */
export const premiumEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const smoothSpring: Transition = {
  type: "spring",
  stiffness: 340,
  damping: 32,
  mass: 0.8,
};

export const snappySpring: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 35,
};

/**
 * Smooth Layout Re-ordering Transition (FLIP)
 */
export const smoothLayoutTransition: Transition = {
  type: "spring",
  stiffness: 380,
  damping: 34,
};

/**
 * Segmented Control / Filter Sliding Pill Transition
 */
export const pillSlideTransition: Transition = {
  type: "spring",
  stiffness: 460,
  damping: 36,
};

/**
 * Page & Layout Stagger Containers
 * Tight staggers for high perceived performance (< 200ms)
 */
export const pageContainerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.02,
    },
  },
};

export const sectionRevealVariants: Variants = {
  hidden: { opacity: 0, y: 6 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.28,
      ease: premiumEase,
    },
  },
};

/**
 * Navigation Bar Animation
 */
export const navVariants: Variants = {
  hidden: { opacity: 0, y: -8 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.32,
      ease: premiumEase,
      staggerChildren: 0.04,
      delayChildren: 0.01,
    },
  },
};

export const navItemVariants: Variants = {
  hidden: { opacity: 0, y: -4 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.24,
      ease: premiumEase,
    },
  },
};

/**
 * Hero Card Internal Stagger
 */
export const heroContentVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.03,
    },
  },
};

export const heroItemVariants: Variants = {
  hidden: { opacity: 0, y: 4 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.26,
      ease: premiumEase,
    },
  },
};

/**
 * Staggered Lists (Expenses, Category Rows, Peer Chips)
 */
export const listContainerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.035,
      delayChildren: 0.02,
    },
  },
};

export const listItemVariants: Variants = {
  hidden: { opacity: 0, y: 4 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.22,
      ease: premiumEase,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    height: 0,
    marginBottom: 0,
    paddingTop: 0,
    paddingBottom: 0,
    overflow: "hidden",
    transition: {
      duration: 0.22,
      ease: premiumEase,
    },
  },
};

/**
 * Deletion & Filter Exit Variants (for AnimatePresence mode="popLayout")
 */
export const listExitVariants: Variants = {
  exit: {
    opacity: 0,
    scale: 0.97,
    height: 0,
    marginBottom: 0,
    paddingTop: 0,
    paddingBottom: 0,
    overflow: "hidden",
    transition: {
      duration: 0.22,
      ease: premiumEase,
    },
  },
};

/**
 * Mobile Bottom Bar Slide-Up
 */
export const bottomBarVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.32,
      ease: premiumEase,
      delay: 0.1,
    },
  },
};
