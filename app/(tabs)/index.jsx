// Example usage in HomeScreen.js
import React, { useState, useEffect } from 'react';
import { FlatList, View } from 'react-native';
import { LocationHeader } from '../../componets/locationfilter'; // Filter at the top
import SharedCard from '../../componets/sharecard'; // Cards for Shared Room
import PGCard from '../../componets/pgcard'; // Cards for PG/Hostel
import FlatCard from '../../componets/flatcard'; // Cards for Flats/Home
import SafeWrapper from '../../services/Safewrapper';
import { dummyListings } from '../../services/dummyListings'; 
import { StatusBar } from 'expo-status-bar';

const filterMap = {
  "All": "all",
  "Shared Rooms": "shared",
  "PG/Hostels": "pg_hostel",
  "Rental Property": "flat_home"
};

const HomeScreen = () => {
  const [activeFilter, setActiveFilter] = useState('All'); // Default is 'All'
  const [filterParams, setFilterParams] = useState({});

  const filteredListings = dummyListings.filter((listing) => {
    // First filter by category
    const selectedCategory = filterMap[activeFilter];
    const categoryMatch = selectedCategory === "all" ? true : listing.category === selectedCategory;
    
    if (!categoryMatch) return false;
    
    // Then apply additional filters if any
    if (Object.keys(filterParams).length === 0) return true;
    
    // Additional filtering logic based on the filter parameters
    // This is where you would implement your custom filtering logic
    // based on the selections made in the FilterModal
    
    // Example filtering (you'll need to adapt this to your data structure):
    let matchesFilters = true;
    
    Object.entries(filterParams).forEach(([key, filter]) => {
      if (!filter.selected) return; // Skip filters that aren't selected
      
      // Handle different filter types
      if (filter.options) {
        // For multi-select options
        const selectedOptions = filter.options
          .filter(opt => opt.selected)
          .map(opt => opt.label);
        
        if (selectedOptions.length > 0) {
          // Check if listing has any of the selected options
          // This is an example - adapt to your data structure
          if (listing[key] && !selectedOptions.includes(listing[key])) {
            matchesFilters = false;
          }
        }
      } else if (filter.currentMin !== undefined && filter.currentMax !== undefined) {
        // For range filters
        const value = listing[key];
        if (value !== undefined && (value < filter.currentMin || value > filter.currentMax)) {
          matchesFilters = false;
        }
      } else if (filter.value !== undefined) {
        // For toggle filters
        if (listing[key] !== filter.value) {
          matchesFilters = false;
        }
      }
    });
    
    return matchesFilters;
  });

  // Function to receive filter params from LocationHeader
  const handleFilterUpdate = (filters) => {
    setFilterParams(filters);
  };

  // Properly defined renderItem function
  const renderItem = ({ item }) => {
    if (item.category === 'shared') {
      return <SharedCard data={item} activeFilter={activeFilter} />;
    } else if (item.category === 'pg_hostel') {
      return <PGCard data={item} activeFilter={activeFilter} />;
    } else if (item.category === 'flat_home') {
      return <FlatCard data={item} activeFilter={activeFilter} />;
    }
    return null; // If category doesn't match
  };

  return (
    <>
      <StatusBar style="dark" backgroundColor="transparent" />
      <SafeWrapper>
        <View style={{ flex: 1 }}>
          <LocationHeader 
            setActiveFilter={setActiveFilter} 
            activeFilter={activeFilter}
            onFilterUpdate={handleFilterUpdate} 
          />
          <FlatList
            data={filteredListings}
            renderItem={renderItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={{ padding: 5 }}
          />
        </View>
      </SafeWrapper>
    </>
  );
};

export default HomeScreen;