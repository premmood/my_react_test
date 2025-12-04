import React, { createContext, useState, useContext, useEffect } from 'react';

// Create a context for the tour
const TourContext = createContext();

// Provider component
export const TourProvider = ({ children }) => {
    const [isTourOpen, setIsTourOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        // Log when the component mounts
        // console.debug('TourProvider: Mounted');
        return () => {
            // Log when the component unmounts
            // console.debug('TourProvider: Unmounted');
        };
    }, []);

    useEffect(() => {
        // Log when isTourOpen changes
        // console.debug(`TourProvider: isTourOpen changed to ${isTourOpen}`);
    }, [isTourOpen]);

    useEffect(() => {
        // Log when currentStep changes
        // console.debug(`TourProvider: currentStep changed to ${currentStep}`);
    }, [currentStep]);

    // Function to start the tour
    const startTour = () => {
        // console.debug('TourProvider: startTour called');
        setIsTourOpen(true);
        setCurrentStep(0);
    };

    // Function to stop the tour
    const stopTour = () => {
        // console.debug('TourProvider: stopTour called');
        setIsTourOpen(false);
        setCurrentStep(0);
    };

    // Function to update the current step
    const updateCurrentStep = (step) => {
        // console.debug(`TourProvider: updateCurrentStep called with step ${step}`);
        setCurrentStep(step);
    };

    return (
        <TourContext.Provider value={{
            isTourOpen,
            startTour,
            stopTour,
            currentStep,
            updateCurrentStep,
        }}>
            {children}
        </TourContext.Provider>
    );
};

// Custom hook for using the tour context
export const useTour = () => useContext(TourContext);
