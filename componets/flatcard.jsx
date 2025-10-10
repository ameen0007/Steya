import { router } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialIcons, MaterialCommunityIcons, FontAwesome5, FontAwesome6 } from '@expo/vector-icons';

const FlatHomeCard = ({ data, activeFilter, isFavorited, onToggleFavorite }) => {
  const [loading, setLoading] = useState(false);

  const id = data._id;

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
      onPress={() => router.push({
        pathname: '/RentalHomes/[id]',
        params: { id }
      })}
      activeOpacity={0.8}
    >
      <View style={styles.cardContainer}>
        {/* Top image section with overlays */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: data?.thumbnail?.url }} style={styles.image} />
          
          {/* Top Overlay - Location and Favorite */}
          <View style={styles.topOverlay}>
            {/* Location Badge - Left Top */}
            <View style={styles.distanceContainer}>
              <Ionicons name="location" size={14} color="#7A5AF8" />
          {data?.individualDistance && (
  data.individualDistance === '0 m' ? (
    <Text style={styles.distanceText}>10 meters</Text>
  ) : (
    <Text style={styles.distanceText}>
      {`Around ${data.individualDistance}`}
    </Text>
  )
)}

            </View>

            {/* Favorite Button - Right Top */}
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

          {/* Bottom Overlay - Category */}
          {activeFilter === 'All' && (
            <View style={styles.bottomOverlay}>
              <View style={styles.categoryBadge}>
                <MaterialCommunityIcons name='home-city' size={16} color='#6ED5D0' />
              </View>
            </View>
          )}
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
              ₹{data?.monthlyRent?.toLocaleString()}
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
    alignItems: 'flex-start',
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingBottom: 8,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    height: 24,
    paddingHorizontal: 8,
    borderRadius: 12,
    gap: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    marginTop: 8,
    marginLeft: 8,
  },
  distanceText: {
    color: '#333333',
    fontSize: 12,
    fontWeight: '600',
  },
  categoryBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
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
    marginTop: 8,
    marginRight: 8,
  },
  contentContainer: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontSize: 17,
    flex: 1,
    fontWeight: 'bold',
    color: maintext,
  },
  description: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
    fontFamily: 'Poppinsssm'
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
    backgroundColor: greybg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  detailText: {
    fontSize: 12,
    color: '#444',
    fontWeight: 'bold',
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
});

export default FlatHomeCard;