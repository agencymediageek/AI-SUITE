// Animation presets for APEX CORE video

export const springs = {
  snappy:  { type: 'spring' as const, stiffness: 400, damping: 30 },
  smooth:  { type: 'spring' as const, stiffness: 120, damping: 25 },
  bouncy:  { type: 'spring' as const, stiffness: 300, damping: 15 },
};

export const easings = {
  reveal:  [0.16, 1, 0.3, 1] as [number,number,number,number],
  sharp:   [0.22, 1, 0.36, 1] as [number,number,number,number],
  cinematic: [0.4, 0, 0.2, 1] as [number,number,number,number],
};

export const sceneTransitions = {
  clipCircle: {
    initial:  { clipPath: 'circle(0% at 50% 50%)', opacity: 1 },
    animate:  { clipPath: 'circle(100% at 50% 50%)', opacity: 1 },
    exit:     { clipPath: 'circle(0% at 50% 50%)', opacity: 0 },
    transition: { duration: 0.8, ease: easings.reveal },
  },
  fadeUp: {
    initial:  { opacity: 0, y: 30 },
    animate:  { opacity: 1, y: 0 },
    exit:     { opacity: 0, y: -30 },
    transition: { duration: 0.5 },
  },
  glitchIn: {
    initial:  { opacity: 0, x: -4, filter: 'blur(4px)' },
    animate:  { opacity: 1, x: 0, filter: 'blur(0px)' },
    exit:     { opacity: 0, x: 4, filter: 'blur(4px)' },
    transition: { duration: 0.4 },
  },
};

export const charReveal = {
  container: { hidden: { opacity: 0 }, visible: (i = 1) => ({ opacity: 1, transition: { staggerChildren: 0.05, delayChildren: i * 0.05 } }) },
  child: { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', damping: 12, stiffness: 200 } } },
};
