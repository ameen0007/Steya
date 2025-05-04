import React, { useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useLocation } from '../context/LocationContext';
import { router } from 'expo-router';

export const LocationHeader = () => {
  const [activeFilter, setActiveFilter] = React.useState('All');
  const { locationDetails } = useLocation();
  const filters = ['All', 'Shared Room', 'PG/Hostel', 'Rental/Home/Flats'];

  // Get display text directly from context
  const displayText = locationDetails?.name || 'Select location';

console.log(displayText,"displayText");

  // Handle location press
  const handleLocationPress = () => {
    router.push('/locationScreen');
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity 
          style={styles.leftContainer}
          onPress={handleLocationPress}
        >
          <View style={styles.topRow}>
            <FontAwesome5 name="location-arrow" size={18} color="#7A5AF8" />
            <Text style={styles.locatingText}>Locating...</Text>
          </View>
          <Text style={styles.addressText} numberOfLines={1}>
            {displayText}...
          </Text>
        </TouchableOpacity>

        {/* Right side - Profile icon */}
        <View style={styles.profileIcon}>
          <Ionicons name="person-circle-outline" size={45} color="#282C3F" />
        </View>
      </View>

      <View style={styles.filterContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScrollContent}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterPill,
                activeFilter === filter ? styles.selectedFilter : styles.unselectedFilter,
              ]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter === filter ? styles.selectedFilterText : styles.unselectedFilterText,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={styles.filterbox}>
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="funnel" size={18} color="#fff" />
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>2</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
   

    borderRadius:20
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
   
 
  },
  
  leftContainer: {
    flex: 1,
    justifyContent: 'center',
    marginLeft:5
  },
  
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  locatingText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 7,
    fontFamily:'Poppins'
  },
  
  addressText: {
    fontSize: 14,
    color: '#666',
    fontFamily:'Poppinsssm',
  letterSpacing:0.4,
    marginTop: 4,
    textAlign:'left',
    width:'83%'
  },
  
  profileIcon: {
   marginLeftL:20,
   
    marginRight:-5
  },
  
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  
  },
  filtersScrollContent: {
    paddingRight: 10,
    // Initially show only 3 filters
    paddingLeft: 0,
    
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    marginRight: 8,

   
  },
  selectedFilter: {
    backgroundColor: '#7A5AF8',
   
    
  },
  filterbox:{
    paddingLeft:9,
  },
  unselectedFilter: {
    backgroundColor: '#F3F2FE',
  },
  filterText: {
    fontSize: 13,
    fontFamily:'Poppinssm'
  },
  selectedFilterText: {
    color: '#ffff',
  },
  unselectedFilterText: {
    color: '#333',
  },
  filterButton: {
    backgroundColor: '#7A5AF8',
    width: 38,
    height: 37,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    
  },
  badgeContainer: {
    position: 'absolute',
    top: -4,
    right: -5,
    backgroundColor: '#F3F2FE',
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#7A5AF8',
  },
  badgeText: {
    top:-1,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#7A5AF8',
  },
});
