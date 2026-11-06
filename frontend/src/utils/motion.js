/**
 * Enterprise Motion Tokens & Variants (Framer Motion)
 * Adheres strictly to:
 * - Durations: 120ms / 200ms / 320ms
 * - Easing: [0.16, 1, 0.3, 1]
 * - Spring: { stiffness: 400, damping: 30 }
 * - Animate transform / opacity ONLY
 */

export const MOTION_DURATIONS = {
  fast: 0.12,
  standard: 0.2,
  deliberate: 0.32
};

export const MOTION_EASE = [0.16, 1, 0.3, 1];

export const MOTION_SPRING = {
  type: 'spring',
  stiffness: 400,
  damping: 30
};

// Route transition: fade + 8px rise
export const pageVariants = {
  initial: {
    opacity: 0,
    y: 8
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: MOTION_DURATIONS.standard,
      ease: MOTION_EASE
    }
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: MOTION_DURATIONS.fast,
      ease: MOTION_EASE
    }
  }
};

// Drawer transition: slide in from right
export const drawerVariants = {
  closed: {
    x: '100%',
    transition: {
      duration: MOTION_DURATIONS.standard,
      ease: MOTION_EASE
    }
  },
  open: {
    x: 0,
    transition: {
      duration: MOTION_DURATIONS.deliberate,
      ease: MOTION_EASE
    }
  }
};

// Backdrop fade
export const backdropVariants = {
  closed: { opacity: 0 },
  open: { opacity: 1, transition: { duration: MOTION_DURATIONS.standard } }
};

// KPI Cards Staggered Intro
export const kpiContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02
    }
  }
};

export const kpiItemVariants = {
  hidden: { opacity: 0, y: 6 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: MOTION_DURATIONS.standard,
      ease: MOTION_EASE
    }
  }
};

// Row collapse on approve / delete
export const rowCollapseVariants = {
  initial: { opacity: 0, height: 0, y: -4 },
  animate: { opacity: 1, height: 'auto', y: 0, transition: { duration: MOTION_DURATIONS.standard, ease: MOTION_EASE } },
  exit: { opacity: 0, height: 0, y: -4, transition: { duration: MOTION_DURATIONS.fast, ease: MOTION_EASE } }
};

