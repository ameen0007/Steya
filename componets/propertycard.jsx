import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const PropertyCard = ({ property }) => {
  const {
    image,
    distance,
    name,
    description,
    tags,
    price,
    needsCount,
    peopleType,
    isFavorite,
    type,
  } = property;

  return (
    <View style={styles.cardContainer}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: image }} style={styles.image} />
        
        {/* Distance badge */}
        <View style={styles.distanceBadge}>
          <Ionicons name="location" size={16} color="white" />
          <Text style={styles.distanceText}>{distance}</Text>
        </View>
        
        {/* Favorite button */}
        <TouchableOpacity style={styles.favoriteButton}>
          <Ionicons 
            name={isFavorite ? "heart" : "heart-outline"} 
            size={24} 
            color={isFavorite ? "#ff4785" : "white"} 
          />
        </TouchableOpacity>
        
        {/* People info */}
        <View style={styles.peopleInfoContainer}>
          <View style={styles.needsContainer}>
            <Text style={styles.needsText}>Need</Text>
            <Text style={styles.needsCountText}>{needsCount}</Text>
          </View>
          <View style={styles.peopleTypeContainer}>
            <Ionicons name={peopleType === 'Female' ? 'female' : 'male'} size={16} color={peopleType === 'Female' ? '#ff4785' : '#4785ff'} />
            <Text style={[styles.peopleTypeText, { color: peopleType === 'Female' ? '#ff4785' : '#4785ff' }]}>{peopleType}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.infoContainer}>
        <View style={styles.titleContainer}>
          <Text style={styles.nameText}>{name}</Text>
          <View style={styles.typeContainer}>
            <Text style={styles.typeText}>{type}</Text>
          </View>
        </View>
        <Text style={styles.descriptionText} numberOfLines={2}>{description}</Text>
        
        <View style={styles.bottomContainer}>
          <View style={styles.tagsContainer}>
            {tags.map((tag, index) => (
              <View key={index} style={styles.tagPill}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.priceText}>${price}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#F3F2FE',
    borderRadius: 16,
    marginVertical: 10,
    marginHorizontal: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    
  },
  imageContainer: {
    height: 180,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  distanceBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(108, 92, 231, 0.9)',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  distanceText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 18,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  peopleInfoContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    overflow: 'hidden',
  },
  needsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  needsText: {
    fontSize: 12,
    color: '#666',
  },
  needsCountText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 4,
  },
  peopleTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  peopleTypeText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  infoContainer: {
    padding: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  nameText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  typeContainer: {
    backgroundColor: 'white',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    // borderStartWidth:2,
    // borderColor:'#7A5AF8'
  },
  typeText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  bottomContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
  },
  tagPill: {
    backgroundColor: '#6c5ce7',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  tagText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
});

