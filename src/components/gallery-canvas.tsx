
"use client";

import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Text } from '@react-three/drei';
import Artwork from '@/components/gallery-artwork';
import type { Task } from '@/types';

interface GalleryCanvasProps {
    completedTasks: Task[];
    onSelectTask: (task: Task) => void;
}

export default function GalleryCanvas({ completedTasks, onSelectTask }: GalleryCanvasProps) {
    return (
        <Canvas camera={{ position: [0, 2, 12], fov: 60 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <Environment preset="city" />
            
            <Text position={[0, 3, 0]} fontSize={0.6} color="white" anchorX="center" anchorY="middle">
                Thành tựu của Đội
            </Text>

            <group>
                {completedTasks.map((task, index) => (
                    <Artwork 
                        key={task.id} 
                        task={task} 
                        position={[(index % 8 - 3.5) * 2.5, Math.floor(index / 8) * -3, 0]}
                        onSelectTask={onSelectTask}
                    />
                ))}
            </group>
            
            <OrbitControls enableZoom={true} enablePan={true} />
        </Canvas>
    );
}
