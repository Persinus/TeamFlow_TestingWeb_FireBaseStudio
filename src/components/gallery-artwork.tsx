
"use client";

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box } from '@react-three/drei';
import * as THREE from 'three';
import type { Task } from '@/types';

interface ArtworkProps {
  task: Task;
  position: [number, number, number];
  onSelectTask: (task: Task) => void;
}

export default function Artwork({ task, position, onSelectTask }: ArtworkProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  
  const handleClick = (e: any) => {
    e.stopPropagation();
    onSelectTask(task);
  }

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={handleClick}
      >
        <boxGeometry args={[1.5, 1.8, 0.2]} />
        <meshStandardMaterial color={'royalblue'} />
      </mesh>
    </group>
  );
}
