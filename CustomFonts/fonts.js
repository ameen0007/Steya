import { useFonts } from 'expo-font';

export default function useCustomFonts() {
  const [fontsLoaded] = useFonts({
       'Poppins': require('../assets/fonts/Poppins-Bold.ttf'), 
       'Poppinssm': require('../assets/fonts/Poppins-Medium.ttf'), 
       'Poppinsssm': require('../assets/fonts/Poppins-Light.ttf'),
       'BriemHand': require('../assets/fonts/BriemHand-Bold.ttf'),  
  });

  return fontsLoaded;
}
