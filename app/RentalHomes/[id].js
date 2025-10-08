import { useRef, useState, useEffect } from 'react';
import { ScrollView, TouchableOpacity, Text, View, Image, Modal, Dimensions, Platform, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather, FontAwesome5, Ionicons, MaterialCommunityIcons, MaterialIcons, Entypo } from '@expo/vector-icons';
import { format } from 'date-fns';
import SafeWrapper from '../../services/Safewrapper'; // Adjust this path if needed
import { dummyListings } from '../../services/dummyListings';
const { width } = Dimensions.get('window');
import TopFadeGradient from '../../componets/topgradient';
import  StaticMap  from '../../componets/map'; 
import SkeletonLoader from '../../componets/individualloader';
import axios from 'axios';
import api from '../../services/intercepter';
import { useDispatch, useSelector } from 'react-redux';
import { showToast } from '../../services/ToastService';
import { GoogleSignin, isSuccessResponse } from '@react-native-google-signin/google-signin';
import { preventDoubleTap } from '../../services/debounfunc';
import { setLocationData } from '../Redux/LocationSlice';
import { setUserData } from '../Redux/userSlice';
import { initializePushNotifications } from '../../services/notificationHandler';
import AsyncStorage from '@react-native-async-storage/async-storage';
const FlatHomeDetailsPage = () => {
      const { id } = useLocalSearchParams();
const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const router = useRouter();
  const modalFlatListRef = useRef(null);
  const [currentImage, setCurrentImage] = useState(0);
  const [modalCurrentImage, setModalCurrentImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [initialImageIndex, setInitialImageIndex] = useState(0);
    const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
   const user = useSelector((state) => state.user.userData);
const dispatch = useDispatch();
  const locationData = useSelector((state) => state.location.locationData);



  const incrementViewCount = async () => {
    try {
      if (!id) return;
      
      console.log("🔄 Incrementing view count for room:", id);
    
      
      const response = await axios.post(`${apiUrl}/api/${id}/view`, {
        userId: user?._id // Send userId if user is logged in
      });

      if (response.data.success) {
        console.log("✅ View count updated:", response.data.views);
        
        // Update the local item state with new view count
        if (item) {
          setItem(prevItem => ({
            ...prevItem,
            views: response.data.views
          }));
        }
      }
    } catch (error) {
      console.error("❌ Error incrementing view count:", error);
      // Don't show error to user as this is a background operation
    }
  };

  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${apiUrl}/api/singleroom/${id}`);
        setItem(response.data?.room);
        console.log("✅ Room data fetched:", response.data?.room);
        
        // ✅ CALL VIEW COUNT API AFTER SUCCESSFUL DATA FETCH
        await incrementViewCount();
        
      } catch (err) {
        console.error("❌ Error fetching room data:", err);
        setError(err.message || 'Failed to load room details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRoomData();
    }
  }, [id]);

  // Check if room is favorited
useEffect(() => {
  const checkFavorite = async () => {
    if (!id) return;

    if (!user?._id) {
      console.log("⚠️ User not logged in, skipping favorite check");
      return; // <-- must be inside braces
    }

    try {
      const response = await api.get(`${apiUrl}/api/check/${id}`);
      console.log('Favorite check response:', response.data);

      // ✅ Handle both possible property names
      const favoriteStatus = response.data.isFavorited ?? response.data.isFavorite ?? false;
      setIsFavorite(favoriteStatus);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  checkFavorite();
}, [id, user?._id]); 



const handleChatPress = async () => {
  preventDoubleTap(async () => {
    console.log("Starting chat for product:", item._id);
    setLoading(true); // <-- Start global loading

    try {
      // --------------------------
      // Step 1: Google Login if needed
      // --------------------------
      if (!user?._id) {
        console.log("User not logged in. Initiating Google login...");

        await GoogleSignin.hasPlayServices();
        const userInfo = await GoogleSignin.signIn();

        if (!isSuccessResponse(userInfo)) {
          console.log("⚠️ Google sign-in cancelled by user");
          return; // early exit
        }

        const idToken = userInfo.data?.idToken;
        if (!idToken) {
          console.log("❌ No idToken found");
          return; // early exit
        }

        // Call backend for authentication
        const res = await axios.post(`${apiUrl}/api/auth/google-login`, { idToken });

        if (!res?.data?.user) {
          console.log("❌ Backend login failed");
          return; // early exit
        }

        // Save data
        if (res.data.user.location) dispatch(setLocationData(res.data.user.location));
        await AsyncStorage.setItem("authToken", res.data.accessToken);
        await AsyncStorage.setItem("userId", res.data.user._id);
        dispatch(setUserData(res.data.user));

        // Initialize push notifications (non-blocking)
        initializePushNotifications(apiUrl)
          .then(pushToken => console.log("Push ready:", pushToken))
          .catch(err => console.error("Push setup error:", err.message));
      }

      // --------------------------
      // Step 2: Check/Create Chat Room
      // --------------------------
      setIsCreatingRoom(true);

      const checkResponse = await api.get(`${apiUrl}/api/chat/check-room`, {
        params: { productId: item._id }
      });

      let roomId;

      if (checkResponse.data.exists) {
        roomId = checkResponse.data.roomId;
      } else {
        const createResponse = await api.post(`${apiUrl}/api/chat/create-room`, {
          productId: item._id,
          productTitle: item.title || 'Product Chat',
          ownerId: item?.createdBy?._id
        });
        roomId = createResponse.data.roomId;
      }

      // Navigate to chat
      router.push({
        pathname: '/chat/[id]',
        params: { id: roomId }
      });

    } catch (error) {
      console.error("❌ Error in chat/login flow:", error);
      showToast('Failed to start chat. Please try again.');
    } finally {
      // Always reset loading
      setLoading(false);
      setIsCreatingRoom(false);
    }
  });
};



  const handleBackPress = () => {
    router.back(); // Go back to the previous screen
  };

  const toggleFavorite = () => {
    setIsFavorite((prev) => !prev);
  };

  const openImageModal = (index) => {
    setInitialImageIndex(index);
    setModalCurrentImage(index);
    setIsModalVisible(true);
  };

  // Use this effect to scroll to the proper image when modal opens
  useEffect(() => {
    if (isModalVisible && modalFlatListRef.current) {
      setTimeout(() => {
        modalFlatListRef.current.scrollToIndex({
          index: modalCurrentImage,
          animated: false
        });
      }, 100);
    }
  }, [isModalVisible]);

  const closeImageModal = () => {
    console.log('Modal closed');
    setCurrentImage(modalCurrentImage);
    setIsModalVisible(false);
  };

  // This is required for initialScrollIndex to work properly
  const getItemLayout = (data, index) => ({
    length: width,
    offset: width * index,
    index,
  });

  // Helper function to format tenant preference for display
  const formatTenantPreference = (preference) => {
    switch (preference) {
      case 'family': return 'Families';
      case 'bachelor': return 'Bachelors';
      case 'couple': return 'Couples';
      case 'any': return 'Any';
      default: return preference.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  // Helper function to format parking type for display
  const formatParking = (parking) => {
    switch (parking) {
      case 'four_wheeler': return 'Four-Wheeler Parking';
      case 'two_wheeler': return 'Two-Wheeler Parking';
      case 'both': return 'Two & Four-Wheeler Parking';
      case 'none': return 'No Parking';
      default: return parking.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  // Helper function to format furnished status
  const formatFurnishedStatus = (status) => {
    switch (status) {
      case 'furnished': return 'Fully Furnished';
      case 'semi_furnished': return 'Semi-Furnished';
      case 'unfurnished': return 'Unfurnished';
      default: return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  return (
   <>
   {loading || !item ? (
    <SkeletonLoader />
  ) : (
    <SafeWrapper>
      <ScrollView>
        {/* Image Carousel */}
    <FlatList
  data={item?.images} // safe access
  horizontal
  pagingEnabled
  showsHorizontalScrollIndicator={false}
  keyExtractor={(image) => image._id} // use _id from backend
  onMomentumScrollEnd={(e) => {
    const index = Math.floor(e.nativeEvent.contentOffset.x / width);
    setCurrentImage(index);
  }}
  renderItem={({ item: image, index }) => (
    <View style={{ width, justifyContent: 'center', alignItems: 'center' }}>
      <TouchableOpacity activeOpacity={0.8} onPress={() => openImageModal(index)}>
        <TopFadeGradient />
        <Image 
          source={{ uri: image.originalUrl }} // use originalUrl
          style={{ width, height: 250 }} 
          resizeMode="cover" 
        />
        <View style={{
          position: 'absolute',
          bottom: 10,
          right: 10,
          backgroundColor: '#0009',
          paddingHorizontal: 10,
          paddingVertical: 5,
          borderRadius: 12
        }}>
          <Text style={{ color: 'white', fontSize: 12 }}>
            {index === currentImage ? currentImage + 1 : index + 1}/{item?.images?.length || item?.images?.length} 
            {/* or use item.images.length from parent if needed */}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  )}
/>


        {/* Flat Info */}
        <View style={styles.container}>
  {/* Title and Price Row */}
  <View style={styles.rowBetween}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceText}>₹{item?.monthlyRent}/month</Text>
        </View>
        <View style={styles.locationContainer}>
          <Ionicons name="location-sharp" size={16} color="#7A5AF8" />
          <Text style={styles.locationText}>{item?.location?.fullAddress}</Text>
        </View>
      </View>
  <Text style={styles.title}>{item?.title}</Text>
  {/* Location */}


  {/* Description */}
  <View style={styles.descriptionContainer}>
    <Text style={styles.descriptionText}>{item?.description}</Text>
  </View>

  {/* Property Details Section */}
  <Text style={styles.sectionTitle}>Property Details</Text>
  <View style={styles.detailsContainer}>
    {/* Row 1 */}
    <View style={styles.detailsRow}>
      <View style={styles.detailBox}>
        <View style={styles.iconCircle}>
          <MaterialIcons name="home" size={16} color="#ffffff" />
        </View>
        <View style={styles.detailContent}>
          <Text style={styles.detailLabel}>Property Type</Text>
          <Text style={styles.detailValue}>
            {item?.propertyType?.charAt(0).toUpperCase() + item?.propertyType?.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.detailBox}>
        <View style={styles.iconCircle}>
          <MaterialIcons name="chair" size={16} color="#ffffff" />
        </View>
        <View style={styles.detailContent}>
          <Text style={styles.detailLabel}>Furnishing</Text>
          <Text style={styles.detailValue}>{formatFurnishedStatus(item?.furnishedStatus)}</Text>
        </View>
      </View>
    </View>

    {/* Row 2 */}
    <View style={styles.detailsRow}>
      <View style={styles.detailBox}>
        <View style={styles.iconCircle}>
          <MaterialIcons name="straighten" size={16} color="#ffffff" />
        </View>
        <View style={styles.detailContent}>
          <Text style={styles.detailLabel}>Area</Text>
          <Text style={styles.detailValue}>{item?.squareFeet} sq.ft</Text>
        </View>
      </View>

      <View style={styles.detailBox}>
        <View style={styles.iconCircle}>
          <Entypo name="layers" size={16} color="#ffffff" />
        </View>
        <View style={styles.detailContent}>
          <Text style={styles.detailLabel}>Floor</Text>
          <Text style={styles.detailValue}>{item?.floorNumber}/{item?.totalFloors}</Text>
        </View>
      </View>
    </View>

    {/* Row 3 */}
    <View style={styles.detailsRow}>
      <View style={styles.detailBox}>
        <View style={styles.iconCircle}>
          <MaterialIcons name="people" size={16} color="#ffffff" />
        </View>
        <View style={styles.detailContent}>
          <Text style={styles.detailLabel}>Tenant Pref</Text>
          <Text style={styles.detailValue}>{formatTenantPreference(item?.tenantPreference)}</Text>
        </View>
      </View>

      <View style={styles.detailBox}>
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons name="car" size={16} color="#ffffff" />
        </View>
        <View style={styles.detailContent}>
          <Text style={styles.detailLabel}>Parking</Text>
          <Text style={styles.detailValue}>{formatParking(item?.parking)}</Text>
        </View>
      </View>
    </View>
  </View>

  {/* BHK Configuration */}
  <Text style={styles.sectionTitle}>Configuration</Text>
  <View style={[styles.detailsContainer, {flexDirection: 'row', flexWrap: 'wrap'}]}>
    <View style={styles.chip}>
      <MaterialIcons name="king-bed" size={16} color="#7A5AF8" />
      <Text style={styles.chipText}>{item?.bedrooms} Bed</Text>
    </View>
    <View style={styles.chip}>
      <MaterialIcons name="bathtub" size={16} color="#7A5AF8" />
      <Text style={styles.chipText}>{item?.bathrooms} Bath</Text>
    </View>
    <View style={styles.chip}>
      <MaterialIcons name="balcony" size={16} color="#7A5AF8" />
      <Text style={styles.chipText}>{item?.balconies} Balcony</Text>
    </View>
  </View>

  {/* Posted By Section */}
  <Text style={styles.sectionTitle}>Posted By</Text>
  <View style={styles.postedByContainer}>
    <Image 
      source={{ uri: item?.createdBy.picture }} 
      style={styles.profileImage} 
    />
    <View style={styles.posterInfo}>
      <Text style={styles.posterName}>{item?.createdBy.name}</Text>
        <Text style={styles.postedDate}>
  {new Date(item.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
  })}
</Text>
    </View>
  </View>
</View>
        
        {/* Back Button */}
        <View style={{
          position: 'absolute', 
          top: 10, 
          left: 10, 
          zIndex: 10,
          paddingHorizontal: 15,
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          padding: 10,
          borderRadius: 50,
        }}>
          <TouchableOpacity onPress={handleBackPress} accessible={true} accessibilityLabel="Back Button">
            <FontAwesome5 name="chevron-left" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Favorite Button */}
        <View style={{
          position: 'absolute', 
          top: 10, 
          right: 10, 
          zIndex: 10,
          paddingHorizontal: 10,
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          padding: 8,
          borderRadius: 50,
        }}>
          <TouchableOpacity onPress={toggleFavorite}>
            <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={25} color={isFavorite ? '#FF4081' : 'white'}/> 
          </TouchableOpacity>
        </View>
            
       <StaticMap
  latitude={item?.location?.coordinates[1]}   // latitude
  longitude={item?.location?.coordinates[0]}  // longitude
  placeName={item?.location?.fullAddress}
/>
      </ScrollView>

      {/* Bottom Buttons */}
    {item?.createdBy?._id !== user?._id ? (
    <View style={{
  flexDirection: 'row',
  justifyContent: 'space-between',
  padding: 16,
  borderTopWidth: 1,
  borderColor: '#eee',
  backgroundColor: '#fff'
}}>

   <TouchableOpacity
      style={{
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#7A5AF8',
        padding: 14,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
        opacity: isCreatingRoom ? 0.6 : 1
      }}
      onPress={handleChatPress}
      disabled={isCreatingRoom}
    >
      {isCreatingRoom ? (
        <ActivityIndicator size="small" color="white" />
      ) : (
        <>
          <Feather name="message-circle" size={20} color="white" />
          <Text style={{ color: 'white', marginLeft: 8 }}>Chat</Text>
        </>
      )}
    </TouchableOpacity>

  <TouchableOpacity
    disabled={!item?.showPhonePublic}
    onPress={() => console.log('Calling:', item.contactPhone)}
    style={{
      flex: 1,
      flexDirection: 'row', // horizontal
      backgroundColor: item.showPhonePublic ? '#7A5AF8' : '#ccc',
      padding: 14,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center'
    }}
  >
    <Feather name="phone-call" size={20} color="white" />
    <Text style={{ color: 'white', marginLeft: 8 }}>Call</Text>
  </TouchableOpacity>
</View> 

) : (
  <View style={styles.chatDisabled}>
    <Text style={styles.chatDisabledText}>This is your product</Text>
  </View>
)}

      {/* Image Modal */}
      <Modal visible={isModalVisible} transparent={true} animationType="fade" onRequestClose={closeImageModal}>
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'black',
        }}>
          <TouchableOpacity onPress={closeImageModal} style={{
            position: 'absolute', 
            top: 20, 
            right: 15, 
            zIndex: 10,
            paddingHorizontal: 10,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            padding: 8,
            borderRadius: 50,
          }} accessible={true} accessibilityLabel="Close Image Modal">
            <Feather name="x" size={20} color="white" />
          </TouchableOpacity>

          {/* Image Modal with FlatList - Fixed with getItemLayout and ref */}
      <FlatList
  ref={modalFlatListRef}
  data={item?.images} // safe access
  horizontal
  pagingEnabled
  showsHorizontalScrollIndicator={false}
  getItemLayout={getItemLayout}
  initialScrollIndex={modalCurrentImage}
  onMomentumScrollEnd={(event) => {
    const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setModalCurrentImage(newIndex); // Update the modal's current image index
  }}
  renderItem={({ item: image, index }) => (
    <View style={{ width, justifyContent: 'center', alignItems: 'center' }}>
      <Image 
        source={{ uri: image.originalUrl }} // use originalUrl
        style={{ width, height: 400 }} 
        resizeMode="contain" 
      />
    </View>
  )}
  keyExtractor={(image) => image?._id} // use _id from backend
/>


          {/* Image Indicator */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#0009',
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 12,
            paddingBottom: '10%'
          }}>
            <Text style={{ color: 'white', fontSize: 12 }}>
              {modalCurrentImage + 1}/{item?.images?.length}
            </Text>
          </View> 
        </View>
      </Modal>
    </SafeWrapper>

  )}
    </>
  );
};
const greybg = '#FBFAFF';
const maintext = '#212121';
const lighttext = '#757575';
const mainbg = '#7A5AF8';

const styles = StyleSheet.create({
    chatDisabled: {
  paddingVertical: 10,
  paddingHorizontal: 16,
  backgroundColor: '#E5E7EB', // light gray to indicate disabled
  borderRadius: 8,
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: 8,
},

chatDisabledText: {
  color: '#9CA3AF', // gray text
  fontSize: 14,
  fontWeight: '500',
},
  container: {
   
   flex: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginVertical: 8,
    marginHorizontal: 14,
   
  },
  title: {
    fontSize: 17,
    fontWeight: '500',
    marginBottom: 12,
    color: maintext,
    marginTop: 10,
 
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // borderBottomWidth: 1,
    // borderBottomColor: '#EBE7FF',

  },
  priceContainer: {
    flex: 1,
    paddingVertical: 4,

    
    borderRadius: 6,
  },
  priceText: {
    fontSize: 16,
    color: maintext,
    fontWeight: '700',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  
  },
  locationText: {

    fontSize: 14,
    color: '#555',
    flex: 1,
  },
  descriptionContainer: {
backgroundColor: '#FBFAFF',
    borderRadius: 8,
    marginBottom: 16,
    padding: 10,
  },
  descriptionText: {

    fontSize: 14,
    color: '	#4F4F4F',
    lineHeight: 20,
    // fontFamily: 'Poppinsssm',
    fontWeight: '400',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 10,
    color: maintext,
  },
  detailsContainer: {
    backgroundColor: '#FBFAFF',
  
    padding: 10,
  paddingBottom: 0,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EBE7FF',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0ebff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 50,
    marginRight: 10,
    marginBottom: 8
  },
  chipText: {
    marginLeft: 4,
    color: '#7A5AF8',
    fontSize: 14
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailBox: {
    flex: 0.485,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    shadowColor: '#7A5AF8',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#7A5AF8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: '#888',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  postedByContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FBFAFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EBE7FF',
  },
  profileImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  
  },
  posterInfo: {
    marginLeft: 12,
  },
  posterName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  postedDate: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  }
});

export default FlatHomeDetailsPage;