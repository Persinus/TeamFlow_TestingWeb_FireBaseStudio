
"use client";

import React from 'react';
import type { TeamMascot } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TeamMascotProps {
    mascot: TeamMascot;
}

const getExpForNextLevel = (level: number) => {
    return (level * level) * 100;
};

// A simple Penguin SVG component
const Penguin = ({ mood }: { mood: TeamMascot['tamTrang'] }) => {
    const eyePaths = {
        'vui vẻ': "M15.5 15.5 C15.5 14.5 14.5 14 13.5 14 S11.5 14.5 11.5 15.5 M8.5 15.5 C8.5 14.5 7.5 14 6.5 14 S4.5 14.5 4.5 15.5",
        'bình thường': "M14.5 15 H12.5 M7.5 15 H5.5",
        'buồn': "M15.5 14.5 C15.5 15.5 14.5 16 13.5 16 S11.5 15.5 11.5 14.5 M8.5 14.5 C8.5 15.5 7.5 16 6.5 16 S4.5 15.5 4.5 14.5"
    };

    const mouthPath = {
        'vui vẻ': "M7 19 C8 21 12 21 13 19",
        'bình thường': "M7 20 H13",
        'buồn': "M7 21 C8 19 12 19 13 21"
    };

    const wingTransform = {
        'vui vẻ': "rotate(15 5 18)",
        'bình thường': "",
        'buồn': "rotate(-10 5 18)"
    }

    return (
         <svg viewBox="0 0 20 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-16 h-16">
            {/* Body */}
            <path d="M10 1C4 1 1 6 1 12C1 20 5 27 10 27C15 27 19 20 19 12C19 6 16 1 10 1Z" fill="hsl(var(--foreground))" />
            {/* Face */}
            <path d="M10 8C5 8 3 12 3 16C3 20 5 24 10 24C15 24 17 20 17 16C17 12 15 8 10 8Z" fill="hsl(var(--background))" />
             {/* Beak */}
            <path d="M9 17L10 19L11 17Z" fill="orange" stroke="hsl(var(--foreground))" strokeWidth="0.5" />
            {/* Eyes */}
            <path d={eyePaths[mood]} stroke="hsl(var(--foreground))" strokeWidth="1" strokeLinecap="round" />
             {/* Mouth */}
             <path d={mouthPath[mood]} stroke="hsl(var(--foreground))" strokeWidth="1" strokeLinecap="round" />
            {/* Wings */}
            <g transform={wingTransform}>
                 <path d="M1 12C0 14 0 18 2 22L5 18L1 12Z" fill="hsl(var(--foreground))" />
            </g>
             <g transform={`scale(-1, 1) translate(-20, 0) ${wingTransform}`}>
                 <path d="M1 12C0 14 0 18 2 22L5 18L1 12Z" fill="hsl(var(--foreground))" />
             </g>
             {/* Feet */}
             <ellipse cx="6.5" cy="27" rx="2" ry="1" fill="orange" />
             <ellipse cx="13.5" cy="27" rx="2" ry="1" fill="orange" />
         </svg>
    );
};

export default function TeamMascot({ mascot }: TeamMascotProps) {
    const { ten, level, kinhNghiem, tamTrang } = mascot;
    
    const expForCurrentLevel = getExpForNextLevel(level - 1);
    const expForNextLevel = getExpForNextLevel(level);
    const progress = Math.max(0, ((kinhNghiem - expForCurrentLevel) / (expForNextLevel - expForCurrentLevel)) * 100);

    const moodText = {
        'vui vẻ': 'Đang rất vui!',
        'bình thường': 'Bình thường',
        'buồn': 'Hơi buồn...'
    };

    const moodColor = {
        'vui vẻ': 'text-green-500',
        'bình thường': 'text-muted-foreground',
        'buồn': 'text-destructive'
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button className="flex flex-col items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <Penguin mood={tamTrang} />
                    <span>{ten}</span>
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                         <Penguin mood={tamTrang} />
                         <div className="flex-1">
                            <p className="font-bold text-lg">{ten}</p>
                            <p className={cn("text-sm font-semibold", moodColor[tamTrang])}>{moodText[tamTrang]}</p>
                         </div>
                    </div>
                    <div className="space-y-1">
                        <div className="flex justify-between items-baseline">
                            <span className="font-semibold">Cấp {level}</span>
                            <span className="text-xs text-muted-foreground">
                                {Math.floor(kinhNghiem)} / {expForNextLevel} EXP
                            </span>
                        </div>
                        <Progress value={progress} />
                    </div>
                     <p className="text-xs text-muted-foreground text-center italic">
                        Hoàn thành công việc để giúp {ten} lên cấp!
                    </p>
                </div>
            </PopoverContent>
        </Popover>
    );
}
