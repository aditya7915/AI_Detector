import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, MeshTransmissionMaterial, Sparkles, Sphere, Torus, Cylinder } from '@react-three/drei';
import * as THREE from 'three';

export default function RobotModel({ scrollYProgress, mousePosition, isHoveringCTA }) {
  const group = useRef();
  const headRef = useRef();
  const torsoRef = useRef();

  useFrame((state, delta) => {
    // Scroll-based rotation
    const scrollVal = scrollYProgress ? scrollYProgress.get() : 0;
    
    // Smooth target rotation based on scroll
    const targetY = scrollVal * Math.PI * 2; // Full rotation as user scrolls
    const targetX = scrollVal * 0.5; // Slight tilt
    
    // Mouse follow effect (subtle)
    const mouseX = (state.mouse.x * Math.PI) / 4;
    const mouseY = (state.mouse.y * Math.PI) / 4;

    // Apply combined rotations
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetY + mouseX * 0.5, delta * 2);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, targetX - mouseY * 0.5, delta * 2);

    // Head specifically follows mouse more actively
    if (headRef.current) {
      headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, mouseX, delta * 4);
      headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, -mouseY, delta * 4);
      
      // CTA Hover reaction: expand head rings slightly
      const scaleTarget = isHoveringCTA ? 1.1 : 1;
      headRef.current.scale.setScalar(THREE.MathUtils.lerp(headRef.current.scale.x, scaleTarget, delta * 5));
    }
    
    // Torso gentle idle animation
    if (torsoRef.current) {
      torsoRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  return (
    <group ref={group}>
      {/* 
        Note to User: 
        Replace this abstract AI entity with your actual high-quality humanoid .glb model.
        Example: 
        const { scene } = useGLTF('/path/to/humanoid.glb');
        return <primitive object={scene} />;
      */}
      
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        {/* Head Abstraction */}
        <group ref={headRef} position={[0, 1.5, 0]}>
          <Sphere args={[0.5, 64, 64]}>
            <MeshTransmissionMaterial 
              backside 
              samples={4} 
              thickness={2} 
              chromaticAberration={1} 
              anisotropy={0.3} 
              distortion={0.5} 
              distortionScale={0.5} 
              temporalDistortion={0.1} 
              color={isHoveringCTA ? "#ff00aa" : "#4477ff"}
            />
          </Sphere>
          <Torus args={[0.8, 0.02, 16, 100]} rotation={[Math.PI / 2, 0, 0]}>
            <meshStandardMaterial color="#00ffcc" emissive="#00ffcc" emissiveIntensity={isHoveringCTA ? 2 : 1} />
          </Torus>
          <Torus args={[0.6, 0.01, 16, 100]} rotation={[0, Math.PI / 4, 0]}>
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
          </Torus>
          
          {/* Inner Core */}
          <Sphere args={[0.2, 32, 32]}>
            <meshStandardMaterial color={isHoveringCTA ? "#ff00ff" : "#00ffff"} emissive={isHoveringCTA ? "#ff00ff" : "#00ffff"} emissiveIntensity={3} />
          </Sphere>
        </group>

        {/* Torso Abstraction */}
        <group ref={torsoRef} position={[0, -0.5, 0]}>
          <Cylinder args={[0.8, 0.4, 2, 64]} castShadow receiveShadow>
            <meshPhysicalMaterial 
              color="#111122" 
              metalness={0.9} 
              roughness={0.1} 
              clearcoat={1} 
              clearcoatRoughness={0.1}
            />
          </Cylinder>
          
          {/* Glowing Accents on Torso */}
          <Torus args={[0.85, 0.02, 16, 100]} position={[0, 0.8, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <meshStandardMaterial color="#4477ff" emissive="#4477ff" emissiveIntensity={2} />
          </Torus>
          <Torus args={[0.65, 0.02, 16, 100]} position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <meshStandardMaterial color="#4477ff" emissive="#4477ff" emissiveIntensity={1.5} />
          </Torus>
          <Torus args={[0.45, 0.02, 16, 100]} position={[0, -0.8, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <meshStandardMaterial color="#4477ff" emissive="#4477ff" emissiveIntensity={1} />
          </Torus>

          {/* Holographic spine */}
          <Cylinder args={[0.1, 0.1, 2.5, 16]} position={[0, 0.2, 0]}>
            <meshStandardMaterial color="#00ffcc" emissive="#00ffcc" emissiveIntensity={2} wireframe />
          </Cylinder>
        </group>
      </Float>

      {/* Energy Field Particles */}
      <Sparkles 
        count={200} 
        scale={6} 
        size={2} 
        speed={0.4} 
        opacity={0.5} 
        color={isHoveringCTA ? "#ff00aa" : "#00ffff"} 
      />
    </group>
  );
}
