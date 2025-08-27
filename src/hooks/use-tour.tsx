
"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface TourContextType {
    isTourOpen: boolean;
    setIsTourOpen: (isOpen: boolean) => void;
    showTour: () => void;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export const TourProvider = ({ children }: { children: ReactNode }) => {
    const [isTourOpen, setIsTourOpen] = useState(false);

    const showTour = () => {
        setIsTourOpen(true);
    };

    const value = { isTourOpen, setIsTourOpen, showTour };

    return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
};

export const useTour = () => {
    const context = useContext(TourContext);
    if (context === undefined) {
        throw new Error('useTour must be used within a TourProvider');
    }
    return context;
};
