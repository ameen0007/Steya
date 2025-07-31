import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const TopFadeGradient = () => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(255,255,255,1)', 'rgba(255,255,255,0)']}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 40,
    zIndex: 10,
  },
});

export default TopFadeGradient;

