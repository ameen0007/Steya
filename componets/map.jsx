import React from 'react';
import { View, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { WebView } from 'react-native-webview';

export default function StaticMap({ latitude, longitude ,placeName}) {
  const handlePress = () => {
    const googleMapUrl = `https://www.google.com/maps?q=${placeName}@${latitude},${longitude}`;
    Linking.openURL(googleMapUrl);
  };

  const leafletHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
      <style>
        #map { height: 100%; width: 100%; border-radius: 20px; }
        html, body { margin: 0; height: 100%; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
      <script>
        var map = L.map('map', { zoomControl: false }).setView([${latitude}, ${longitude}], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19
        }).addTo(map);
        L.circle([${latitude}, ${longitude}], {
          color: '#795FFC',
          fillColor: '#795FFC55',
          fillOpacity: 0.5,
          radius: 130
        }).addTo(map);
      </script>
    </body>
    </html>
  `;

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
      <View style={styles.container}>
        <WebView
          source={{ html: leafletHTML }}
          style={styles.map}
          scrollEnabled={false}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    marginVertical: 10,
    marginHorizontal: 16,
  },
  map: {
    flex: 1,
  },
});



