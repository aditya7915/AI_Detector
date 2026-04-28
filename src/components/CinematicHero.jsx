import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';

export default function CinematicHero({ scrollYProgress, isHoveringCTA }) {
  const containerRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hasEntered, setHasEntered] = useState(false);

  // Trigger entry animation
  useEffect(() => {
    const timer = setTimeout(() => setHasEntered(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX / innerWidth) * 2 - 1;
    const y = (clientY / innerHeight) * 2 - 1;
    setMousePosition({ x, y });
  };

  const springConfig = { damping: 20, stiffness: 100 };
  const mouseX = useSpring(mousePosition.x, springConfig);
  const mouseY = useSpring(mousePosition.y, springConfig);

  // --- SCROLL = STORY MAPPINGS ---
  // Phase 1: 0 - 0.2 (Float upward)
  // Phase 2: 0.2 - 0.5 (3D Rotate + Neon rings + Eye Contact)
  // Phase 3: 0.5 - 0.75 (Power up, Pulse, Zoom, Shockwave)
  // Phase 4: 0.75 - 1.0 (Holographic glitch split, merge back)

  // Floating Y
  const yScroll = useTransform(scrollYProgress, 
    [0, 0.2, 0.5, 1], 
    [50, -20, -20, 0]
  );

  // Rotation (with "Eye Contact" moment at 0.4)
  const rotateYScroll = useTransform(scrollYProgress, 
    [0, 0.2, 0.3, 0.4, 0.5, 0.6, 1], 
    [0, 0, 25, 0, -25, 0, 0] // 0.4 is eye contact (0 deg), 0.6 locks forward
  );
  const rotateXScroll = useTransform(scrollYProgress, 
    [0, 0.2, 0.3, 0.4, 0.5, 1], 
    [0, 0, -10, 0, 10, 0]
  );

  // Zoom (Phase 3 & 4)
  const scaleImage = useTransform(scrollYProgress, 
    [0, 0.5, 0.7, 0.9, 1], 
    [1, 1, 2.2, 2.2, 1.5]
  );

  // Rings (Phase 2+)
  const ringOpacity = useTransform(scrollYProgress, 
    [0, 0.2, 0.3, 0.7, 0.8], 
    [0, 0, 1, 1, 0]
  );

  // Blast Pulse (Phase 3)
  const blastScale = useTransform(scrollYProgress, 
    [0.48, 0.5, 0.6], 
    [0.1, 5, 8]
  );
  const blastOpacity = useTransform(scrollYProgress, 
    [0.48, 0.5, 0.55, 0.6], 
    [0, 1, 0, 0]
  );
  const bgGlowOpacity = useTransform(scrollYProgress,
    [0.48, 0.5, 0.6, 0.7],
    [0, 0.8, 0.4, 0]
  );

  // Shockwave (Screen distort/shake)
  const shakeX = useTransform(scrollYProgress, 
    [0.49, 0.5, 0.51, 0.52, 0.53], 
    [0, -15, 15, -10, 0]
  );
  const shakeY = useTransform(scrollYProgress, 
    [0.49, 0.5, 0.51, 0.52, 0.53], 
    [0, 15, -15, 10, 0]
  );

  // Holographic Split (Phase 4)
  const glitchOffset = useTransform(scrollYProgress,
    [0.7, 0.75, 0.85, 0.95, 1],
    [0, 0, 60, 60, 0]
  );
  const glitchRotation = useTransform(scrollYProgress,
    [0.7, 0.75, 0.85, 0.95, 1],
    [0, 0, 15, 15, 0]
  );

  // Parallax layers (Background)
  const particlesY = useTransform(scrollYProgress, [0, 1], [0, 400]);

  // Mouse Parallax (subtle)
  const rotateYMouse = useTransform(mouseX, [-1, 1], [-10, 10]);
  const rotateXMouse = useTransform(mouseY, [-1, 1], [10, -10]);

  // Combined transforms for glitch layers
  const glitchLeftX = useTransform(glitchOffset, v => -v);
  const glitchRightX = useTransform(glitchOffset, v => v);
  const glitchLeftRot = useTransform(glitchRotation, v => -v);
  const glitchRightRot = useTransform(glitchRotation, v => v);

  return (
    <motion.div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      style={{ x: shakeX, y: shakeY }}
      className="absolute inset-0 w-full h-full overflow-hidden flex items-center justify-center bg-black perspective-[1500px]"
    >
      {/* Dynamic Background Particle Field */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: hasEntered ? 0.6 : 0 }}
        transition={{ duration: 3, delay: 1 }}
        style={{ y: particlesY }}
        className="absolute inset-0 z-0 pointer-events-none"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(100,150,255,0.15)_0%,_transparent_100%)] bg-[length:30px_30px]" />
      </motion.div>

      {/* Screen Glow (Phase 3 Power Up) */}
      <motion.div 
        style={{ opacity: bgGlowOpacity }}
        className="absolute inset-0 bg-gradient-to-t from-blue-600/30 via-purple-600/20 to-black mix-blend-screen z-10 pointer-events-none"
      />

      {/* Energy Blast Wave (Phase 3) */}
      <motion.div
        style={{ scale: blastScale, opacity: blastOpacity }}
        className="absolute w-[200px] h-[200px] rounded-full border-[12px] border-blue-400 mix-blend-screen z-10 pointer-events-none shadow-[0_0_100px_50px_rgba(59,130,246,0.8)]"
      />

      {/* Orbital Rings (Phase 2+) */}
      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none [transform-style:preserve-3d]">
        <motion.div 
          style={{ opacity: ringOpacity, rotateX: 70 }}
          animate={{ rotateZ: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute w-[700px] h-[700px] rounded-full border-[2px] border-purple-500/30 border-t-purple-400 mix-blend-screen shadow-[0_0_40px_rgba(168,85,247,0.4)]"
        />
        <motion.div 
          style={{ opacity: ringOpacity, rotateX: 75, rotateY: 20 }}
          animate={{ rotateZ: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute w-[900px] h-[900px] rounded-full border-[2px] border-blue-500/30 border-b-blue-400 mix-blend-screen shadow-[0_0_40px_rgba(59,130,246,0.4)]"
        />
      </div>

      {/* Core Subject Container */}
      <motion.div
        style={{
          scale: scaleImage,
          y: yScroll,
          rotateY: rotateYScroll,
          rotateX: rotateXScroll,
        }}
        className="relative z-20 w-full h-full flex items-center justify-center [transform-style:preserve-3d] pointer-events-none"
      >
        <motion.div
          style={{
            rotateY: rotateYMouse,
            rotateX: rotateXMouse,
          }}
          className="relative flex items-center justify-center w-[400px] md:w-[600px] h-[400px] md:h-[600px] [transform-style:preserve-3d]"
        >
          {/* Idle breathing effect */}
          <motion.div
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="relative w-full h-full [transform-style:preserve-3d]"
          >
            {/* Entry Animation: Robot emerges from darkness with depth of field blur */}
            <motion.div
              initial={{ filter: 'brightness(0) blur(4px) contrast(1.2)', opacity: 0, scale: 0.9 }}
              animate={{ filter: hasEntered ? 'brightness(0.65) blur(1.5px) contrast(1.15)' : 'brightness(0) blur(4px) contrast(1.2)', opacity: hasEntered ? 1 : 0, scale: hasEntered ? 1 : 0.9 }}
              transition={{ duration: 3, ease: "easeOut" }}
              className="relative w-full h-full [transform-style:preserve-3d]"
            >
              {/* Ground Shadow */}
              <motion.div 
                animate={{ scale: [1, 0.8, 1], opacity: [0.6, 0.3, 0.6] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-[70%] h-[50px] bg-blue-600/60 blur-[30px] rounded-[100%]"
              />

              {/* Back Glow (Reduced strength for readability) */}
              <div className="absolute inset-0 bg-blue-500/15 blur-[50px] rounded-full mix-blend-screen" />
              <motion.div 
                animate={{ opacity: isHoveringCTA ? 0.6 : 0.2, scale: isHoveringCTA ? 1.1 : 1 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-10 bg-purple-600/20 blur-[60px] rounded-full mix-blend-screen" 
              />

              {/* Holographic Layer 1 (Glitch Left) */}
              <motion.img 
                src="/robot.jpg" 
                className="absolute inset-0 w-full h-full object-contain mix-blend-screen opacity-50 hue-rotate-[90deg] blur-[2px]"
                style={{
                  maskImage: 'radial-gradient(circle at center, black 40%, transparent 70%)',
                  WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 70%)',
                  x: glitchLeftX,
                  rotateZ: glitchLeftRot,
                }}
              />

              {/* Holographic Layer 2 (Glitch Right) */}
              <motion.img 
                src="/robot.jpg" 
                className="absolute inset-0 w-full h-full object-contain mix-blend-screen opacity-50 hue-rotate-[-90deg] blur-[2px]"
                style={{
                  maskImage: 'radial-gradient(circle at center, black 40%, transparent 70%)',
                  WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 70%)',
                  x: glitchRightX,
                  rotateZ: glitchRightRot,
                }}
              />

              {/* MAIN ROBOT IMAGE (Reduced highlights, subtle rim light shadow) */}
              <img 
                src="/robot.jpg" 
                alt="Advanced AI Robot"
                className="w-full h-full object-contain relative z-30 drop-shadow-[0_0_15px_rgba(59,130,246,0.6)] mix-blend-screen transition-transform duration-500"
                style={{
                  maskImage: 'radial-gradient(circle at center, black 40%, transparent 65%)',
                  WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 65%)',
                  transform: isHoveringCTA ? 'scale(1.02)' : 'scale(1)'
                }}
              />

              {/* Scanning Light Entry Effect */}
              <AnimatePresence>
                {!hasEntered && (
                  <motion.div
                    initial={{ top: '-10%', opacity: 1 }}
                    animate={{ top: '110%', opacity: 0 }}
                    transition={{ duration: 2, delay: 0.5, ease: "easeInOut" }}
                    className="absolute left-0 right-0 h-[20px] bg-cyan-300 blur-[10px] mix-blend-screen z-40"
                  />
                )}
              </AnimatePresence>

              {/* Glassmorphism/Glow Overlay (Restricted to edge rim lighting) */}
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/5 via-transparent to-cyan-500/10 mix-blend-overlay rounded-full pointer-events-none z-40" />

              {/* React to hover -> Eyes / Core Glow (Simulated with a central bloom) */}
              <div className="group absolute inset-0 z-50 pointer-events-auto flex items-center justify-center">
                <div className="w-[30%] h-[20%] -translate-y-10 rounded-full bg-cyan-400/0 group-hover:bg-cyan-300/15 blur-[20px] mix-blend-screen transition-all duration-300" />
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>

    </motion.div>
  );
}
