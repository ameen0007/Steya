import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { FontAwesome5, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useLocation } from '../context/LocationContext';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import FilterModal from '../componets/modalfilter';
import { useSelector } from 'react-redux';

export const LocationHeader = ({ 
  setActiveFilter, 
  activeFilter, 
  onApplyFilters, 
  appliedFilters // This comes from parent as prop
}) => {
  const user = useSelector((state) => state.user.userData);
  const filters = ['All', 'Shared Rooms', 'PG/Hostels', 'Rental Property'];
  const [contentWidth, setContentWidth] = useState(0);
  const [scrollViewWidth, setScrollViewWidth] = useState(0);
  const isScrollable = contentWidth > scrollViewWidth;
  
  // Remove this duplicate state declaration since we get it as prop
  // const [appliedFilters, setAppliedFilters] = useState({});
  
  const [activeCategory, setActiveCategory] = useState("shared");
  const [showModal, setShowModal] = useState(false);
  const [Onlyfilterdata, setOnlyfilterdata] = useState([]);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const locationData = useSelector((state) => state.location.locationData);

  const handleLocationPress = () => {
    console.log("--------in in press");
    router.push('/locationScreen');
  };

  const getFilterIcon = (filterName) => {
    switch(filterName) {
      case 'Shared Rooms': return 'people';
      case 'PG/Hostels': return 'business-sharp';
      case 'Rental Property': return 'home-city'; 
    }
  };

  // Updated handleApplyFilters function
  const handleApplyFilters = (filters) => {
    // Calculate active count for badge
    const activeCount = Object.values(filters).filter(filter => filter.selected).length;
    setActiveFiltersCount(activeCount);
    setOnlyfilterdata(filters); // Use this for local state if needed
    
    // Pass filters to parent component (HomeScreen)
    if (onApplyFilters) {
      onApplyFilters(filters);
    }
    
    console.log("✅ Applied filters:", filters);
  };

 // In LocationHeader component, replace the handlechangeFilter function:
// In LocationHeader component, fix the handlechangeFilter function:
const handlechangeFilter = (filter) => {
  // This should call the parent's handleFilterChange function
  if (setActiveFilter) {
    setActiveFilter(filter);
  }
};
  const hasNotification = true; // or from redux state

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.leftContainer} onPress={handleLocationPress}>
          <View style={styles.topRow}>
            <FontAwesome5 name="location-arrow" size={18} color="#7A5AF8" />
            <Text style={styles.locatingText}>Nearby rooms in...</Text>
          </View>
          <Text style={styles.addressText} numberOfLines={1}>
            {locationData.name}...
          </Text>
        </TouchableOpacity>

        <View style={styles.rightIcons}>
          <TouchableOpacity onPress={() => router.push('/favoritePage')} style={styles.iconButton}>
            <Ionicons name="heart-outline" size={24} color="#403f41" />
          </TouchableOpacity>
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
                  onPress={() => handlechangeFilter(filter)}
                >
                  <View style={styles.filterContent}>
                    {iconName && (
                      filter === 'Shared Rooms' ? (
                        <Ionicons 
                          name={iconName} 
                          size={16} 
                          color={activeFilter === filter ? '#fff' : '#7A5AF8'} 
                          style={styles.filterIcon}
                        />
                      ) : filter === 'Rental Property' ? (
                        <MaterialCommunityIcons 
                          name={iconName}
                          size={16}
                          color={activeFilter === filter ? '#fff' : '#6ED5D0'}
                          style={styles.filterIcon}
                        />
                      ) : (
                        <Ionicons 
                          name={iconName} 
                          size={16} 
                          color={activeFilter === filter ? '#fff' : '#FF6B6B'} 
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
              <TouchableOpacity onPress={() => setShowModal(true)} style={styles.filterButton}>
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
          appliedFilters={appliedFilters} // Pass the prop from parent
        />
      </View>
    </View>
  );
};

const greybg = '#FBFAFF';
const borderc = '#EBE7FF';

const styles = StyleSheet.create({
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
    fontSize: 13,
    color: '#757575',
    fontFamily: 'Poppinssm',
    letterSpacing: 0.4,
    marginTop: 4,
    textAlign: 'left',
    width: '83%',
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
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 5,
  },
  iconButton: {
    marginLeft: 15,
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
  insidemain: {
    flex: 1,
    flexDirection: "row",
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#7A5AF8',
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  filterText: {
    fontSize: 12,
    color: '#212121',
    fontFamily: 'Poppinssm',
    fontWeight: '500',
    letterSpacing: 0.2,
    marginTop: 3
  },
  selectedFilterText: {
    color: '#fff',
  },
  unselectedFilterText: {
    color: '#212121',
  },
  filtermainbox: {
    paddingLeft: 5
  },
  filterButton: {
    Width: 38,
    height: 35,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    marginLeft: 4,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientOverlay: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 30,
  },
  filterIcon: {
    marginRight: 6,
  },
});