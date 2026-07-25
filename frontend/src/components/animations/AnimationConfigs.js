const DURATION = {
  fast: 0.3,
  normal: 0.5,
  slow: 0.8,
};

const EASE = [0.25, 0.1, 0.25, 1];

export const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.normal, ease: EASE },
  },
  exit: { opacity: 0, y: -12, transition: { duration: DURATION.fast, ease: EASE } },
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: DURATION.normal, ease: EASE },
  },
  exit: { opacity: 0, transition: { duration: DURATION.fast, ease: EASE } },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.96 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: DURATION.normal, ease: EASE },
  },
  exit: { opacity: 0, scale: 0.95, transition: { duration: DURATION.fast, ease: EASE } },
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.normal, ease: EASE },
  },
};

export const heroBannerText = {
  container: {
    animate: {
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.2,
      },
    },
  },
  item: {
    initial: { opacity: 0, y: 30 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: DURATION.slow, ease: EASE },
    },
  },
};

export const heroImage = {
  initial: { opacity: 0, scale: 1.02 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: DURATION.slow, ease: EASE },
  },
};

export const heroCta = {
  initial: { opacity: 0, scale: 0.95 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: DURATION.normal, ease: EASE },
  },
};

export const searchBarReveal = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.normal, ease: EASE },
  },
};

export const sectionHeading = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.normal, ease: EASE },
  },
};

export const productCardReveal = {
  initial: { opacity: 0, y: 24 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.normal, ease: EASE },
  },
};

export const testimonialReveal = {
  initial: { opacity: 0, scale: 0.98 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: DURATION.normal, ease: EASE },
  },
};

export const brandLogoReveal = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.normal, ease: EASE },
  },
};