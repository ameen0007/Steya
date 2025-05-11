import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { FontAwesome5,MaterialCommunityIcons, Ionicons ,Entypo,FontAwesome6 } from '@expo/vector-icons';
import { useLocation } from '../context/LocationContext';
import { router } from 'expo-router';

export const LocationHeader = ({ setActiveFilter, activeFilter }) => {
  const { locationDetails } = useLocation();
  const filters = ['All', 'Shared Rooms', 'PG/Hostels', 'Rental Property'];

  const displayText = locationDetails?.name || 'Select location';

  const handleLocationPress = () => {
    router.push('/locationScreen');
  };


  const getFilterIcon = (filterName) => {
    switch(filterName) {
      case 'Shared Rooms': return 'slideshare';
      case 'PG/Hostels': return 'business-sharp';
      case 'Rental Property': return 'home-city'; 
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.leftContainer} onPress={handleLocationPress}>
          <View style={styles.topRow}>
            <FontAwesome5 name="location-arrow" size={18} color="#7A5AF8" />
            <Text style={styles.locatingText}>Locating...</Text>
          </View>
          <Text style={styles.addressText} numberOfLines={1}>
            {displayText}...
          </Text>
        </TouchableOpacity>

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
          {filters.map((filter) => {
            const iconName = getFilterIcon(filter);
            return (
              <TouchableOpacity
              key={filter}
              style={[
                styles.filterPill,
                activeFilter === filter ? styles.selectedFilter : styles.unselectedFilter,
              ]}
              onPress={() => setActiveFilter(filter)}
            >
              <View style={styles.filterContent}>
              {iconName && (
  filter === 'Shared Rooms' ? (
    <Entypo 
      name={iconName} 
      size={16} 
      color={activeFilter === filter ? '#fff' : '#7A5AF8'} 
      style={styles.filterIcon}
    />
  ) : filter === 'Rental Property' ? (
    <MaterialCommunityIcons 
      name={iconName}
      size={16}
      color={activeFilter === filter ? '#fff' : '#7A5AF8'}
      style={styles.filterIcon}
    />
  ) : (
    <Ionicons 
      name={iconName} 
      size={16} 
      color={activeFilter === filter ? '#fff' : '#7A5AF8'} 
      style={styles.filterIcon}
    />
  )
)}
                <Text style={[
                  styles.filterText,
                  activeFilter === filter ? styles.selectedFilterText : styles.unselectedFilterText,
                ]}>
                  {filter}
                </Text>
              </View>
            </TouchableOpacity>
            );
          })}
        </ScrollView>
        <View style={styles.filtermainbox}>
        <View style={styles.filterbox}>
          <TouchableOpacity style={styles.filterButton}>
            <View style={styles.insidemain}>
            <View style={styles.filtericons}>
            <Ionicons name="funnel" size={18} color="#fff" />
            </View>
           
         
            <Text style={styles.badgeText}>2</Text>  
          
            </View>
          </TouchableOpacity>
        </View>
        </View>
      </View>
    </View>
  );
};
const greybg = '#FBFAFF';
const borderc ='#EBE7FF'
const styles = StyleSheet.create({

// Keep all existing styles the same
  container: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    borderRadius: 20,
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
    marginLeft: 5,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locatingText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#212121',
    marginLeft: 7,
    fontFamily: 'Poppins',
  },
  addressText: {
    fontSize: 12,
    color: '#757575',
    fontFamily: 'Poppinssm',
    letterSpacing: 0.4,
    marginTop: 4,
    textAlign: 'left',
    width: '83%',
  },
  profileIcon: {
    marginLeft: 20,
    marginRight: -5,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  filtersScrollContent: {
    paddingRight: 10,
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
  unselectedFilter: {
    backgroundColor: greybg,
    borderWidth: 1,
    borderColor: borderc,
 
 
  },
  insidemain:{
    flex:1,
  //  paddingHorizontal:5,
    flexDirection:"row",
    justifyContent:'center',
    alignItems:'center',
     backgroundColor: '#7A5AF8',
     borderRadius: 100,
     padding:10
  },
  filterText: {
    fontSize: 13,
    fontFamily: 'Poppins',
    marginTop:3
  },
  selectedFilterText: {
    color: '#fff',
  },
  filtericons:{
  
  },
  unselectedFilterText: {
    color: '#212121',
  },
  filtermainbox:{
  
    paddingLeft:5
  },
  filterButton: {
    // backgroundColor: '#7A5AF8',
    minWidth: 38,
    height: 37,
    borderRadius: 18,
 
    justifyContent: 'center',
    alignItems: 'center',
  
  },
  badgeContainer: {

  
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
   
    
  },
  badgeText: {
   marginLeft:4,
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  // Add these new styles
  filterContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:'center',

  },
  filterIcon: {
    marginRight: 6,
  },
});










