


import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useCustomFonts from '../CustomFonts/fonts';

SplashScreen.preventAutoHideAsync();

export default function Index() {
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const fontsLoaded = useCustomFonts();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('user_token');
        setIsLoggedIn(!!token);
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsLoggedIn(false);
      }
    };

    if (fontsLoaded) {
      checkAuthStatus();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    
    const prepareAndNavigate = async () => {
        await AsyncStorage.clear();
      if (fontsLoaded && isLoggedIn !== null) {
        try {
          let targetRoute = '/login'; // Default to login

          if (isLoggedIn) {
            // Check for location details
            const locationDetails = await AsyncStorage.getItem('locationDetails');
            targetRoute = locationDetails ? '/(tabs)' : '/locationScreen';
          }

          // Optional: Add a small delay if needed for splash screen
          await SplashScreen.hideAsync();
          router.replace(targetRoute);
        } catch (error) {
          console.error('Navigation error:', error);
          await SplashScreen.hideAsync();
          router.replace('/loginScreen');
        }
      }
    };

    prepareAndNavigate();
  }, [fontsLoaded, isLoggedIn]);

  if (!fontsLoaded || isLoggedIn === null) {
    return null;
  }

  return <View style={{ flex: 1 }} />;
}

