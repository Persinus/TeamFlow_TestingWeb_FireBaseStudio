
"use client";

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Text3D } from '@react-three/drei';
import Artwork from '@/components/gallery-artwork';
import type { Task } from '@/types';

interface GalleryCanvasProps {
    completedTasks: Task[];
    onSelectTask: (task: Task) => void;
}

export default function GalleryCanvas({ completedTasks, onSelectTask }: GalleryCanvasProps) {
    return (
        <Canvas camera={{ position: [0, 2, 12], fov: 60 }}>
            <ambientLight intensity={1.5} />
            <pointLight position={[10, 10, 10]} />
            <Environment preset="city" />
            
            <Suspense fallback={null}>
                <Text3D 
                    font="/fonts/Inter_Bold.json"
                    position={[-4, 2.5, 0]}
                    size={0.8}
                    height={0.2}
                    curveSegments={12}
                >
                    Thành tựu của Đội
                    <meshNormalMaterial />
                </Text3D>
            </Suspense>

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
