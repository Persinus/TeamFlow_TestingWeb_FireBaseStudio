
"use client";

import React, { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Text } from '@react-three/drei';
import * as THREE from 'three';
import type { Task } from '@/types';

interface ArtworkProps {
  task: Task;
  position: [number, number, number];
  onSelectTask: (task: Task) => void;
}

export default function Artwork({ task, position, onSelectTask }: ArtworkProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHover] = useState(false);
  const [active, setActive] = useState(false);
  
  useFrame(() => {
    if (hovered) {
      // Gentle rotation effect on hover
      meshRef.current.rotation.y += 0.01;
    }
  });

  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    setHover(true);
    document.body.style.cursor = 'pointer';
  };
  
  const handlePointerOut = (e: any) => {
    e.stopPropagation();
    setHover(false);
    document.body.style.cursor = 'auto';
  };

  const handleClick = (e: any) => {
    e.stopPropagation();
    setActive(!active);
    onSelectTask(task);
  }

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        scale={active ? 1.2 : 1}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <boxGeometry args={[1, 1.2, 0.2]} />
        <meshStandardMaterial color={hovered ? 'hotpink' : 'royalblue'} />
      </mesh>
      <Text
        position={[0, -0.8, 0.15]}
        fontSize={0.15}
        color="white"
        maxWidth={1}
        textAlign="center"
        anchorX="center"
        anchorY="top"
      >
        {task.tieuDe}
      </Text>
    </group>
  );
}
