import React, { useEffect } from 'react';
import Joyride, { STATUS } from 'react-joyride';
import { useTour } from '../context/TourContext';
import apiWrapper from '../apiWrapper'; // Import the API wrapper functions
import { useUser } from '../UserContext';


const OnboardingTour = () => {
    const { userId } = useUser();
    const { isTourOpen, currentStep, updateCurrentStep, stopTour } = useTour();
//    const [tourProgress, setTourProgress] = useState(null); // State to store tour progress

    const saveTourProgress = async (step, totalSteps) => {
        try {
            // console.log('Saving tour progress...'); // Debugging: Log when saving tour progress starts
            // Update the tour progress on the backend
            await apiWrapper.updateTourProgressById(userId, step, totalSteps);
            // console.log('Tour progress saved:', step); // Debugging: Log saved tour progress
        } catch (error) {
            console.error('Error saving tour progress:', error);
        }
    };

    // Define the steps for the tour
    const tourSteps = [
        {
            target: '.tour-nav-qrcode',
            title: 'Manage QR Codes',
            content: 'This is where you can bulk import a list of addresses to create QR Codes. You can preview and print out an A4 PDF and also test that the QR code will work, when scanned.',
        },
        {
            target: '.tour-nav-sc',
            title: 'Manage Service Confirmations',
            content: 'The Service Confirmation screen lets you view, filter and export your history of Service Confirmations to a CSV',
        },
        {
            target: '.tour-nav-dashboard',
            title: 'Manage Dashboards',
            content: 'Monitor Service Confirmation activity with real-time dashboards, updated every 15 seconds. Gain insights and take action by seeing trends and patterns in your data.',
        },
        {
            target: '.tour-nav-pdf',
            title: 'Manage PDF Templates',
            content: 'Customise your orgnisation logo, tailor the text that appears on your A4 PDF QR Code posters, configure layouts and save new PDF templates.',
        },
        {
            target: '.tour-nav-settings',
            title: 'Manage Organisation Settings',
            content: 'Invite new admins, de-activate admins, configure your organisation-wide settings and view/filter audit logs.',
        }
    ];

    const handleJoyrideCallback = async (data) => {
        const { action, status, index, lifecycle, size } = data;
        // console.log(`Joyride Status:`, data);

        if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
            // console.log('Tour ended or skipped.');
            stopTour();
            await saveTourProgress(currentStep, size); // Mark as completed if finished or skipped
        } else if (action === 'next' && lifecycle === 'complete') {
            const nextStep = index + 1; // Increment to move to the next step
            // console.log('Moving to the next step:', nextStep);
            updateCurrentStep(nextStep);
            await saveTourProgress(nextStep, size);
        } else if (action === 'prev' && lifecycle === 'complete') {
            const prevStep = index - 1; // Decrement to move to the previous step
            // console.log('Moving to the previous step:', prevStep);
            updateCurrentStep(prevStep);
            await saveTourProgress(prevStep, size);
        }
    };


    useEffect(() => {
        if (!isTourOpen) {
            // Reset the current step when the tour is closed
            // console.log('Tour is closed. Resetting current step.'); // Debugging: Log when tour is closed
            updateCurrentStep(0);
        } else {
            // Fetch the tour progress when the tour starts
            // console.log('Tour is open. Fetching tour progress...'); // Debugging: Log when tour starts
            // fetchTourProgress();
        }
    }, [isTourOpen, updateCurrentStep]);

    return (
        <Joyride
            steps={tourSteps}
            run={isTourOpen}
            stepIndex={currentStep}
            callback={handleJoyrideCallback}
            continuous={true}
            showProgress={true}
            showSkipButton={false}
            styles={{
                options: {
                    arrowColor: '#e3ecff',
                    backgroundColor: '#eef3fc',
                    overlayColor: 'rgba(0, 0, 0, 0.4)',
                    primaryColor: '#4b80f4',
                    textColor: '#000',
                    width: 900,
                    zIndex: 1000,
                    fontFamily: 'Lato, sans-serif', // Example font family
                },
                buttonNext: {
                    backgroundColor: '#2185d0', // Example primary color from Semantic UI
                    color: '#fff',
                    borderRadius: '0.28571429rem',
                    padding: '0.78571429em 1.5em',
                    textTransform: 'none',
                    // Add hover styles, etc.
                },
                buttonBack: {
                    backgroundColor: '#2185d0', // Example primary color from Semantic UI
                    color: '#fff',
                    borderRadius: '0.28571429rem',
                    padding: '0.78571429em 1.5em',
                    textTransform: 'none',
                    // Add hover styles, etc.
                },
                // Additional custom styles...
            }}
        />
    );
};

export default OnboardingTour;
