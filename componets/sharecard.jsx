import { router } from 'expo-router';
import React, { use, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Entypo,MaterialCommunityIcons, FontAwesome, Ionicons } from '@expo/vector-icons';

const SharedRoomCard = ({ data, activeFilter }) => {
  // Extract data or provide defaults
  const images = data.images && data.images.length > 0 
    ? data.images 
    : ["https://via.placeholder.com/300x200.png?text=No+Image"];
  
  const distance = data.km || '2.5 km';
  const roommates = data.roommatesWanted || 1;
  const gender = data.genderPreference || 'male';
  const habits = data.habitPreferences || [];
  const price = data.monthlyRent;
  const createdAt = data.createdAt;
const postedDate = new Date(createdAt).toLocaleDateString("en-IN", {
  day: "numeric",
  month: "short", // You can use "long" for full month name
});
// console.log(gender,"gender");
// useEffect(() => {
//   router.push('/pg-hostel/4')}, [])
  const id = data._id 
  return (
    <TouchableOpacity
      style={styles.cardWrapper}
      activeOpacity={0.8} 
onPress={() => {
  try {
    if (!id) {
      console.warn("ID is missing");
      Alert.alert("Missing ID", "No ID was found for this item.");
      return;
    }
    
    console.log(`Attempting to navigate to /shared/${id}`);
    
    // Log the pathname and params for debugging
    const navigationParams = {
      pathname: "/shared/[id]",
      params: { id }
    };
    console.log("Navigation params:", JSON.stringify(navigationParams));

    // Debug the router.push attempt
    console.log("Calling router.push()...");
    router.push(navigationParams);
    console.log("router.push() called successfully");

  } catch (error) {
    // Detailed error logging
    console.error("Navigation error:", error);
    console.error("Error stack:", error?.stack);

    // Show detailed alert
    Alert.alert(
      "Navigation Failed",
      `Unable to open the detail page.\n\nPath: /shared/${id}\nError: ${error?.message || String(error)}`,
      [
        {
          text: "OK",
          style: "cancel"
        },
        {
          text: "Try Alternate Route",
          onPress: () => {
            // Fallback navigation attempt with direct string path
            try {
              console.log("Attempting fallback navigation...");
              router.push(`/shared/${id}`);
            } catch (fallbackError) {
              console.error("Fallback navigation failed:", fallbackError);
              Alert.alert("Fallback Failed", String(fallbackError));
            }
          }
        }
      ]
    );
  }
}}

    >
      <View style={styles.cardContainer}>
        {/* Top image section */}
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
            <Text numberOfLines={2} style={styles.title}>{data.title}</Text>
            {activeFilter === 'All' &&
 <View style={styles.categoryBadge}>
 <Entypo name='slideshare' size={16} color='#7A5AF8' />
</View>
            }
           
          </View>

          <Text style={styles.description} numberOfLines={2}>
            {data.description}
          </Text>

          {/* Preferences row */}
          <View style={styles.preferencesContainer}>
            <View style={styles.roommateInfo}>
              <Text style={styles.needText}>Need</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{roommates}</Text>
              </View>
              <View style={styles.genderBadge}>
                {gender === 'any' ?
                <MaterialCommunityIcons color='#2D9596'  size={16}  name='gender-male-female'/>  :
               
   <Ionicons 
   name={gender === 'female' ? 'female' : 'male'} 
   size={16} 
   color={gender === 'female' ? '#FF4081' : '#2196F3'} 
 />
                }
             
                <Text
                
                style={[
                  styles.genderText,
                  { 
                    color: gender === 'any' 
                      ? '#2D9596' 
                      : gender === 'female' 
                      ? '#FF4081' 
                      : '#2196F3' 
                  }
                ]}>

                  {gender.charAt(0).toUpperCase() + gender.slice(1)}
                </Text>
              </View>
            </View>
            <Text style={styles.price}>₹{price}</Text>
   
          </View>

        
        </View>
        <View style={styles.date}>
  <Text  style={styles.postedDate}>{postedDate}</Text>
</View>
      </View>
    </TouchableOpacity>
  );
};

// Color constants
const greybg = '#F4F4F4';
const maintext = '#212121';
const lighttext = '#757575';
const mainbg = '#7A5AF8';
const borderc ='#EBE7FF'

const styles = StyleSheet.create({
  cardWrapper: {
    marginHorizontal: 12,
    marginVertical: 8,
  
  },
  cardContainer: {
    backgroundColor:  '#FBFAFF',
    borderWidth: 1,
    borderColor: borderc,

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
    paddingHorizontal: 10,
    paddingVertical: 8,
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
    color: maintext,
    fontWeight: '600',
    marginLeft: 4,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  date:{
     flex:1,
justifyContent:'flex-start',
alignItems:'flex-end',
paddingTop:5,
paddingRight:15
    },
    postedDate:{
    fontFamily:'Poppinssm',
    fontSize:10,
    color: lighttext
    },
  favoriteButton: {
    backgroundColor: greybg,
    padding: 4,
    borderRadius: 20,
  },
  contentContainer: {
    padding: 12,
    flex: 1,
    paddingBottom:0
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: 'bold',
    color: maintext,
    flex: 1,
    lineHeight: 22,
    includeFontPadding: false,
  },
  categoryBadge: {
    backgroundColor: greybg,
    padding: 8,
    borderRadius: 20,
    marginLeft: 8,
  },
  description: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
    fontFamily:'Poppinsssm'
    // fontSize: 12,
    // color: lighttext,
    // marginBottom: 10,
    // lineHeight: 16,
  },
  preferencesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
 

  },
  roommateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  
    justifyContent:'center'
  },
  needText: {
    fontSize: 13,
    color: lighttext,
    fontFamily:'Poppins',
    paddingTop:3
  },
  countBadge: {
    backgroundColor: greybg,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  countText: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  genderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: greybg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  genderText: {
    fontWeight: '500',
    fontSize: 14,
  },
  price: {
    fontSize: 17,
    fontWeight: 'bold',
    color: maintext,

  },
  habitsScrollView: {
    marginTop: 8,
    maxHeight: 32,
  },
  habitsContentContainer: {
    gap: 8,
    paddingRight: 16,
  },

  habitText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default SharedRoomCard;