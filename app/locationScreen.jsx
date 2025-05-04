import React, { useEffect, useMemo, useState ,useRef} from 'react';
import * as Location from 'expo-location';
import { 
  Text, 
  StyleSheet, 
  View,
  TextInput, 
  TouchableOpacity, 
  FlatList ,
  ActivityIndicator,
  Modal,
  Button,Alert, Linking, Platform, 

  
} from 'react-native';
import SafeWrapper from '../services/Safewrapper';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  withRepeat

} from 'react-native-reanimated';
import { locationSearch } from '../services/LocationSearch';
import GoogleStyleLoadingBar from '../componets/Loader';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useLocation } from '../context/LocationContext';
import AsyncStorage from '@react-native-async-storage/async-storage';


// Constants
const phraseHeight = 24;
const PHRASES = ['Post a Room', 'Find a Room'];
const ANIMATION_DURATION = 1000; // 1 second for transition
const PAUSE_DURATION = 1000;     // 1 second pause

// ✅ Debounce utility (keep outside component)
const debounce = (func, delay) => {
  let timeoutId;

  const debouncedFunction = (...args) => {
    console.log('debounce called with:', args); // LOG 1
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      console.log('debounce timer executed for:', args); // LOG 2
      func(...args);
    }, delay);
  };

  debouncedFunction.cancel = () => {
    if (timeoutId) {
      console.log('debounce canceled'); // LOG 3
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debouncedFunction;
};



export default function LocationScreen() {
  const translateY = useSharedValue(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { refreshLocation } = useLocation();

  const [currentLocation, setCurrentLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


 const [modalVisible, setModalVisible] = useState(false); 
  const [location, setLocation] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const checkLocationStatus = async () => {
      try {
        const storedStatus = await AsyncStorage.getItem('locationDetails');
        if (storedStatus) {
          setLocation(true); 
        }
      } catch (error) {
        console.error('Error retrieving location status:', error);
      }
    };

    checkLocationStatus();
  }, []);


  useEffect(() => {
    const animationConfig = {
      duration: ANIMATION_DURATION,
      easing: Easing.linear,
    };

    translateY.value = withRepeat(
      withSequence(
        // Initial position (show first phrase)
        
        // Transition to second phrase
        withTiming(-phraseHeight, animationConfig),
        // Pause on second phrase
        withDelay(PAUSE_DURATION, 
          // Transition to duplicated first phrase
          withTiming(-phraseHeight * 2, animationConfig)
        ),
        // Pause on duplicated first phrase
        withDelay(PAUSE_DURATION, 
          // Reset to initial position (instant)
          withTiming(0, { duration: 0 })
        )
      ),
      -1
    );

    return () => {
      translateY.value = 0;
    };
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }]
  }));

  
  const handleLocationSelect = async (location) => {
    try {
      await AsyncStorage.setItem('locationDetails', JSON.stringify({
        name: location.formatted,
        lat: location.lat,
        lon: location.lon
      }));
      
      await refreshLocation(); // Now uses top-level refreshLocation
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Error', 'Failed to save location');
    }
  };

 // Move debounce function BEFORE its usage
 const latestQueryRef = useRef('');

const handleSearch = (text) => {
  console.log('handleSearch:', text);
  setSearchQuery(text);
  latestQueryRef.current = text;

  if (!text.trim()) {
    console.log('Search cleared');
    debouncedSearch.cancel();
    setSearchResults([]);
    setErrorMessage('');
    setIsSearching(false);
    return;
  }

  setIsSearching(true);
  debouncedSearch(text); // debounce performs API search
};

const performSearch = async (text) => {
  console.log('performSearch START:', text);
  
  if (!text || text.trim().length <= 2) {
    console.log('Too short or empty');
    setSearchResults([]);
    setErrorMessage(text.trim().length > 0
      ? 'Please enter at least 3 characters'
      : '');
    setIsSearching(false);
    return;
  }

  try {
    const result = await locationSearch(text);
    console.log('API result for:', text, result);

    // Check if the text is still current
    if (latestQueryRef.current !== text) {
      console.log('Skipping stale result for:', text);
      return;
    }

    if (result.success) {
      setSearchResults(result.data);
      setErrorMessage('');
    } else {
      setErrorMessage(result.message || 'Location not found');
      setSearchResults([]);
    }
  } catch (error) {
    if (latestQueryRef.current !== text) return;
    console.log('Error fetching:', error);
    setErrorMessage('Failed to search locations');
    setSearchResults([]);
  } finally {
    if (latestQueryRef.current === text) {
      setIsSearching(false);
    }
    console.log('performSearch END for:', text);
  }
};

// Clear search
const handleClear = () => {
  console.log('handleClear called');
  debouncedSearch.cancel();
  latestQueryRef.current = '';
  setSearchQuery('');
  setSearchResults([]);
  setErrorMessage('');
  setIsSearching(false);
};

// Cleanup on unmount
useEffect(() => {
  return () => {
    debouncedSearch.cancel();
  };
}, []);

const debouncedSearch = useMemo(() => debounce(performSearch, 300), []);

//  console.log(location,"Location");
 
console.log(modalVisible,"============================");


 


  // Render functions
  const renderSearchItem = ({ item }) => (
    <TouchableOpacity style={styles.searchResultItem}  onPress={() => handleLocationSelect(item)}>
      
      <Feather name="map-pin" size={20} color="#673AB7" style={styles.locationIcon} />
      <View style={styles.resultTextContainer}>
        <Text style={styles.resultTitle}>{item.formatted}</Text>
        <Text style={styles.resultAddress}>
          {[item.city, item.state, item.country].filter(Boolean).join(', ')}
        </Text>
      </View>
    </TouchableOpacity>
  );
   

  //   console.log("[1] 🟢 Location button clicked");
    
  //   setLoading(true);
  //   setError(null);
    
  //   try {
  //     console.log("[2] 🔄 Attempting initial location fetch (silent mode)");
  //     let result = await fetchCurrentLocation({ showAlert: true });

  //     console.log("[3] 📦 Initial fetch result:", JSON.stringify(result, null, 2));
      
  //     if (!result.success && result.errorType === 'DENIED') {
  //       console.log("[4] 🔴 First denial detected - trying forced request");
  //       result = await fetchCurrentLocation({ 
  //         forceRequest: true,
  //         showAlert: true
  //       });
  //       console.log("[5] 🔄 Forced request result:", JSON.stringify(result, null, 2));
  //     }
      
  //     if (result.success) {
  //       console.log("[6] 🎯 Location fetch successful. Coordinates:", result.coordinates);
  //       setCurrentLocation(result.coordinates);
  //       console.log("[7] 📌 State updated with coordinates");
  //     } else if (result.error) {
  //       console.warn("[8] ⚠️ Error in location fetch:", result.error);
  //       setError(result.error);
  //     }
      
  //   } catch (error) {
  //     console.error("[9] ❌ Unexpected error:", error);
  //     setError('Unexpected location error');
  //     Alert.alert('Error', 'Unexpected error getting location');
  //   } finally {
  //     console.log("[10] ⏹️ Final currentLocation state:", currentLocation);
  //     setLoading(false);
  //   }
  // };

  const closeModal = () => {
    setModalVisible(false);
  };
  const handleGetLocation = async () => {
    console.log('[Location] HandleGetLocation triggered');
    setErrorMsg(null);
    setLoading(true);
  
    try {
      // 1. Check current permission status
      const { status } = await Location.getForegroundPermissionsAsync();
  console.log("status",status);
  
      // 2. Handle already granted permissions
      if (status === 'granted') {
        const success = await getCurrentLocation();
        if (!success) {
          console.log("Location fetch failed after granted permission");
        }
        return;
      }
  
      // 3. Request permission if not granted
      const { status: newStatus, canAskAgain } = await Location.requestForegroundPermissionsAsync();
  
      // 4. Handle permission results
      if (newStatus === 'granted') {
        const success = await getCurrentLocation();
        if (!success) {
          console.log("Location fetch failed after permission grant");
        }
      } else if (!canAskAgain) {
        // 5. Only show settings modal for permanent denial
        console.log('Permanent denial - showing settings modal');
        setModalVisible(true);
      }
      // No action for temporary denial (canAskAgain === true)
  
    } catch (error) {
      console.error('[Location] Error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Modified settings opener with retry logic
  const openSettings = async () => {
    try {
      await Linking.openSettings();
      // Retry location check after returning from settings
      setTimeout(() => handleGetLocation(), 1000);
    } catch (error) {
      console.error('Error opening settings:', error);
    }
    setModalVisible(false);
  };
  
  const getCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({});
      const addresses = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
  
      const address = addresses[0];
  
      // Only take district and region
      const locationName = `${address.district || address.city || 'Unknown'}, ${address.region || ''}`;
  
      const locationData = {
        name: locationName.trim(),
        lat: location.coords.latitude,
        lon: location.coords.longitude,
      };
  
      console.log(locationData, 'locationData');
  
      await AsyncStorage.setItem('locationDetails', JSON.stringify(locationData));
      await refreshLocation();
      router.push('/(tabs)');
      
    } catch (error) {
      console.log('Error getting location:', error);
      setErrorMsg("Error getting location");
    }
  };
  




  return (
  <View style={styles.container}>

  <StatusBar style="dark" />
      <SafeWrapper style={styles.safeArea}>
 
  

        {/* Animated Header */}
        <View  style={styles.header}>
{location &&       <TouchableOpacity onPress={()=>router.push('/(tabs)')} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity> }
    
          
          <View style={styles.titleContainer}>
            <Text style={styles.staticText}>Choose a location to</Text>
            
            <View style={styles.animatedPhrases}>
              <Animated.View style={[styles.phrasesContainer, animatedStyle]}>
                <Text style={styles.animatedText}>{PHRASES[0]}</Text>
                <Text style={styles.animatedText}>{PHRASES[1]}</Text>
                <Text style={styles.animatedText}>{PHRASES[0]}</Text>
              </Animated.View>
            </View>
          </View>

        </View>

        {/* Rest of the UI remains the same */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#673AB7" style={styles.searchIcon} />
          <TextInput
  style={styles.searchInput}
  placeholder="Enter a location, e.g., Edapally"
  value={searchQuery}
  onChangeText={handleSearch}
  autoCorrect={false}
  autoCapitalize="none"
/>
        
{/*         
{searchQuery.length > 0 && errorMessage ? (
  <Text style={styles.errorText}>{errorMessage}</Text>
) : null} */}


       {searchQuery.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
            <Feather name="x" size={16} color="#673AB7" />
          </TouchableOpacity>
        )}
        </View>


        <TouchableOpacity style={styles.currentLocationBtn}
        onPress={handleGetLocation}
        disabled={loading}
        >
          <Ionicons name="navigate" size={22} color="#673AB7" style={styles.navIcon} />
          <Text style={styles.currentLocationText}>{loading ? 'Detecting Location...' : 'Get Current Location'}</Text>
          <MaterialIcons name="keyboard-arrow-right" size={24} color="#673AB7" />
          {/* <Text className="" >hhh</Text> */}
        </TouchableOpacity>
        {/* {loading && <ActivityIndicator size="large" color="#6200ee" />} */}



        <View style={styles.divider} />
       {loading && <GoogleStyleLoadingBar/>}
       <View style={styles.resultsHeaderContainer}>
          <Text style={styles.resultsHeaderText}>
            {searchResults.length > 0 ? 'POPULAR LOCATIONS' : ''}
          </Text>
        </View>
          
        <View>

        {/* <StatusBar style="light" /> */}
      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={closeModal}
        statusBarTranslucent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={closeModal}
            >
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
            
            <Text style={styles.modalTitle}>Turn On Location permission</Text>
            <Text style={styles.modalText}>
              Please go to Settings -&gt; Location to turn on Location permission
            </Text>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={closeModal}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.settingsButton} 
                onPress={openSettings}
              >
                <Text style={styles.settingsButtonText}>Settings</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
         
        </View>
        


        {isSearching && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#673AB7" />
          </View>
        )}

        <FlatList
    data={searchResults} // Directly use searchResults array
    renderItem={renderSearchItem}
    keyExtractor={(item, index) => 
  `${item.id}-${item.lat}-${item.lon}-${index}`}

  style={styles.resultsList}
  showsVerticalScrollIndicator={false}
  ListEmptyComponent={
    !isSearching && (
      <View  style={styles.mText}>
      <Text style={styles.emptyText}>
        {errorMessage ? errorMessage :
         searchQuery ? 'No results found' :
         ''}
      </Text>
      </View>
    )
  }
/>


      </SafeWrapper>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  safeArea: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
   
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '88%',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#888',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#EBE9FE',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  settingsButton: {
    flex: 1,
    backgroundColor: '#673AB7',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  cancelButtonText: {
    color: '#673AB7',
    fontSize: 16,
    fontWeight: '600',
  },
  settingsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  
   
  },
  animatedPhrases: {
    height: phraseHeight,
    overflow: 'hidden',
    marginLeft: 4,
    width: 120,

  },
  phrasesContainer: {
    // No need for absolute positioning
  },
  animatedText: {
    height: phraseHeight,
    fontSize: 16,
    fontWeight: '600',
    color: '#673AB7',
    marginTop:'0.5%'
  },
  staticText:{
    fontSize: 17,
    fontWeight: '600',
    marginLeft:'5%',
   
  },
  mText:{
  paddingHorizontal:20,
   
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    paddingHorizontal: 13,
    height: 50,
    backgroundColor: 'white',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#673AB7',
    marginTop:10
    
  },
  titleContainer:{
  display:'flex',
  flexDirection: 'row',
  fontSize: 16,
  fontWeight: '600',
  },
  searchIcon: {
    marginRight: 8,
  },
  loadingContainer:{
     
  },
  emptyText:{
     textAlign:'center',
     fontSize: 16,
     color: '#000',
     fontWeight: '400',

  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#000',
  },
  clearButton: {
    padding: 6,
    backgroundColor: '#F3F2FE',
    borderRadius: 12,
    fontWeight:'700'
  },
  currentLocationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    marginTop: 14,
    paddingVertical: 10,
  },
  navIcon: {
    marginRight: 12,
  },
  currentLocationText: {
    flex: 1,
    fontSize: 16,
    color: '#673AB7',
    fontWeight: '500',
  },
  divider: {
    height: 10,
    backgroundColor: '#f7f7f7',
  },
  resultsHeaderContainer: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  resultsHeaderText: {
    fontSize: 14,
    color: '#777',
    fontWeight: '500',
  },
  resultsList: {
    flex: 1,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  locationIcon: {
    marginTop: 4,
    marginRight: 12,
  },
  resultTextContainer: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
    color: '#000',
  },
  resultAddress: {
    fontSize: 14,
    color: '#777',
  },
});












