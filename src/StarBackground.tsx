import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import styled from 'styled-components';
import * as THREE from 'three';

const Background = styled.div`
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  z-index: 0;
  pointer-events: none;
  background: #07090d;
`;

function RotatingStars() {
  // Small stars (far)
  const smallGroup = useRef<THREE.Group>(null);
  // Big stars (near)
  const bigGroup = useRef<THREE.Group>(null);
  // Medium stars
  const medGroup = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (smallGroup.current) {
      const axis = new THREE.Vector3(1, -1, 0).normalize();
      smallGroup.current.rotateOnAxis(axis, delta * 0.09);
    }
    if (bigGroup.current) {
      const axis = new THREE.Vector3(-1, 1, 0).normalize();
      bigGroup.current.rotateOnAxis(axis, delta * 0.09);
    }
    if (medGroup.current) {
      // Medium stars rotate front-to-back (x axis)
      medGroup.current.rotateX(delta * 0.13);
    }
  });

  // Generate a few big, near stars
  const bigStars = React.useMemo<[number, number, number][]>(() => {
    const arr: [number, number, number][] = [];
    const numBig = 65;
    let attempts = 0;
    while (arr.length < numBig && attempts < numBig * 20) {
      // Random 3D position, radius 30-80
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = 2 * Math.PI * Math.random();
      const r = 30 + Math.random() * 50;
      const candidate: [number, number, number] = [
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      ];
      // Ensure no two big stars are too close
      if (arr.every(([x, y, z]) => {
        const dx = x - candidate[0];
        const dy = y - candidate[1];
        const dz = z - candidate[2];
        return Math.sqrt(dx*dx + dy*dy + dz*dz) > 7;
      })) {
        arr.push(candidate);
      }
      attempts++;
    }
    return arr;
  }, []);

  // Medium stars (between big and main field)
  const mediumStars = React.useMemo<[number, number, number][]>(() => {
    const arr: [number, number, number][] = [];
    const numMed = 30;
    let attempts = 0;
    while (arr.length < numMed && attempts < numMed * 20) {
      // Random 3D position, radius 20-60
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = 2 * Math.PI * Math.random();
      const r = 20 + Math.random() * 40;
      const candidate: [number, number, number] = [
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      ];
      // Ensure no two medium stars are too close
      if (arr.every(([x, y, z]) => {
        const dx = x - candidate[0];
        const dy = y - candidate[1];
        const dz = z - candidate[2];
        return Math.sqrt(dx*dx + dy*dy + dz*dz) > 4;
      })) {
        arr.push(candidate);
      }
      attempts++;
    }
    return arr;
  }, []);

  return (
    <>
      <group ref={smallGroup}>
        <Stars
          radius={90}
          depth={60}
          count={2500}
          factor={0.7}
          saturation={0.1}
          fade
          speed={1.2}
        />
      </group>
      <group ref={medGroup}>
        {mediumStars.map((pos, i) => (
          <mesh key={"med" + i} position={[pos[0], pos[1], pos[2]]}>
            <sphereGeometry args={[0.03 + Math.random() * 0.02, 10, 10]} />
            <meshStandardMaterial color="#fff" opacity={0.7} transparent emissive="#fff" emissiveIntensity={0.12} />
          </mesh>
        ))}
      </group>
      <group ref={bigGroup}>
        {bigStars.map((pos, i) => (
          <mesh key={i} position={[pos[0], pos[1], pos[2]]}>
            <sphereGeometry args={[0.05 + Math.random() * 0.03, 10, 10]} />
            <meshStandardMaterial color="#fff" opacity={0.98} transparent emissive="#fff" emissiveIntensity={0.18} />
          </mesh>
        ))}
      </group>
    </>
  );
}

const RedOverlay = styled.div`
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  background:
    radial-gradient(ellipse at center, rgba(255,42,42,0.07) 0%, rgba(0,0,0,0.0) 70%);
`;

export default function StarBackground() {
  return (
    <Background>
      <Canvas
        camera={{ position: [0, 0, 1], fov: 75 }}
        style={{ width: '100vw', height: '100vh', background: 'transparent' }}
        gl={{ alpha: true }}
      >
        <color attach="background" args={["#07090d"]} />
        <ambientLight intensity={0.7} />
        <RotatingStars />
      </Canvas>
      <RedOverlay />
    </Background>
  );
} 