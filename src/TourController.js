import { useEffect } from 'react';
import { useUser } from './UserContext';
import apiWrapper from './apiWrapper';
import { useTour } from './context/TourContext';

const TourController = () => {
  const { userId } = useUser();
  const { startTour, stopTour } = useTour();
  
  useEffect(() => {
    // console.debug('TourController: useEffect called with userId:', userId);

    const fetchTourProgress = async () => {
      // console.debug('TourController: fetchTourProgress called');
      if (!userId) {
        // console.debug('TourController: No userId, exiting fetchTourProgress');
        return;
      }
      
      try {
        // console.debug('TourController: Fetching tour progress...');
        const response = await apiWrapper.getTourProgressById(userId);
        // console.debug('TourController: TOUR PROGRESS:', response);

        if (!response.data || response.data.isCompleted === false) {
          // console.debug('TourController: Starting tour based on progress');
          startTour();
        } else {
          // console.debug('TourController: Stopping tour based on progress');
          stopTour();
        }
      } catch (error) {
        console.error('TourController: Error fetching tour progress:', error);
      }
    };

    fetchTourProgress();
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  return null; // This component does not render anything
};

export default TourController;
