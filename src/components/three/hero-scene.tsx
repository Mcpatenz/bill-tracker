"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Edges, Float, RoundedBox, Sparkles } from "@react-three/drei";
import { useReducedMotion } from "motion/react";
import type { Group } from "three";

function Coin({
  position,
  scale = 1,
  color = "#f3c56b",
  reduced,
}: {
  position: [number, number, number];
  scale?: number;
  color?: string;
  reduced: boolean;
}) {
  return (
    <Float
      speed={reduced ? 0 : 1.7}
      rotationIntensity={reduced ? 0 : 0.7}
      floatIntensity={reduced ? 0 : 0.9}
    >
      <group position={position} scale={scale}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 0.09, 56]} />
          <meshStandardMaterial
            color={color}
            metalness={1}
            roughness={0.27}
            emissive={color}
            emissiveIntensity={0.06}
          />
        </mesh>
        <mesh position={[0, 0, 0.052]}>
          <torusGeometry args={[0.31, 0.02, 12, 56]} />
          <meshStandardMaterial color="#8a5a12" metalness={1} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0, -0.052]}>
          <torusGeometry args={[0.31, 0.02, 12, 56]} />
          <meshStandardMaterial color="#8a5a12" metalness={1} roughness={0.4} />
        </mesh>
      </group>
    </Float>
  );
}

function BillCard({ reduced }: { reduced: boolean }) {
  const lines = [
    { width: 1.24, y: 0.32, color: "#5b6b8c" },
    { width: 0.94, y: 0.12, color: "#46536e" },
    { width: 1.16, y: -0.08, color: "#3b4760" },
  ];

  return (
    <Float
      speed={reduced ? 0 : 1.1}
      rotationIntensity={reduced ? 0 : 0.35}
      floatIntensity={reduced ? 0 : 0.55}
    >
      <group position={[0.1, 0.05, 0]} rotation={[0.12, -0.34, 0.035]}>
        <RoundedBox args={[2.3, 1.45, 0.1]} radius={0.09} smoothness={5} castShadow>
          <meshStandardMaterial color="#0e1729" metalness={0.72} roughness={0.28} />
          <Edges threshold={18} color="#31405f" />
        </RoundedBox>

        <mesh position={[-0.72, 0.47, 0.062]}>
          <planeGeometry args={[0.42, 0.16]} />
          <meshStandardMaterial
            color="#8b5cf6"
            emissive="#8b5cf6"
            emissiveIntensity={0.9}
            metalness={0.4}
            roughness={0.4}
          />
        </mesh>

        {lines.map((line, index) => (
          <mesh key={index} position={[0, line.y, 0.062]}>
            <planeGeometry args={[line.width, 0.055]} />
            <meshStandardMaterial
              color={line.color}
              metalness={0.55}
              roughness={0.45}
              transparent
              opacity={0.9}
            />
          </mesh>
        ))}

        <mesh position={[-0.28, -0.42, 0.062]}>
          <planeGeometry args={[0.62, 0.16]} />
          <meshStandardMaterial
            color="#2dd4a7"
            emissive="#2dd4a7"
            emissiveIntensity={0.85}
            metalness={0.4}
            roughness={0.35}
          />
        </mesh>

        <mesh position={[0.55, -0.42, 0.062]}>
          <planeGeometry args={[0.82, 0.16]} />
          <meshStandardMaterial color="#1b2740" metalness={0.5} roughness={0.5} />
        </mesh>
      </group>
    </Float>
  );
}

function SceneContent() {
  const reduced = useReducedMotion() ?? false;
  const group = useRef<Group>(null);
  const ring = useRef<Group>(null);

  useFrame((state, delta) => {
    if (group.current) {
      const targetX = state.pointer.y * 0.1;
      const targetY = state.pointer.x * 0.16;
      group.current.rotation.x += (targetX - group.current.rotation.x) * Math.min(1, delta * 3);
      group.current.rotation.y += (targetY - group.current.rotation.y) * Math.min(1, delta * 3);
    }
    if (ring.current && !reduced) {
      ring.current.rotation.z += delta * 0.06;
    }
  });

  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 5]} intensity={2.2} color="#f8fafc" />
      <pointLight position={[-4, -2, 3]} intensity={38} color="#8b5cf6" distance={12} />
      <pointLight position={[3, -3, 2]} intensity={22} color="#2dd4a7" distance={10} />

      <group ref={group}>
        <group ref={ring} rotation={[1.35, 0.2, 0]}>
          <mesh>
            <torusGeometry args={[2.75, 0.008, 12, 160]} />
            <meshBasicMaterial color="#8b5cf6" transparent opacity={0.4} />
          </mesh>
          <mesh rotation={[0.5, 0.4, 0]}>
            <torusGeometry args={[3.15, 0.006, 12, 160]} />
            <meshBasicMaterial color="#2dd4a7" transparent opacity={0.22} />
          </mesh>
        </group>

        <BillCard reduced={reduced} />
        <Coin position={[-1.95, 1.05, 0.5]} scale={0.95} reduced={reduced} />
        <Coin position={[1.85, -1.05, 0.6]} scale={0.78} reduced={reduced} />
        <Coin position={[1.7, 1.45, -0.6]} scale={0.5} color="#8fe6cd" reduced={reduced} />
        <Coin position={[-1.7, -1.5, 0.2]} scale={0.62} reduced={reduced} />
        <Coin position={[-2.35, -0.2, -0.9]} scale={0.4} color="#b4a4f8" reduced={reduced} />
      </group>

      <Sparkles
        count={reduced ? 18 : 46}
        scale={[9, 6, 6]}
        size={2.2}
        speed={reduced ? 0 : 0.32}
        opacity={0.55}
        color="#a78bfa"
      />
    </>
  );
}

export function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6.3], fov: 42 }}
      dpr={[1, 1.8]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ width: "100%", height: "100%", touchAction: "pan-y" }}
    >
      <SceneContent />
    </Canvas>
  );
}
