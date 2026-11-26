import { useCallback, useEffect, useState } from 'react';
import { loadTrips } from './trips.js';
import { loadPhotos } from './photos.js';
import { loadTeachers } from './teachers.js';
import { fetchTripsApi } from './api.js';

export function usePortalData() {
  const [state, setState] = useState(() => ({
    tripsState: loadTrips(),
    photosState: loadPhotos(),
    teachersState: loadTeachers(),
  }));

  const refreshFromApi = useCallback(async () => {
    await fetchTripsApi();
  }, []);

  useEffect(() => {
    const syncLocal = () => {
      setState({
        tripsState: loadTrips(),
        photosState: loadPhotos(),
        teachersState: loadTeachers(),
      });
    };

    refreshFromApi();

    const onFocus = () => refreshFromApi();

    window.addEventListener('storage', syncLocal);
    window.addEventListener('sae:data-updated', syncLocal);
    window.addEventListener('focus', onFocus);

    return () => {
      window.removeEventListener('storage', syncLocal);
      window.removeEventListener('sae:data-updated', syncLocal);
      window.removeEventListener('focus', onFocus);
    };
  }, [refreshFromApi]);

  return {
    trips: state.tripsState.trips,
    tripsError: state.tripsState.error,
    photos: state.photosState.photos,
    photosError: state.photosState.error,
    teachers: state.teachersState.teachers,
    teachersError: state.teachersState.error,
    refreshFromApi,
  };
}
