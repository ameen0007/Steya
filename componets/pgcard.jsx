import { router } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const PGHostelCard = ({ data, activeFilter, isFavorited, onToggleFavorite }) => {
  const [loading, setLoading] = useState(false);

  const greybg = '#F4F4F4'
  const maintext = '#212121'
  const lighttext = '#757575'
  const mainbg = '#7A5AF8'

  const id = data._id 

  // Toggle favorite - calls parent function
  const toggleFavorite = async () => {
    try {
      setLoading(true);
      await onToggleFavorite(id);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setLoading(false);
    }
  };

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
          <Image source={{ uri: data?.thumbnail?.url }} style={styles.image} />
          <View style={styles.topOverlay}>

            <View style={styles.distanceBadge}>
              {activeFilter === 'All' &&
                <View style={styles.categoryBadge}>
                  <Ionicons name='business-sharp' size={16} color='#FF6B6B' /> 
                </View>
              }
            </View> 

            {/* Favorite Button */}
            <TouchableOpacity 
              style={styles.favoriteButton}
              onPress={(e) => {
                e.stopPropagation(); // Prevent card navigation
                toggleFavorite();
              }}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FF4081" />
              ) : (
                <Ionicons 
                  name={isFavorited ? "heart" : "heart-outline"} 
                  size={23} 
                  color={isFavorited ? "#FF4081" : "#FF4081"} 
                />
              )}
            </TouchableOpacity>

          </View>
        </View>

        {/* Content section */}
        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>{data?.title}</Text>
            <View style={styles.date}>
              <Text style={styles.postedDate}>
                {new Date(data?.createdAt).toLocaleDateString("en-US", {
                  month: "short", 
                  day: "2-digit",
                })}
              </Text>
            </View>
          </View>

          <Text style={styles.description} numberOfLines={2}>
            {data?.description}
          </Text>

          {/* Gender and price info */}
          <View style={styles.infoContainer}>
            <View style={styles.genderContainer}>

              <View style={styles.firstinner} >
                <MaterialCommunityIcons
                  name={data?.pgGenderCategory === 'ladies' ? 'human-female' : 'human-male'}
                  size={16}
                  color={data?.pgGenderCategory === 'ladies' ? '#FF4081' : '#2196F3'}
                />
                <Text style={[
                  styles.genderText,
                  { color: data?.pgGenderCategory === 'ladies' ? '#FF4081' : '#2196F3' }
                ]}>
                  {data?.pgGenderCategory?.charAt(0).toUpperCase() + data?.pgGenderCategory?.slice(1)}
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
                  marginRight: 4,
                  paddingTop: 2,
                  fontWeight: 'bold',
                  fontSize: 12,
                  color: '#444',
                }}>
                  {data?.availableSpace}
                </Text>
                <Text style={{
                  fontSize: 12,
                  fontWeight: 'bold',
                  paddingTop: 2,
                  color: '#444',
                }}>
                  Left
                </Text>
              </View>

            </View>

            <Text style={styles.price}>
              {data.priceRange && data.priceRange.min != null && data.priceRange.max != null
                ? `₹${data.priceRange.min.toLocaleString()} - ₹${data.priceRange.max.toLocaleString()}`
                : "₹0 - ₹0"}
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
  date: {},
  postedDate: {
    fontFamily: 'Poppinssm',
    fontSize: 10,
    color: lighttext
  },
  favoriteButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 10
  },
  innercon: {
    backgroundColor: greybg,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginLeft: 7
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 5
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
    borderRadius: 100,
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
  firstinner: {
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