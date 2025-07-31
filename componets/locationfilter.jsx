import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { FontAwesome5,MaterialCommunityIcons, Ionicons ,Entypo,FontAwesome6 } from '@expo/vector-icons';
import { useLocation } from '../context/LocationContext';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import FilterModal from '../componets/modalfilter';


export const LocationHeader = ({ setActiveFilter, activeFilter }) => {
  const { locationDetails } = useLocation();
  const filters = ['All', 'Shared Rooms', 'PG/Hostels', 'Rental Property'];
const [contentWidth, setContentWidth] = useState(0);
  const [scrollViewWidth, setScrollViewWidth] = useState(0);
  const isScrollable = contentWidth > scrollViewWidth;
  const displayText = locationDetails?.name || 'Select location';
const [appliedFilters, setAppliedFilters] = useState({});
const [activeCategory, setActiveCategory] = useState("shared");
 const [showModal, setShowModal] = useState(false);
 const [Onlyfilterdata , setOnlyfilterdata] = useState([]);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  const handleLocationPress = () => {
    router.push('/locationScreen');
  };

console.log(Onlyfilterdata, 'Onlyfilterdata');

   

  const getFilterIcon = (filterName) => {
    switch(filterName) {
      case 'Shared Rooms': return 'slideshare';
      case 'PG/Hostels': return 'business-sharp';
      case 'Rental Property': return 'home-city'; 
    }
  };

const handleApplyFilters = (filters) => {
  const cleaned = {};
  let count = 0;

  for (const key in filters) {
    const item = filters[key];

    if (item.selected) {
      count++;

      // For option-based filters
      if (item.options && Array.isArray(item.options)) {
        const selectedOptions = item.options
          .filter(opt => opt.selected)
          .map(opt => opt.label);

        if (selectedOptions.length) {
          cleaned[key] = selectedOptions;
        }
      }

      // For range-based filters
      else if ('currentMin' in item && 'currentMax' in item) {
        // Only include if user changed the range
        const isModified = item.currentMin !== item.min || item.currentMax !== item.max;

        if (isModified) {
          cleaned[key] = {
            min: item.currentMin,
            max: item.currentMax,
          };
        }
      }
    }
  }

  setAppliedFilters(filters); // Now you're storing only cleaned data
  setActiveFiltersCount(count);
  setOnlyfilterdata(cleaned);
  console.log("✅ Cleaned applied filters:", cleaned);
};





  const handlechangeFilter = (filter) => {
   setActiveFilter(filter)
    setAppliedFilters({}); // Reset applied filters when changing the main filter
    setActiveFiltersCount(0); // Reset active filters count
    setShowModal(false); // Close the modal when changing the main filter
  }
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
        <View style={styles.scrollWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScrollContent}
            onContentSizeChange={(w) => setContentWidth(w)}
            onLayout={(e) => setScrollViewWidth(e.nativeEvent.layout.width)}
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
              onPress={()=>handlechangeFilter(filter)}
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
         {isScrollable && (
            <LinearGradient
              colors={['rgba(255,255,255,0)', 'rgba(255,255,255,1)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientOverlay}
              pointerEvents="none"
            />
          )}
        </View>

      {activeFilter !== 'All' && 
        <View style={styles.filtermainbox}>
        <View style={styles.filterbox}>
          <TouchableOpacity   onPress={() => setShowModal(true)} style={styles.filterButton}>
            <View style={styles.insidemain}>
            <View style={styles.filtericons}>
            <Ionicons name="funnel" size={16} color="#fff" />
            </View>
           
         
 {activeFiltersCount > 0 && (
                  <Text style={styles.badgeText}>{activeFiltersCount}</Text>
                )}
            </View>
          </TouchableOpacity>
        </View>
        </View>
        }
            <FilterModal 
        visible={showModal}
        onClose={() => setShowModal(false)}
        activeFilter={activeFilter}
        onApplyFilters={handleApplyFilters}
        appliedFilters={appliedFilters}
      />
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
    paddingVertical: 5,
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
    //  padding:10
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  filterText: {
  fontSize: 12,
    color: '#212121',
    fontFamily: 'Poppinssm',
    fontWeight: '500',
    letterSpacing: 0.2,
    // fontFamily: 'Poppinssm',
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
  Width: 38,
    height: 35,
    borderRadius: 18,
 
    justifyContent: 'center',
    alignItems: 'center',
  
  },
  badgeContainer: {

  
    borderRadius: 10,
    // width: 18,
    // height: 18,
    justifyContent: 'center',
    alignItems: 'center',
   
    
  },
  badgeText: {
   marginLeft:4,
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
scrollWrapper: {
    flex: 1,
    position: 'relative',
   
  },
   filterContent: {
    flexDirection: 'row',
    alignItems: 'center', // This ensures vertical centering
    justifyContent: 'center',
  },
  gradientOverlay: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 30,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    position: 'relative',
  },
  filterIcon: {
    marginRight: 6,
  },
});










