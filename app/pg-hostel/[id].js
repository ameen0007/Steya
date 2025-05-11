import { useRef, useState, useEffect } from 'react';
import { ScrollView, TouchableOpacity, Text, View, Image, Modal, Dimensions, Platform, FlatList, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather, FontAwesome5, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import SafeWrapper from '../../services/Safewrapper'; // Adjust this path if needed
import TopFadeGradient from '../../componets/topgradient';
const { width } = Dimensions.get('window');

import { dummyListings } from '../../services/dummyListings';
import  StaticMap  from '../../componets/map'; 
export default function PgHostelDetails() {
  const { id } = useLocalSearchParams();
  const item = dummyListings.find((item) => item._id === id);
  const router = useRouter();
  const modalFlatListRef = useRef(null);
  const [currentImage, setCurrentImage] = useState(0);
  const [modalCurrentImage, setModalCurrentImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [initialImageIndex, setInitialImageIndex] = useState(0);
  
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

  const formatAmenity = (amenity) => {
    const words = amenity.split('_');
    return words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <SafeWrapper>
      <ScrollView>
        {/* Image Carousel */}
        <FlatList
          data={item.images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(imageUrl, index) => index.toString()}
          onMomentumScrollEnd={(e) => {
            const index = Math.floor(e.nativeEvent.contentOffset.x / width);
            setCurrentImage(index);
          }}
          renderItem={({ item: imageUrl, index }) => (
            <View style={{ width, justifyContent: 'center', alignItems: 'center' }}>
              <TouchableOpacity activeOpacity={0.9} onPress={() => openImageModal(index)}>
              <TopFadeGradient /> 
                <Image source={{ uri: imageUrl }} style={{ width, height: 250 }} resizeMode="cover" />
              
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
                    {index === currentImage ? currentImage + 1 : index + 1}/{item.images.length}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
        />

        {/* PG Info */}
        <View style={styles.container}>
  {/* Title and Price Row */}
  <View style={styles.rowBetween}>
  <View style={styles.priceContainer}>
      <Text style={styles.priceText}>
        ₹{item.priceRange.min} - ₹{item.priceRange.max}
      </Text>
    </View>
  <View style={styles.locationContainer}>
    <Ionicons name="location-sharp" size={16} color="#7A5AF8" />
    <Text numberOfLines={1} style={styles.locationText}>{item.location.fullAddress}</Text>
  </View>
  
  
  </View>
  <Text style={styles.title}>{item.title}</Text>
  {/* Location */}
 

  {/* Description */}
  <View style={styles.descriptionContainer}>
    <Text style={styles.descriptionText}>{item.description}</Text>
  </View>

  {/* Details Section */}
  <Text style={styles.sectionTitle}>PG/Hostel Details</Text>
  <View style={styles.detailsContainer}>
    {/* Gender Category */}
    <View style={styles.detailsRow}>
      <View style={styles.detailBox}>
        <View style={styles.iconCircle}>
          <MaterialIcons name="people" size={16} color="#ffffff" />
        </View>
        <View style={styles.detailContent}>
          <Text style={styles.detailLabel}>Category</Text>
          <Text style={styles.detailValue}>
            {item.pgGenderCategory === 'ladies' ? 'Ladies Only' : 
             item.pgGenderCategory === 'gents' ? 'Gents Only' : 'Co-ed'}
          </Text>
        </View>
      </View>

      {/* Available Space */}
      <View style={styles.detailBox}>
        <View style={styles.iconCircle}>
          <MaterialIcons name="hotel" size={16} color="#ffffff" />
        </View>
        <View style={styles.detailContent}>
          <Text style={styles.detailLabel}>Available</Text>
          <Text style={styles.detailValue}>{item.AvailableSpace} Beds</Text>
        </View>
      </View>
    </View>

    {/* Room Types */}
    <View style={styles.detailsRow}>
      <View style={styles.detailBox}>
        <View style={styles.iconCircle}>
          <MaterialIcons name="meeting-room" size={16} color="#ffffff" />
        </View>
        <View style={styles.detailContent}>
          <Text style={styles.detailLabel}>Room Types</Text>
          <Text style={styles.detailValue}>
            {item.roomTypesAvailable.map(type => 
              type.charAt(0).toUpperCase() + type.slice(1)).join(', ')}
          </Text>
        </View>
      </View>

      {/* Meals */}
      <View style={styles.detailBox}>
        <View style={styles.iconCircle}>
          <MaterialIcons name="restaurant" size={16} color="#ffffff" />
        </View>
        <View style={styles.detailContent}>
          <Text style={styles.detailLabel}>Meals Included</Text>
          <Text style={styles.detailValue}>
            {item.mealsProvided.map(meal => 
              meal.charAt(0).toUpperCase() + meal.slice(1)).join(', ')}
          </Text>
        </View>
      </View>
    </View>

    {/* Amenities */}
    <View style={styles.detailsRow}>
      <View style={[styles.detailBox, { flex: 1 }]}>
        <View style={styles.iconCircle}>
          <MaterialIcons name="miscellaneous-services" size={16} color="#ffffff" />
        </View>
        <View style={styles.detailContent}>
          <Text style={styles.detailLabel}>Amenities</Text>
          <Text style={styles.detailValue}>
            {item.amenities.map(amenity => 
              formatAmenity(amenity)).join(', ')}
          </Text>
        </View>
      </View>
    </View>
  </View>

  {/* Rules Section */}
{/* Rules Section */}
<Text style={styles.sectionTitle}>PG/Hostel Rules</Text>
<View style={styles.detailsContainer}>
  {item.rules.map((rule, index) => {
    // Only create new row for even indexes
    if (index % 2 === 0) {
      return (
        <View style={styles.detailsRow} key={index}>
          {/* First Rule in row */}
          <View style={styles.detailBox}>
            <View style={styles.iconCircle}>
              <MaterialIcons name="info" size={16} color="#ffffff" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Rule {index + 1}</Text>
              <Text style={styles.detailValue}>
                {rule === 'no_late_entry' ? 'No Late Entry After 10 PM' : 
                rule.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Text>
            </View>
          </View>

          {/* Second Rule in row if exists */}
          {item.rules[index + 1] && (
            <View style={styles.detailBox}>
              <View style={styles.iconCircle}>
                <MaterialIcons name="info" size={16} color="#ffffff" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Rule {index + 2}</Text>
                <Text style={styles.detailValue}>
                  {item.rules[index + 1] === 'no_late_entry' ? 'No Late Entry After 10 PM' : 
                  item.rules[index + 1].replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Text>
              </View>
            </View>
          )}
        </View>
      );
    }
    return null;
  })}
</View>

  {/* Posted By Section */}
  <Text style={styles.sectionTitle}>Posted By</Text>
  <View style={styles.postedByContainer}>
    <Image 
      source={{ uri: item.postedBy.profileImage }} 
      style={styles.profileImage} 
    />
    <View style={styles.posterInfo}>
      <Text style={styles.posterName}>{item.postedBy.name}</Text>
      <Text style={styles.postedDate}>
        Posted on {format(new Date(item.createdAt), 'dd MMM yyyy')}
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
            <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={25} color={isFavorite ? "#FF4081" : 'white'}/> 
          </TouchableOpacity>
        </View>
        <StaticMap latitude={item?.location?.latitude} longitude={item?.location?.longitude} />
      </ScrollView>

      {/* Bottom Buttons */}
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
      flexDirection: 'row', // horizontal
      backgroundColor: '#7A5AF8',
      padding: 14,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center', // center both icon and text
      marginRight: 10
    }}
    onPress={() => console.log('Chat clicked')}
  >
    <Feather name="message-circle" size={20} color="white" />
    <Text style={{ color: 'white', marginLeft: 8 }}>Chat</Text>
  </TouchableOpacity>

  <TouchableOpacity
    disabled={!item.showPhonePublic}
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
            data={item.images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            getItemLayout={getItemLayout}
            initialScrollIndex={modalCurrentImage}
            onMomentumScrollEnd={(event) => {
              const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
              setModalCurrentImage(newIndex); // Update the modal's current image index
            }}
            renderItem={({ item, index }) => (
              <View style={{ width, justifyContent: 'center', alignItems: 'center' }}>
                <Image source={{ uri: item }} style={{ width, height: 400 }} resizeMode="contain" />
              </View>
            )}
            keyExtractor={(item, index) => index.toString()}
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
              {modalCurrentImage + 1}/{item.images?.length}
            </Text>
          </View> 
        </View>
      </Modal>
    </SafeWrapper>
  );
}
const greybg = '#FBFAFF';
const maintext = '#212121';
const lighttext = '#757575';
const mainbg = '#7A5AF8';
const styles = StyleSheet.create({
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