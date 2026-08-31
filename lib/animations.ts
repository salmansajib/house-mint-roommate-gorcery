import type { Variants, Transition } from "motion/react";

/**
 * Premium physics & cubic-bezier easing curves
 * Modeled after high-end fintech & design platforms (Linear, Apple, Stripe)
 */
export const premiumEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const smoothSpring: Transition = {
  type: "spring",
  stiffness: 280,
  damping: 28,
  mass: 0.8,
};

export const snappySpring: Transition = {
  type: "spring",
  stiffness: 380,
  damping: 30,
};

/**
 * Page & Layout Stagger Containers
 */
export const pageContainerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.05,
    },
  },
};

export const sectionRevealVariants: Variants = {
  hidden: { opacity: 0, y: 18, scale: 0.99 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.55,
      ease: premiumEase,
    },
  },
};

/**
 * Navigation Bar Animation
 */
export const navVariants: Variants = {
  hidden: { opacity: 0, y: -20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: premiumEase,
      staggerChildren: 0.06,
      delayChildren: 0.02,
    },
  },
};

export const navItemVariants: Variants = {
  hidden: { opacity: 0, y: -8 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
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
      staggerChildren: 0.07,
      delayChildren: 0.08,
    },
  },
};

export const heroItemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
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
      staggerChildren: 0.05,
      delayChildren: 0.03,
    },
  },
};

export const listItemVariants: Variants = {
  hidden: { opacity: 0, y: 12, scale: 0.99 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: premiumEase,
    },
  },
};

/**
 * Mobile Bottom Bar Slide-Up
 */
export const bottomBarVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: premiumEase,
      delay: 0.25,
    },
  },
};
