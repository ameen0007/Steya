import { router } from 'expo-router';
import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator 
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { showToast } from '@/services/ToastService';

const SharedRoomCard = ({ data, activeFilter, isFavorited, onToggleFavorite }) => {
  const [loading, setLoading] = useState(false);

  const id = data._id;

  // Toggle favorite - now calls parent function
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
  console.log("Data in card:", data?.individualDistance);

  return (
    <TouchableOpacity
      style={styles.cardWrapper}
      activeOpacity={0.8}
      onPress={() => {
        try {
          if (!id) {
           showToast("Missing ID");
            return;
          }
          router.push({
            pathname: "/shared/[id]",
            params: { id }
          });
        } catch (error) {
          console.error("Navigation error:", error);
         showToast("Navigation Failed");
        }
      }}
    >
      <View style={styles.cardContainer}>
        {/* Top image section */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: data?.thumbnail?.url }} style={styles.image} />
          
          {/* Top Overlay - Distance and Favorite */}
          <View style={styles.topOverlay}>
            <View style={styles.distanceBadge}>
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
            </View>

            {/* Favorite Button */}
            <TouchableOpacity 
              style={styles.favoriteButton}
              onPress={(e) => {
                e.stopPropagation();
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
          
          {/* Bottom Overlay - Category Badge */}
          {activeFilter === 'All' && (
            <View style={styles.bottomOverlay}>
              <View style={styles.categoryBadge}>
                <Ionicons name='people' size={16} color='#7A5AF8' />
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

          {/* Preferences row */}
          <View style={styles.preferencesContainer}>
            <View style={styles.roommateInfo}>
              <Text style={styles.needText}>Need</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{data?.roommatesWanted}</Text>
              </View>
              <View style={styles.genderBadge}>
                {data?.genderPreference === 'any' ?
                  <MaterialCommunityIcons color='#2D9596' size={16} name='gender-male-female'/> :
                  <Ionicons 
                    name={data?.genderPreference === 'female' ? 'female' : 'male'} 
                    size={16} 
                    color={data?.genderPreference === 'female' ? '#FF4081' : '#2196F3'} 
                  />
                }
                <Text style={[
                  styles.genderText,
                  { 
                    color: data?.genderPreference === 'any' 
                      ? '#2D9596' 
                      : data?.genderPreference === 'female' 
                      ? '#FF4081' 
                      : '#2196F3' 
                  }
                ]}>
                  {data?.genderPreference.charAt(0).toUpperCase() + data?.genderPreference.slice(1)}
                </Text>
              </View>
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

const styles = StyleSheet.create({
  cardWrapper: {
    marginHorizontal: 12,
    marginVertical: 8,
  },
  cardContainer: {
    backgroundColor: '#FBFAFF',
    borderWidth: 1,
    borderColor: '#EBE7FF',
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
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  distanceText: {
    color: '#333333',
    fontSize: 12,
    fontWeight: '600',
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
  contentContainer: {
    padding: 12,
    flex: 1,
    paddingBottom: 0
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
    color: '#212121',
    flex: 1,
    lineHeight: 22,
  },
  description: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
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
    justifyContent: 'center'
  },
  needText: {
    fontSize: 13,
    color: '#757575',
    paddingTop: 3
  },
  countBadge: {
    backgroundColor: '#F4F4F4',
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
    backgroundColor: '#F4F4F4',
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
    color: '#212121',
  },
  postedDate: {
    fontSize: 10,
    color: '#757575'
  },
});

export default SharedRoomCard;