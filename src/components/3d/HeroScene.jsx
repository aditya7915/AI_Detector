import React, { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';

// Smooth Camera Controller for Parallax Effect
function CameraController({ scrollYProgress }) {
  const { camera, mouse } = useThree();
  const vec = new THREE.Vector3();

  useFrame((state, delta) => {
    const scroll = scrollYProgress ? scrollYProgress.get() : 0;
    
    // Deep parallax depth effect on scroll
    const targetZ = THREE.MathUtils.lerp(12, 6, scroll);
    // Subtle shifting based on scroll
    const targetX = THREE.MathUtils.lerp(0, 1.5, scroll);
    const targetY = THREE.MathUtils.lerp(0, -1, scroll);

    // Ultra-smooth, subtle mouse parallax
    const parallaxX = mouse.x * 0.4;
    const parallaxY = mouse.y * 0.4;

    vec.set(targetX + parallaxX, targetY + parallaxY, targetZ);
    camera.position.lerp(vec, delta * 1.5);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

// AI Bias Detection Data Network
function DataNetwork({ scrollYProgress }) {
  const count = 120; // Number of data points
  const maxConnections = 4;
  
  const [initialPositions, targetPositions, colors] = useMemo(() => {
    const initPos = new Float32Array(count * 3);
    const targetPos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    
    const colorPalette = [
      new THREE.Color('#ffffff'), // Soft white
      new THREE.Color('#88ccff'), // Soft blue
      new THREE.Color('#bb99ff'), // Slight purple
    ];

    for (let i = 0; i < count; i++) {
      // Clustered initial (biased distribution)
      // Grouping data into 3 distinct, dense clusters
      const clusterIndex = i % 3;
      let cx = 0, cy = 0, cz = 0;
      if (clusterIndex === 0) { cx = -3; cy = 2; cz = 0; }
      if (clusterIndex === 1) { cx = 3; cy = -2; cz = -2; }
      if (clusterIndex === 2) { cx = 1; cy = 3; cz = -4; }

      initPos[i * 3] = cx + (Math.random() - 0.5) * 2;
      initPos[i * 3 + 1] = cy + (Math.random() - 0.5) * 2;
      initPos[i * 3 + 2] = cz + (Math.random() - 0.5) * 2;

      // Uniform target (unbiased / corrected distribution)
      // Distributing points evenly across the view
      targetPos[i * 3] = (Math.random() - 0.5) * 16;
      targetPos[i * 3 + 1] = (Math.random() - 0.5) * 12;
      targetPos[i * 3 + 2] = (Math.random() - 0.5) * 8 - 2;

      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      col[i * 3] = color.r;
      col[i * 3 + 1] = color.g;
      col[i * 3 + 2] = color.b;
    }
    return [initPos, targetPos, col];
  }, []);

  const pointsRef = useRef();
  const linesRef = useRef();
  
  // Allocate buffer for lines (each connection = 2 vertices = 6 floats)
  const maxLines = count * maxConnections;
  const linePositions = useMemo(() => new Float32Array(maxLines * 6), [maxLines]);

  useFrame((state) => {
    if (!pointsRef.current || !linesRef.current) return;

    const scroll = scrollYProgress ? scrollYProgress.get() : 0;
    const currentPositions = pointsRef.current.geometry.attributes.position.array;
    const time = state.clock.elapsedTime;
    
    // 1. Update points positions (Bias Correction Animation)
    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      
      // Floating / drifting motion
      const driftX = Math.sin(time * 0.2 + i) * 0.15;
      const driftY = Math.cos(time * 0.3 + i) * 0.15;
      const driftZ = Math.sin(time * 0.1 + i) * 0.1;

      // Smoothly interpolate from clustered to uniform based on scroll
      currentPositions[idx] = THREE.MathUtils.lerp(initialPositions[idx], targetPositions[idx], scroll) + driftX;
      currentPositions[idx + 1] = THREE.MathUtils.lerp(initialPositions[idx + 1], targetPositions[idx + 1], scroll) + driftY;
      currentPositions[idx + 2] = THREE.MathUtils.lerp(initialPositions[idx + 2], targetPositions[idx + 2], scroll) + driftZ;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;

    // 2. Update lines based on proximity (Network Connections)
    let lineIndex = 0;
    for (let i = 0; i < count; i++) {
      let connections = 0;
      for (let j = i + 1; j < count; j++) {
        if (connections >= maxConnections) break;
        
        const dx = currentPositions[i * 3] - currentPositions[j * 3];
        const dy = currentPositions[i * 3 + 1] - currentPositions[j * 3 + 1];
        const dz = currentPositions[i * 3 + 2] - currentPositions[j * 3 + 2];
        const distSq = dx*dx + dy*dy + dz*dz;

        // Dynamic threshold: smaller when clustered, expands when corrected
        const threshold = THREE.MathUtils.lerp(2, 12, scroll);
        
        if (distSq < threshold) {
          linePositions[lineIndex++] = currentPositions[i * 3];
          linePositions[lineIndex++] = currentPositions[i * 3 + 1];
          linePositions[lineIndex++] = currentPositions[i * 3 + 2];
          
          linePositions[lineIndex++] = currentPositions[j * 3];
          linePositions[lineIndex++] = currentPositions[j * 3 + 1];
          linePositions[lineIndex++] = currentPositions[j * 3 + 2];
          connections++;
        }
      }
    }
    
    linesRef.current.geometry.attributes.position.needsUpdate = true;
    linesRef.current.geometry.setDrawRange(0, lineIndex / 3);

    // Overall depth movement on scroll
    pointsRef.current.parent.position.z = THREE.MathUtils.lerp(0, 3, scroll);
  });

  // Use a copy of initial positions to start
  const startingPositions = useMemo(() => initialPositions.slice(), [initialPositions]);

  return (
    <group>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={count}
            array={startingPositions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={count}
            array={colors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.12}
          vertexColors
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={maxLines * 2}
            array={linePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color="#88ccff"
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>
    </group>
  );
}

// Floating Glass Panels
function GlassPanels({ scrollYProgress }) {
  const groupRef = useRef();

  useFrame((state, delta) => {
    if (groupRef.current) {
      const scroll = scrollYProgress ? scrollYProgress.get() : 0;
      
      // Depth-based movement on scroll
      groupRef.current.position.y = THREE.MathUtils.lerp(0, 3, scroll);
      groupRef.current.position.z = THREE.MathUtils.lerp(0, 4, scroll);
      
      // Slow, continuous rotation
      groupRef.current.rotation.x += delta * 0.03;
      groupRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={[0, -1, -3]}>
      {/* Panel 1 */}
      <mesh position={[-4, 2, 0]} rotation={[0.2, 0.4, 0.1]}>
        <planeGeometry args={[5, 7]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.015} side={THREE.DoubleSide} />
        <lineSegments>
          <edgesGeometry args={[new THREE.PlaneGeometry(5, 7)]} />
          <lineBasicMaterial color="#88ccff" transparent opacity={0.15} />
        </lineSegments>
      </mesh>

      {/* Panel 2 */}
      <mesh position={[5, -1, -2]} rotation={[-0.1, -0.3, 0.2]}>
        <planeGeometry args={[6, 4]} />
        <meshBasicMaterial color="#88ccff" transparent opacity={0.01} side={THREE.DoubleSide} />
        <lineSegments>
          <edgesGeometry args={[new THREE.PlaneGeometry(6, 4)]} />
          <lineBasicMaterial color="#ffffff" transparent opacity={0.1} />
        </lineSegments>
      </mesh>
      
      {/* Panel 3 */}
      <mesh position={[-1, -4, 2]} rotation={[1.2, 0.1, 0.5]}>
        <planeGeometry args={[4, 4]} />
        <meshBasicMaterial color="#bb99ff" transparent opacity={0.01} side={THREE.DoubleSide} />
        <lineSegments>
          <edgesGeometry args={[new THREE.PlaneGeometry(4, 4)]} />
          <lineBasicMaterial color="#bb99ff" transparent opacity={0.15} />
        </lineSegments>
      </mesh>
    </group>
  );
}

export default function HeroScene({ scrollYProgress }) {
  return (
    <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
      <Canvas
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        dpr={[1, 1.5]} // Optimize pixel ratio
      >
        <color attach="background" args={['#000000']} />
        
        <fog attach="fog" args={['#02040a', 8, 25]} />
        <ambientLight intensity={0.15} color="#e0f0ff" />

        <Suspense fallback={null}>
          <CameraController scrollYProgress={scrollYProgress} />
          
          <DataNetwork scrollYProgress={scrollYProgress} />
          <GlassPanels scrollYProgress={scrollYProgress} />
          
          {/* Dim, soft, slowly twinkling stars */}
          <Stars 
            radius={40} 
            depth={50} 
            count={2500} 
            factor={3} 
            saturation={0} 
            fade 
            speed={0.4} 
          />
        </Suspense>

        {/* Cinematic Minimal Post-Processing */}
        <EffectComposer disableNormalPass>
          <Bloom 
            luminanceThreshold={0.5} 
            mipmapBlur 
            intensity={0.6} 
            levels={6}
            blendFunction={BlendFunction.SCREEN}
          />
          <Noise opacity={0.03} blendFunction={BlendFunction.OVERLAY} />
          <Vignette eskil={false} offset={0.15} darkness={0.9} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
