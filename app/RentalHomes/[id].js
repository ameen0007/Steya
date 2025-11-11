import { useRef, useState, useEffect } from 'react';
import { ScrollView, TouchableOpacity, Text, View, Image, Modal, Dimensions, Platform, FlatList, StyleSheet, ActivityIndicator, Share, TextInput, Linking } from 'react-native';
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
import { Animated } from 'react-native';

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
const [imageLoaded, setImageLoaded] = useState(false);
const shimmerAnimation = useRef(new Animated.Value(0)).current;
  // NEW STATE FOR REPORT MODAL
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);

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
  if (!imageLoaded) {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnimation, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }
}, [imageLoaded]);

const translateX = shimmerAnimation.interpolate({
  inputRange: [0, 1],
  outputRange: [-350, 350],
});


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
        return;
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

  // NEW: SHARE FUNCTIONALITY
  const handleShare = async () => {
    try {
      const shareMessage = `Check out this flat: ${item?.title}
📍 ${item?.location?.fullAddress}
💰 ₹${item?.monthlyRent}/month
${item?.description?.substring(0, 100)}...

Download the app to view more details!`;

      const result = await Share.share({
        message: shareMessage,
        title: item?.title || 'Flat Listing',
      });

      if (result.action === Share.sharedAction) {
        showToast('Flat shared successfully!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      showToast('Failed to share flat');
    }
  };

  // NEW: REPORT FUNCTIONALITY
  const handleReportSubmit = async () => {
    if (!reportReason) {
      showToast('Please select a reason for reporting');
      return;
    }

    try {
      setIsSubmittingReport(true);
      const response = await api.post(`${apiUrl}/api/reports/report-room`, {
        roomId: id,
        reason: reportReason,
        description: reportDescription
      });

      showToast('Flat reported successfully.');
      setIsReportModalVisible(false);
      setReportReason('');
      setReportDescription('');
    } catch (error) {
      console.error('Error reporting room:', error);
      const errorMessage = error.response?.data?.message || 'Failed to report flat';
   
    } finally {
      setIsSubmittingReport(false);
    }
  };

  // NEW: TOGGLE FAVORITE WITH API
  const toggleFavorite = async () => {
    if (isFavoriteLoading) return;

    try {
      setIsFavoriteLoading(true);
      console.log('🔄 Toggling favorite for flat:', id);
      
      const response = await api.post(`${apiUrl}/api/toggle`, {
        roomId: id
      });

      console.log('✅ Favorite toggle response:', response.data);
      
      const newFavoriteStatus = response.data.isFavorited ?? response.data.isFavorite ?? false;
      setIsFavorite(newFavoriteStatus);
      
    } catch (error) {
      console.error('❌ Error toggling favorite:', error);
      showToast('Failed to update favorite status');
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  const handleChatPress = async () => {
    preventDoubleTap(async () => {
      console.log("Starting chat for product:", item._id);
      setLoading(true);

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
            return;
          }

          const idToken = userInfo.data?.idToken;
          if (!idToken) {
            console.log("❌ No idToken found");
            return;
          }

          const res = await axios.post(`${apiUrl}/api/auth/google-login`, { idToken });

          if (!res?.data?.user) {
            console.log("❌ Backend login failed");
            return;
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
        setLoading(false);
        setIsCreatingRoom(false);
      }
    });
  };

  const handleBackPress = () => {
    router.back();
  };

  const openImageModal = (index) => {
    setInitialImageIndex(index);
    setModalCurrentImage(index);
    setIsModalVisible(true);
  };

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

  const getItemLayout = (data, index) => ({
    length: width,
    offset: width * index,
    index,
  });

  // NEW: MAKE PHONE CALL FUNCTION
  const makePhoneCall = (phoneNumber) => {
    if (!phoneNumber) return;

    // Remove everything except digits
    const cleanedNumber = phoneNumber.replace(/\D/g, '');

    Linking.openURL(`tel:${cleanedNumber}`)
      .catch((err) => console.error('Error opening dialer:', err));
  };

  // Helper functions remain the same...
  const formatTenantPreference = (preference) => {
    switch (preference) {
      case 'family': return 'Families';
      case 'bachelor': return 'Bachelors';
      case 'couple': return 'Couples';
      case 'any': return 'Any';
      default: return preference.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const formatParking = (parking) => {
    switch (parking) {
      case 'four_wheeler': return 'Four-Wheeler Parking';
      case 'two_wheeler': return 'Two-Wheeler Parking';
      case 'both': return 'Two & Four-Wheeler Parking';
      case 'none': return 'No Parking';
      default: return parking.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const formatFurnishedStatus = (status) => {
    switch (status) {
      case 'furnished': return 'Fully Furnished';
      case 'semi_furnished': return 'Semi-Furnished';
      case 'unfurnished': return 'Unfurnished';
      default: return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  // NEW: REPORT REASONS
  const reportReasons = [
    { value: 'spam', label: 'Spam or Scam' },
    { value: 'inappropriate', label: 'Inappropriate Content' },
    { value: 'misinformation', label: 'Misinformation' },
    { value: 'fake_listing', label: 'Fake Listing' },
    { value: 'already_rented', label: 'Already Rented' },
    { value: 'wrong_info', label: 'Wrong Information' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <>
      {loading || !item ? (
        <SkeletonLoader />
      ) : (
        <SafeWrapper>
          <ScrollView>
            {/* Image Carousel */}
      <FlatList
  data={item?.images}
  horizontal
  pagingEnabled
  showsHorizontalScrollIndicator={false}
  keyExtractor={(image) => image?._id}
  onMomentumScrollEnd={(e) => {
    const index = Math.floor(e.nativeEvent.contentOffset.x / width);
    setCurrentImage(index);
  }}
  renderItem={({ item: image, index }) => (
    <View style={{ width, justifyContent: 'center', alignItems: 'center' }}>
      <TouchableOpacity activeOpacity={0.9} onPress={() => openImageModal(index)}>
        {/* SHIMMER SKELETON - ADD THIS */}
        {!imageLoaded && (
          <View style={styles.skeletonImage}>
            <Animated.View 
              style={[
                styles.shimmer,
                {
                  transform: [{ translateX }],
                },
              ]} 
            />
          </View>
        )}
        
        <TopFadeGradient /> 
        <Image 
          source={{ uri: image.originalUrl }}
          style={[
            { width, height: 250 },
            !imageLoaded && styles.hiddenImage // ADD THIS
          ]} 
          resizeMode="cover"
          onLoad={() => setImageLoaded(true)} // ADD THIS
          onError={() => setImageLoaded(true)} // ADD THIS
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
            {index === currentImage ? currentImage + 1 : index + 1}/{item?.images.length}
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
<TouchableOpacity
  style={styles.postedByContainer}
  onPress={() => {
    if (item.createdBy._id !== user?._id) {
      router.push(`/Profile/${item?.createdBy._id}`);
    }
  }}
  disabled={item.createdBy._id === user?._id}
  activeOpacity={item.createdBy._id === user?._id ? 1 : 0.7}
>
  <Image
    source={{ uri: item?.createdBy?.picture }}
    style={styles.profileImage}
  />
  <View style={styles.posterInfo}>
    <View style={styles.posterNameRow}>
      <Text style={styles.posterName} numberOfLines={1}>
        {item?.createdBy?.name}
      </Text>
      {item.createdBy._id !== user?._id && (
        <View style={styles.chevronContainer}>
          <Ionicons 
            name="chevron-forward" 
            size={16} 
            color="#7A5AF8"
          />
        </View>
      )}
    </View>
    <View style={styles.postedDateRow}>
      <Ionicons name="time-outline" size={12} color="#999" />
      <Text style={styles.postedDate}>
        Posted {new Date(item.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric'
        })}
      </Text>
    </View>
  </View>
</TouchableOpacity>
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

            {/* NEW: Top Right Actions - VERTICAL LAYOUT */}
            <View style={{
              position: 'absolute', 
              top: 10, 
              right: 10, 
              zIndex: 10,
              flexDirection: 'column',
              gap: 8,
            }}>
              {/* Favorite Button */}
              <View style={{
                paddingHorizontal: 10,
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                padding: 8,
                borderRadius: 50,
              }}>
                <TouchableOpacity onPress={toggleFavorite} disabled={isFavoriteLoading}>
                  {isFavoriteLoading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Ionicons 
                      name={isFavorite ? 'heart' : 'heart-outline'} 
                      size={25} 
                      color={isFavorite ? '#FF4081' : 'white'}
                    />
                  )}
                </TouchableOpacity>
              </View>

              {/* Share Button */}
              <View style={{
                paddingHorizontal: 10,
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                padding: 8,
                borderRadius: 50,
              }}>
                <TouchableOpacity onPress={handleShare}>
                  <Feather name="share-2" size={22} color="white" />
                </TouchableOpacity>
              </View>

              {/* Report Button */}
              <View style={{
                paddingHorizontal: 10,
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                padding: 8,
                borderRadius: 50,
              }}>
                <TouchableOpacity onPress={() => setIsReportModalVisible(true)}>
                  <Feather name="flag" size={22} color="#FF6B6B" />
                </TouchableOpacity>
              </View>
            </View>
            
        <View style={styles.mapSection}>
          <Text style={styles.sectionTitle}>Location</Text>
          
          {/* Tap to Navigate Hint */}
          <View style={styles.mapTapHint}>
            <Ionicons name="arrow-down-circle-outline" size={16} color="#7A5AF8" />
            <Text style={styles.mapTapHintText}>
              Tap map below to navigate
            </Text>
          </View>
        
          <StaticMap
            latitude={item?.location?.coordinates[1]}
            longitude={item?.location?.coordinates[0]}
            placeName={item?.location?.fullAddress}
          />
        </View>
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
                onPress={() => makePhoneCall(item.contactPhone)}
                style={{
                  flex: 1,
                  flexDirection: 'row',
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
              <Text style={styles.chatDisabledText}>This is your listing</Text>
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

              <FlatList
                ref={modalFlatListRef}
                data={item?.images}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                getItemLayout={getItemLayout}
                initialScrollIndex={modalCurrentImage}
                onMomentumScrollEnd={(event) => {
                  const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
                  setModalCurrentImage(newIndex);
                }}
                renderItem={({ item: image, index }) => (
                  <View style={{ width, justifyContent: 'center', alignItems: 'center' }}>
                    <Image 
                      source={{ uri: image.originalUrl }}
                      style={{ width,height: '100%' }} 
                      resizeMode="contain" 
                    />
                  </View>
                )}
                keyExtractor={(image) => image?._id}
              />

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

          {/* NEW: Report Modal */}
          <Modal
            visible={isReportModalVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setIsReportModalVisible(false)}
          >
            <View style={styles.reportModalOverlay}>
              <View style={styles.reportModalContent}>
                <View style={styles.reportHeader}>
                  <Text style={styles.reportTitle}>Report Flat</Text>
                  <TouchableOpacity onPress={() => setIsReportModalVisible(false)}>
                    <Feather name="x" size={24} color="#333" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.reportSubtitle}>Why are you reporting this listing?</Text>

                <ScrollView style={styles.reasonsContainer} showsVerticalScrollIndicator={false}>
                  {reportReasons.map((reason) => (
                    <TouchableOpacity
                      key={reason.value}
                      style={[
                        styles.reasonOption,
                        reportReason === reason.value && styles.reasonOptionSelected
                      ]}
                      onPress={() => setReportReason(reason.value)}
                    >
                      <View style={[
                        styles.radioButton,
                        reportReason === reason.value && styles.radioButtonSelected
                      ]}>
                        {reportReason === reason.value && (
                          <View style={styles.radioButtonInner} />
                        )}
                      </View>
                      <Text style={[
                        styles.reasonText,
                        reportReason === reason.value && styles.reasonTextSelected
                      ]}>
                        {reason.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <TextInput
                  style={styles.descriptionInput}
                  placeholder="Additional details (optional)"
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={4}
                  value={reportDescription}
                  onChangeText={setReportDescription}
                  textAlignVertical="top"
                />

                <View style={styles.reportButtonsRow}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      setIsReportModalVisible(false);
                      setReportReason('');
                      setReportDescription('');
                    }}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.submitButton,
                      (!reportReason || isSubmittingReport) && styles.submitButtonDisabled
                    ]}
                    onPress={handleReportSubmit}
                    disabled={!reportReason || isSubmittingReport}
                  >
                    {isSubmittingReport ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Text style={styles.submitButtonText}>Submit Report</Text>
                    )}
                  </TouchableOpacity>
                </View>
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
  skeletonImage: {
  width: width,
  height: 250,
  backgroundColor: '#E8E4F3',
  overflow: 'hidden',
  position: 'absolute',
  top: 0,
  left: 0,
  zIndex: 1,
},
shimmer: {
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(255, 255, 255, 0.3)',
},
hiddenImage: {
  opacity: 0,
},
  chatDisabled: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  chatDisabledText: {
    color: '#9CA3AF',
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
    color: '#4F4F4F',
    lineHeight: 20,
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
  padding: 14,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: '#EBE7FF',
  marginBottom: 16,
},
profileImage: {
  width: 48,
  height: 48,
  borderRadius: 24,
  borderWidth: 2,
  borderColor: '#EBE7FF',
},
posterInfo: {
  flex: 1,
  marginLeft: 12,
  justifyContent: 'center',
},
posterNameRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 4,
},
posterName: {
  fontSize: 16,
  fontWeight: '600',
  color: '#333',
  lineHeight: 20, // Important for alignment
},
chevronContainer: {
  marginLeft: 4,
  justifyContent: 'center',
  alignItems: 'center',
  height: 20, // Match the text lineHeight
},
postedDateRow: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 4,
},
postedDate: {
  fontSize: 13,
  color: '#999',
  marginLeft: 2,
},
  // NEW: Report Modal Styles
  reportModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  reportModalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  reportTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  reportSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  reasonsContainer: {
    maxHeight: 300,
    marginBottom: 16,
  },
  reasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 10,
    backgroundColor: 'white',
  },
  reasonOptionSelected: {
    borderColor: '#7A5AF8',
    backgroundColor: '#F5F3FF',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: '#7A5AF8',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#7A5AF8',
  },
  reasonText: {
    fontSize: 15,
    color: '#333',
    flex: 1,
  },
  reasonTextSelected: {
    color: '#7A5AF8',
    fontWeight: '500',
  },
  descriptionInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    fontSize: 14,
    minHeight: 100,
    marginBottom: 16,
  },
  reportButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6B7280',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#FF6B6B',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#FCA5A5',
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
  },
  mapSection: {
  marginHorizontal: 14,
  marginBottom: 16,
},
mapTapHint: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#F5F3FF',
  paddingVertical: 8,
  paddingHorizontal: 12,
  borderRadius: 8,
  marginBottom: 10,
  borderWidth: 1,
  borderColor: '#EBE7FF',
},
mapTapHintText: {
  fontSize: 13,
  color: '#7A5AF8',
  marginLeft: 6,
  fontWeight: '500',
},
});

export default FlatHomeDetailsPage;