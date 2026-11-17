import { useEffect, useState } from 'react';
import { loadTrips } from './trips.js';
import { loadPhotos } from './photos.js';
import { loadTeachers } from './teachers.js';

/**
 * Subscribes to localStorage updates across tabs and within the current tab.
 */
export function usePortalData() {
  const [state, setState] = useState(() => ({
    tripsState: loadTrips(),
    photosState: loadPhotos(),
    teachersState: loadTeachers(),
  }));

  useEffect(() => {
    const sync = () => {
      setState({
        tripsState: loadTrips(),
        photosState: loadPhotos(),
        teachersState: loadTeachers(),
      });
    };
    window.addEventListener('storage', sync);
    window.addEventListener('sae:data-updated', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('sae:data-updated', sync);
    };
  }, []);

  return {
    trips: state.tripsState.trips,
    tripsError: state.tripsState.error,
    photos: state.photosState.photos,
    photosError: state.photosState.error,
    teachers: state.teachersState.teachers,
    teachersError: state.teachersState.error,
  };
}
