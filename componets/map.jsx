import React from 'react';
import { View, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import MapView, { Circle, PROVIDER_GOOGLE } from 'react-native-maps';

export default function StaticMap({ latitude, longitude }) {
  const handlePress = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    Linking.openURL(url);
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude,
            longitude,
            latitudeDelta: 0.0001,  // Extremely small delta for maximum zoom
            longitudeDelta: 0.0001, // Extremely small delta for maximum zoom
          }}
          zoomEnabled={false}       // Prevent user from zooming out
          scrollEnabled={false}     // Prevent map panning
          rotateEnabled={false}     // Prevent map rotation
          pitchEnabled={false}      // Prevent 3D view changes
          toolbarEnabled={false}    // Hide toolbar (Android)
          moveOnMarkerPress={false} // Prevent centering on marker press
          maxZoomLevel={19}         // For Android
          minZoomLevel={15}         // For Android
          cameraZoomRange={{ maxZoom: 20, minZoom: 20 }} // For iOS
        >
          <Circle
            center={{ latitude, longitude }}
            radius={130}  // Smaller radius to match zoom level (50 meters)
            strokeColor="#795FFC"
            fillColor="rgba(121, 95, 252, 0.3)"
          />
        </MapView>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    height: 180,
    borderRadius: 30,
    overflow: 'hidden',
    marginVertical: 10,
    paddingHorizontal:10
  },
  map: {
    flex: 1,
  },
});