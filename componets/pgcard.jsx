import { router } from 'expo-router';
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Platform } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const PGHostelCard = ({ data, activeFilter }) => {
  // Extract data or provide defaults

  const greybg = '#F4F4F4'
  const maintext = '#212121'
  const lighttext = '#757575'
  const mainbg = '#7A5AF8'


  const images = data.images && data.images.length > 0
    ? data.images
    : ["https://via.placeholder.com/300x200.png?text=No+Image"];

  const distance = data.distance || '2.5 km';
  const genderCategory = data.pgGenderCategory || 'ladies';
  const priceMin = data.priceRange?.min || 6000;
  const priceMax = data.priceRange?.max || 8000;
  const priceText = `₹${priceMin} - ₹${priceMax}`;
  const space = data.AvailableSpace
  const createdAt = data.createdAt;
  const postedDate = new Date(createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short", // You can use "long" for full month name
  });
    const id = data._id 
  return (
    <TouchableOpacity
      style={styles.cardWrapper}
      activeOpacity={0.8}

 onPress={() =>
  router.push({
  pathname: '/pg-hostel/[id]',
  params: { id }
})
}
    >
      <View style={styles.cardContainer}>
        {/* Top image section with distance and favorite button */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: images[0] }} style={styles.image} />
          <View style={styles.topOverlay}>

            <View style={styles.distanceBadge}>
              <Ionicons name="location-sharp" size={16} color="#7A5AF8" />
              <Text style={styles.distanceText}>{distance}</Text>
            </View>
            <TouchableOpacity style={styles.favoriteButton}>
              <Ionicons name="heart-outline" size={23} color="#FF4081" />
            </TouchableOpacity>

          </View>
        </View>

        {/* Content section */}
        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>{data.title}</Text>
            {
              activeFilter === 'All' && <View style={styles.categoryBadge}>
                <Ionicons
                  name='business-sharp'
                  size={16}
                  color='#7A5AF8'

                />
              </View>
            }

          </View>

          <Text style={styles.description} numberOfLines={2}>
            {data.description}
          </Text>

          {/* Gender and price info */}
          <View style={styles.infoContainer}>
            <View style={styles.genderContainer}>

              <View style={styles.firstinner} >
                <MaterialCommunityIcons
                  name={genderCategory === 'ladies' ? 'human-female' : 'human-male'}
                  size={16}
                  color={genderCategory === 'ladies' ? '#FF4081' : '#2196F3'}
                />
                <Text style={[
                  styles.genderText,
                  { color: genderCategory === 'ladies' ? '#FF4081' : '#2196F3' }
                ]}>
                  {genderCategory.charAt(0).toUpperCase() + genderCategory.slice(1)}
                </Text>

              </View>

              <View style={styles.innercon}>
                <MaterialCommunityIcons
                  name="bed"
                  size={19}
                  color="#7A5AF8"
                  style={{ marginRight: 3 }}
                />
                <Text style={{
                  //   color: maintext, 
                  //   // fontFamily: 'Poppins', 
                  //   fontWeight:'600',
                  //   fontSize: 14, 
                  marginRight: 4,
                  paddingTop: 2,
                  fontWeight: 'bold',
                  fontSize: 12,
                  color: '#444',

                }}>
                  {space}
                </Text>
                <Text style={{
                  fontSize: 12,
                  fontWeight: 'bold',
                  fontSize: 12,
                  paddingTop: 2,
                  color: '#444',

                }}>
                  Left
                </Text>
              </View>

            </View>



            <Text style={styles.price}>{priceText}</Text>
          </View>


        </View>
        
        <View style={styles.date}>
          <Text style={styles.postedDate}>{postedDate}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const greybg = '#F4F4F4';
const maintext = '#212121';
const lighttext = '#757575';
const mainbg = '#7A5AF8';

const styles = StyleSheet.create({
  cardWrapper: {
    marginHorizontal: 12,
    marginVertical: 8,
  },
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,

  },
  date: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 5,
    paddingRight: 15
  },
  postedDate: {
    fontFamily: 'Poppinssm',
    fontSize: 10,
    color: lighttext
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 24,
    backgroundColor: greybg,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  distanceText: {

    fontWeight: '600',
    marginLeft: 4,
    includeFontPadding: false,
    textAlignVertical: 'center',
    color: maintext
  },
  favoriteButton: {
    backgroundColor: greybg,
    padding: 4,
    borderRadius: 20,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 0
  },
  innercon: {
    backgroundColor: greybg,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
    flexDirection: 'row',      // Added this
    alignItems: 'center',      // Center vertically
    alignSelf: 'flex-start',
    marginLeft:7

    // Optional: keeps it as small as needed
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 17,

    flex: 1,
    fontWeight: 'bold',
    color: maintext,
  },
  categoryBadge: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    color: '#555',
    fontSize: 12,
    fontWeight: '500',
  },
  description: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
    fontFamily: 'Poppinsssm'
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,

  },
  genderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
   

  },
  firstinner:{
    flexDirection: 'row',
    backgroundColor: greybg,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 20,
  },
  genderText: {
    fontWeight: '500',
    marginLeft: 1,
    fontSize: 12
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: maintext,
  },
  typeContainer: {
    marginTop: 10,
    backgroundColor: '#EEE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  typeText: {
    fontSize: 12,
    color: '#555',
  }
});

export default PGHostelCard;