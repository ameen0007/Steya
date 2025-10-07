import { View } from 'react-native';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useCustomFonts from '../CustomFonts/fonts';

export default function Index() {
  const fontsLoaded = useCustomFonts();
  const user = useSelector((state) => state.user.userData);
  const locationData = useSelector((state) => state.location.locationData);
  
  const [isNavigating, setIsNavigating] = useState(false);
  const [isReady, setIsReady] = useState(false);
console.log("its come----------- ");

  useEffect(() => {
    const navigate = async () => {
      if (!fontsLoaded || isNavigating) return;
      
      setIsNavigating(true);
      
      try {
        // Get AsyncStorage values directly
        const firstLaunchFlag = await AsyncStorage.getItem('isFirstLaunch');
        const type = await AsyncStorage.getItem('userType');
        
        const isFirst = firstLaunchFlag === 'true'; //  can be true or false
        const userType = type; // can be null or 'GuestUser'
        
       
        
        // 1️⃣ First time open AND user not selected → login
        if (!isFirst && !user && userType !== 'GuestUser') {
          console.log('Navigating to login:', isFirst, user, userType);
          await SplashScreen.hideAsync();
          router.replace('/login');
          return;
        }
        
        // 2️⃣ Guest or user with location → home
        if ((user || userType === 'GuestUser') && locationData) {
          console.log('Navigating to home:', isFirst, user, userType, locationData);
          await SplashScreen.hideAsync();
          router.replace('/(tabs)');
          return;
        }
        
        // 3️⃣ Guest or user without location → location
        if ((user || userType === 'GuestUser') && !locationData) {
          console.log('Navigating to location:', isFirst, user, userType, locationData);
          await SplashScreen.hideAsync();
           console.log("--------index to location");
          router.replace('/locationScreen');
          return;
        }
        
        console.log("Fallback to home");
        // 4️⃣ fallback → home
        await SplashScreen.hideAsync();
        router.replace('/(tabs)');
        
      } catch (error) {
        console.error('Navigation error:', error);
        // Fallback navigation
        await SplashScreen.hideAsync();
        router.replace('/(tabs)');
      }
    };

    navigate();
  }, [fontsLoaded, user, locationData, isNavigating]);

  // Show nothing while fonts are loading or navigation is in progress
  if (!fontsLoaded || isNavigating) {
    return null;
  }

  // This should rarely render since navigation happens before this point
  return <View style={{ flex: 1, backgroundColor: '#ffffff' }} />;
}