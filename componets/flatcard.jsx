import { router } from 'expo-router';
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialIcons,MaterialCommunityIcons, FontAwesome5, FontAwesome6 } from '@expo/vector-icons';

const FlatHomeCard = ({ data, activeFilter }) => {
  // Extract data or provide defaults
    const id = data._id 
  return (
    <TouchableOpacity
      style={styles.cardWrapper}
onPress={() => router.push({
  pathname: '/RentalHomes/[id]',
  params: { id }
})}
      activeOpacity={0.8} 
    >
      <View style={styles.cardContainer}>
        {/* Top image section with distance and favorite button */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: data?.thumbnail?.url }} style={styles.image} />
          <View style={styles.topOverlay}>
            <View >
              {activeFilter === 'All' &&
                         <View style={styles.categoryBadge}>
                         <MaterialCommunityIcons name='home-city' size={16} color='#6ED5D0' /> 
                        </View>
                                    }
            </View>
            <TouchableOpacity style={styles.favoriteButton}>
              <Ionicons name="heart-outline" size={23} color="#FF4081" />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Content section */}
        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <Text numberOfLines={2} style={styles.title}>{data?.title}</Text>
   <Text style={styles.postedDate}>
          {new Date(data?.createdAt).toLocaleDateString("en-US", {
            month: "short", 
            day: "2-digit",
          })}
        </Text>
          </View>
          
          <Text style={styles.description} numberOfLines={2}>
            {data?.description}
          </Text>
          
          {/* Property details */}
          <View style={styles.detailsContainer}>
               
          <View style={styles.detailItem}>
              <MaterialIcons name="label" size={16} color="#7A5AF8" />
              <Text style={styles.detailText}>
              {data?.propertyType.charAt(0).toUpperCase() + data?.propertyType.slice(1)}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="bed" size={18} color="#7A5AF8" />
              <Text style={styles.detailText}>{data?.bedrooms} BR</Text>
            </View>
            
            <View style={styles.detailItem}>
              <FontAwesome6 name="bath" size={16} color="#7A5AF8" />
              <Text style={styles.detailText}>{data?.bathrooms} Bath</Text>
            </View>
         
          </View>
          
          {/* Tenant preference and price */}
          <View style={styles.bottomRow}>
            <View style={styles.tenantBadge}>

              
            {data?.tenantPreference === 'family' ? (
  <MaterialIcons name="family-restroom" size={18} color="#7A5AF8" />
) : (
  <FontAwesome6 name="people-group" size={17} color="#7A5AF8" />
)}

              <Text style={styles.tenantText}>
                {
                  data?.tenantPreference === 'family' ? 'Only For ' : 'For '
                }
                 {data?.tenantPreference.charAt(0).toUpperCase() + data?.tenantPreference.slice(1)}
              </Text>
            </View>
            
            <Text style={styles.price}>
  {data?.monthlyRent?.toLocaleString()}
</Text>

          </View>
          
        
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
    postedDate: {
    fontFamily: 'Poppinssm',
    fontSize: 10,
    color: lighttext
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
  },
  favoriteButton: {
    backgroundColor: greybg,
    padding: 4,
    borderRadius: 20,
  },
  contentContainer: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // alignItems: 'center',
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
    fontFamily:'Poppinsssm'
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 12,
  },
  detailItem: {
  
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    backgroundColor:greybg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  detailText: {
    fontSize: 12,
    color: '#444',
    fontWeight:'bold',
    marginLeft: 3,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tenantBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tenantText: {
    marginLeft: 6,
    fontWeight: 'bold',
    fontSize: 12,
    color: '#444',
  },
  price: {
    fontSize: 18,
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

export default FlatHomeCard;