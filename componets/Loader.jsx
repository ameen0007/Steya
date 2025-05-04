import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Dimensions } from 'react-native';

const GoogleStyleLoadingBar = () => {
  const [position] = useState(new Animated.Value(-100));

  useEffect(() => {
    let direction = 1;
    const screenWidth = Dimensions.get('window').width;
    const barWidth = screenWidth * 0.25; // 25% of screen
    const maxLeft = screenWidth - barWidth;

    const animate = () => {
      Animated.timing(position, {
        toValue: direction === 1 ? maxLeft : -100,
        duration: 500,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start(() => {
        direction *= -1;
        animate(); // repeat
      });
    };

    animate();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.wrapper}>
  
        <View style={styles.track}>
          <Animated.View
            style={[
              styles.bar,
              {
                left: position,
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {

    alignItems: 'center',
    width: '100%',
    
   
  },
  wrapper: {
    width: '100%',
    maxWidth: 400,
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 10,
  },
  track: {
    height: 3,
    width: '100%',
    backgroundColor: '#e5e5e5',
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  bar: {
    position: 'absolute',
    height: '100%',
    width: '25%',
    backgroundColor: '#673AB7',
    borderRadius: 4,
    paddingHorizontal:20,
  },
});

export default GoogleStyleLoadingBar;
