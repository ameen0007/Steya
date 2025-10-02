// app/_layout.js
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import 'react-native-reanimated';
import { LocationProvider } from '../context/LocationContext';
import '@/global.css'
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import store, { persistor } from '../app/Redux/store';

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });


  if (!loaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <LocationProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="login" />
            <Stack.Screen name="Listingpage" />
            <Stack.Screen name="homeform" />
            <Stack.Screen name="pghostelform" />
            <Stack.Screen name="sharedroomform" />
            <Stack.Screen name="locationScreen"/>
          </Stack>
        </LocationProvider>
      </PersistGate>
    </Provider>
  );
}