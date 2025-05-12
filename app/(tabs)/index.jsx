import React, { useState } from 'react';
import { FlatList, View } from 'react-native';
import { LocationHeader } from '../../componets/locationfilter'; // Filter at the top
import SharedCard from '../../componets/sharecard'; // Cards for Shared Room
import PGCard from '../../componets/pgcard'; // Cards for PG/Hostel
import FlatCard from '../../componets/flatcard'; // Cards for Flats/Home
import SafeWrapper from '../../services/Safewrapper';
import { dummyListings } from '../../services/dummyListings'; 

const filterMap = {
  "All": "all",
  "Shared Rooms": "shared",
  "PG/Hostels": "pg_hostel",
  "Rental Property": "flat_home"
};

const HomeScreen = () => {
  const [activeFilter, setActiveFilter] = useState('All'); // Default is 'All'

  const filteredListings = dummyListings.filter((listing) => {
    const selectedCategory = filterMap[activeFilter];
    return selectedCategory === "all" ? true : listing.category === selectedCategory;
  });

  // console.log("Active Filter:", activeFilter);
  // console.log(filteredListings, "filteredListings:");

  // ✅ Properly defined renderItem function
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
    <SafeWrapper>
      <View style={{ flex: 1 }}>
        <LocationHeader setActiveFilter={setActiveFilter} activeFilter={activeFilter} />
        <FlatList
          data={filteredListings}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 5 }}
        />
      </View>
    </SafeWrapper>
  );
};

export default HomeScreen;
