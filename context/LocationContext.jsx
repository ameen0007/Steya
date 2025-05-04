import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [locationDetails, setLocationDetails] = useState(null);

  const refreshLocation = async () => {
    try {
      const stored = await AsyncStorage.getItem('locationDetails');
      if (stored) {
        setLocationDetails(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading location:', error);
    }
  };

  useEffect(() => {
    refreshLocation();
  }, []);

  return (
    <LocationContext.Provider value={{ locationDetails, refreshLocation }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);