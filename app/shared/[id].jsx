import { useRef, useState, useEffect } from 'react';
import { ScrollView, TouchableOpacity, Text, View, Image, Modal, Dimensions, Platform, FlatList, StyleSheet, ActivityIndicator, Share, TextInput, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather, FontAwesome5, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

import SafeWrapper from '../../services/Safewrapper';
import { WebView } from 'react-native-webview';
const { width } = Dimensions.get('window');
import StaticMap from '../../componets/map';
import TopFadeGradient from '../../componets/topgradient';
import { StatusBar } from 'expo-status-bar';
import axios from 'axios';
import SkeletonLoader from '../../componets/individualloader';
const apiUrl = process.env.EXPO_PUBLIC_API_URL;

import api from '../../services/intercepter';
import { useDispatch, useSelector } from 'react-redux';
import { showToast } from '@/services/ToastService';
import { preventDoubleTap } from '@/services/debounfunc';
import { setLocationData } from '../Redux/LocationSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setUserData } from '../Redux/userSlice';
import { GoogleSignin, isSuccessResponse } from '@react-native-google-signin/google-signin';
import { initializePushNotifications } from '../../services/notificationHandler';
const DetailsPage = () => {
  console.log("✅ DetailsPage loaded");

  const { id } = useLocalSearchParams();
  console.log("📥 Received ID from route:", id);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);

  const router = useRouter();
  const modalFlatListRef = useRef(null);
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentImage, setCurrentImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [initialImageIndex, setInitialImageIndex] = useState(0);
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const user = useSelector((state) => state.user.userData);

  const dispatch = useDispatch();

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


const handleChatPress  = async () => {
  preventDoubleTap(async () => {
    console.log("Starting chat for product:", item._id);

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
          return; // Stop if user cancelled
        }

        const idToken = userInfo.data?.idToken;
        if (!idToken) {
          console.log("❌ No idToken found");
          return;
        }

        // Call backend for authentication
        console.log("🌐 Calling backend for authentication...");
        const res = await axios.post(`${apiUrl}/api/auth/google-login`, { idToken });

        // Save location if available
        if (res.data.user?.location) {
          console.log("📍 Setting location data");
          dispatch(setLocationData(res.data.user.location));
        }

        // Save auth token and user data
        await AsyncStorage.setItem("authToken", res.data.accessToken);
        await AsyncStorage.setItem("userId", res.data.user._id);
        dispatch(setUserData(res.data.user));

        console.log("✅ User authenticated successfully");

        // Initialize push notifications (non-blocking)
        initializePushNotifications(apiUrl)
          .then(pushToken => {
            if (pushToken) console.log("✅ Push notifications ready:", pushToken);
            else console.log("⚠️ Push notifications not available");
          })
          .catch(pushError => console.error("⚠️ Push setup error:", pushError.message));
      }

      // --------------------------
      // Step 2: Create/Check Chat Room
      // --------------------------
      setIsCreatingRoom(true);

      const checkResponse = await api.get(`${apiUrl}/api/chat/check-room`, {
        params: { productId: item._id }
      });

      let roomId;

      if (checkResponse.data.exists) {
        roomId = checkResponse.data.roomId;
        console.log("Using existing room:", roomId, "Status:", checkResponse.data.status);
      } else {
        const createResponse = await api.post(`${apiUrl}/api/chat/create-room`, {
          productId: item._id,
          productTitle: item.title || 'Product Chat',
          ownerId: item?.createdBy?._id
        });

        roomId = createResponse.data.roomId;
        console.log("Created new pending room:", roomId);
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
      setIsCreatingRoom(false);
    }
  });
};



  const handleBackPress = () => {
    router.back();
  };

  const toggleFavorite = async () => {
    if (isFavoriteLoading) return;

    try {
      setIsFavoriteLoading(true);
      console.log('🔄 Toggling favorite for room:', id);
      
      const response = await api.post(`${apiUrl}/api/toggle`, {
        roomId: id
      });

      console.log('✅ Favorite toggle response:', response.data);
      
      // ✅ FIXED: Handle both possible property names
      const newFavoriteStatus = response.data.isFavorited ?? response.data.isFavorite ?? false;
      setIsFavorite(newFavoriteStatus);
      
    } catch (error) {
      console.error('❌ Error toggling favorite:', error);
      console.error('❌ Error response:', error.response?.data);
      showToast('Error', 'Failed to update favorite status');
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: `Check out this room: ${item?.title}\n₹${item?.monthlyRent}/month\n\nView details: ${apiUrl}/room/${id}`,
        title: item?.title || 'Room Listing',
      });

      if (result.action === Share.sharedAction) {
        console.log('Shared successfully');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      showToast('Error', 'Failed to share');
    }
  };

  const handleReportSubmit = async () => {
    if (!reportReason) {
      showToast('Error', 'Please select a reason for reporting');
      return;
    }

    try {
      setIsSubmittingReport(true);
      const response = await api.post(`${apiUrl}/api/reports/report-room`, {
        roomId: id,
        reason: reportReason,
        description: reportDescription
      });

      showToast('Success', 'Room reported successfully. Our team will review it shortly.');
      setIsReportModalVisible(false);
      setReportReason('');
      setReportDescription('');
    } catch (error) {
      console.error('Error reporting room:', error);
      const errorMessage = error.response?.data?.message || 'Failed to report room';
      showToast('Error', errorMessage);
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const [modalCurrentImage, setModalCurrentImage] = useState(0);

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

  const transformedItem = {
    ...item,
    images: item?.images ? item.images.map(img => img.originalUrl) : [],
  };

  const reportReasons = [
    { value: 'spam', label: 'Spam or Scam' },
    { value: 'inappropriate', label: 'Inappropriate Content' },
    { value: 'misinformation', label: 'Misinformation' },
    { value: 'fake_listing', label: 'Fake Listing' },
    { value: 'already_rented', label: 'Already Rented' },
    { value: 'wrong_info', label: 'Wrong Information' },
    { value: 'other', label: 'Other' }
  ];
const makePhoneCall = (phoneNumber) => {
  if (!phoneNumber) return;

  // Remove everything except digits
  const cleanedNumber = phoneNumber.replace(/\D/g, '');

  Linking.openURL(`tel:${cleanedNumber}`)
    .catch((err) => console.error('Error opening dialer:', err));
};

  return (
    <>
      <StatusBar style="dark" />
      {loading || !item ? (
        <SkeletonLoader />
      ) : (
        <SafeWrapper>
          <ScrollView>
            <FlatList
              data={item?.images}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(img, index) => img?._id || index.toString()}
              onMomentumScrollEnd={(e) => {
                const index = Math.floor(e.nativeEvent.contentOffset.x / width);
                setCurrentImage(index);
              }}
              renderItem={({ item: img, index }) => (
                <View
                  style={{
                    width,
                    justifyContent: "center",
                    alignItems: "center"
                  }}
                >
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => openImageModal(index)}
                  >
                    <Image
                      source={{ uri: img.originalUrl }}
                      style={{ width, height: 250 }}
                      resizeMode="cover"
                    />
                    <TopFadeGradient />

                    <View
                      style={{
                        position: "absolute",
                        bottom: 10,
                        right: 10,
                        backgroundColor: "#0009",
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        borderRadius: 12
                      }}
                    >
                      <Text style={{ color: "white", fontSize: 12 }}>
                        {index + 1}/{item.images.length}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              )}
            />

            <View style={styles.container}>
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

              <View style={styles.descriptionContainer}>
                <Text style={styles.descriptionText}>{item?.description}</Text>
              </View>

              <Text style={styles.sectionTitle}>Room Details</Text>
              <View style={styles.detailsContainer}>
                <View style={styles.detailsRow}>
                  <View style={styles.detailBox}>
                    <View style={styles.iconCircle}>
                      <Ionicons name="home-outline" size={16} color="#ffffff" />
                    </View>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Room Type</Text>
                      <Text style={styles.detailValue}>{item?.category?.charAt(0).toUpperCase() + item?.category?.slice(1)}</Text>
                    </View>
                  </View>

                  <View style={styles.detailBox}>
                    <View style={styles.iconCircle}>
                      <MaterialCommunityIcons name="account-multiple-outline" size={16} color="#ffffff" />
                    </View>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Vacancy</Text>
                      <Text style={styles.detailValue}>{item?.roommatesWanted} Available</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.detailsRow}>
                  <View style={styles.detailBox}>
                    <View style={styles.iconCircle}>
                      <MaterialIcons name="person" size={16} color="#ffffff" />
                    </View>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Gender Pref</Text>
                      <Text style={styles.detailValue}>{item?.genderPreference?.charAt(0).toUpperCase() + item?.genderPreference?.slice(1)}</Text>
                    </View>
                  </View>

                  <View style={styles.detailBox}>
                    <View style={styles.iconCircle}>
                      <FontAwesome5 name="user-graduate" size={14} color="#ffffff" />
                    </View>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>For</Text>
                      <Text style={styles.detailValue}>
                        {item?.purpose?.map(p => p.charAt(0).toUpperCase() + p?.slice(1)).join(', ')}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.detailsRow}>
                  <View style={[styles.detailBox, { flex: 1 }]}>
                    <View style={styles.iconCircle}>
                      <MaterialCommunityIcons name="dumbbell" size={16} color="#ffffff" />
                    </View>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Habit Preferences</Text>
                      <Text style={styles.detailValue}>
                        {item?.habitPreferences?.map(h => h?.charAt(0).toUpperCase() + h?.slice(1)).join(', ')}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <Text style={styles.sectionTitle}>Posted By</Text>

              <View style={styles.postedByContainer}>
                <Image
                  source={{ uri: item?.createdBy?.picture }}
                  style={styles.profileImage}
                />
                <View style={styles.posterInfo}>
                  <Text style={styles.posterName}>{item?.createdBy?.name}</Text>
                  <Text style={styles.postedDate}>
                    {new Date(item.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: '2-digit',
                    })}
                  </Text>
                </View>
              </View>
            </View>

            {/* Action Buttons Row - Share & Report */}
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity onPress={handleShare} style={styles.actionButton}>
                <Feather name="share-2" size={20} color="#7A5AF8" />
                <Text style={styles.actionButtonText}>Share</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setIsReportModalVisible(true)}
                style={styles.actionButton}
              >
                <Feather name="flag" size={20} color="#FF6B6B" />
                <Text style={[styles.actionButtonText, { color: '#FF6B6B' }]}>Report</Text>
              </TouchableOpacity>
            </View>

            {/* Top Navigation */}
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

            {/* Top Right Actions - VERTICAL LAYOUT */}
            <View style={{
              position: 'absolute',
              top: 10,
              right: 10,
              zIndex: 10,
              flexDirection: 'column', // Changed to vertical
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

            <StaticMap
              latitude={item?.location?.coordinates[1]}
              longitude={item?.location?.coordinates[0]}
              placeName={item?.location?.fullAddress}
            />
          </ScrollView>

          {item.createdBy._id !== user?._id ? (
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

              <FlatList
                ref={modalFlatListRef}
                data={transformedItem.images}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                getItemLayout={getItemLayout}
                initialScrollIndex={modalCurrentImage}
                onMomentumScrollEnd={(event) => {
                  const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
                  setModalCurrentImage(newIndex);
                }}
                renderItem={({ item }) => (
                  <View style={{ width, justifyContent: "center", alignItems: "center" }}>
                    <Image source={{ uri: item }} style={{ width, height: 400 }} resizeMode="contain" />
                  </View>
                )}
                keyExtractor={(item, index) => index.toString()}
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
                  {modalCurrentImage + 1}/{transformedItem?.images?.length}
                </Text>
              </View>
            </View>
          </Modal>

          {/* Report Modal */}
          <Modal
            visible={isReportModalVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setIsReportModalVisible(false)}
          >
            <View style={styles.reportModalOverlay}>
              <View style={styles.reportModalContent}>
                <View style={styles.reportHeader}>
                  <Text style={styles.reportTitle}>Report Room</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  loadingText: {
    marginTop: 16,
    color: '#7A5AF8',
    fontSize: 16,
  },
  container: {
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
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#FBFAFF',
    marginHorizontal: 14,
    marginBottom: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EBE7FF',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  actionButtonText: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '500',
    color: '#7A5AF8',
  },
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
});

export default DetailsPage;