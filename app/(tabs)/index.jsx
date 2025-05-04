import React from 'react';
import { SafeAreaView, StyleSheet, Text, View,FlatList } from 'react-native';
import SafeWrapper from '../../services/Safewrapper';

import {LocationHeader} from '../../componets/locationfilter'
import { StatusBar } from 'expo-status-bar';
import {PropertyCard }from '../../componets/propertycard';
import { properties } from '../../services/prpertydata';

export default function TabTwoScreen() {
  return (
    <>
  <StatusBar style="dark" backgroundColor="white" />
    <SafeWrapper style={{flex: 1}}>

   
<LocationHeader/>
<FlatList
  data={properties}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => <PropertyCard property={item} />}
  contentContainerStyle={{ flexGrow: 1, paddingBottom: 0 }} // ADD THIS LINE
  ListFooterComponent={<View style={{ height: 300 }} />} // Optional extra space for tab bar
  showsVerticalScrollIndicator={false}
/>

   
    </SafeWrapper>
    </>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: 'white',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
});
