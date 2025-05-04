import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { LocationProvider } from '../context/LocationContext';

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return null;
  }


  return (
    <LocationProvider>
        <Stack screenOptions={{ headerShown: false }}>
        
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="login" />
        
         
          <Stack.Screen name="locationScreen"/>
        </Stack>
        </LocationProvider>
  );
}