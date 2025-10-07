import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export const BeautifulLoader = ({ size = 50 }) => {
  const bounce1 = useRef(new Animated.Value(0)).current;
  const bounce2 = useRef(new Animated.Value(0)).current;
  const bounce3 = useRef(new Animated.Value(0)).current;
  const bounce4 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createBounceAnimation = (animatedValue, delay) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 400,
            easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 400,
            easing: Easing.bezier(0.55, 0.085, 0.68, 0.53),
            useNativeDriver: true,
          }),
        ])
      );
    };

    createBounceAnimation(bounce1, 0).start();
    createBounceAnimation(bounce2, 100).start();
    createBounceAnimation(bounce3, 200).start();
    createBounceAnimation(bounce4, 300).start();
  }, []);

  const translateY1 = bounce1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -size * 1.2],
  });

  const translateY2 = bounce2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -size * 1.2],
  });

  const translateY3 = bounce3.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -size * 1.2],
  });

  const translateY4 = bounce4.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -size * 1.2],
  });

  const scale1 = bounce1.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.8, 1],
  });

  const scale2 = bounce2.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.8, 1],
  });

  const scale3 = bounce3.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.8, 1],
  });

  const scale4 = bounce4.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.8, 1],
  });

  const ballSize = size * 0.55;

  return (
    <View style={styles.container}>
      <View style={styles.ballsContainer}>
        {/* Ball 1 */}
        <Animated.View
          style={[
            styles.ballWrapper,
            {
              transform: [{ translateY: translateY1 }, { scale: scale1 }],
            },
          ]}
        >
          <LinearGradient
            colors={['#9B7DF7', '#7A5AF8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.ball,
              {
                width: ballSize,
                height: ballSize,
                borderRadius: ballSize / 2,
              },
            ]}
          >
            <View style={styles.shine} />
          </LinearGradient>
          <View
            style={[
              styles.shadow,
              {
                width: ballSize,
                height: ballSize / 4,
                borderRadius: ballSize / 2,
              },
            ]}
          />
        </Animated.View>

        {/* Ball 2 */}
        {/* <Animated.View
          style={[
            styles.ballWrapper,
            {
              transform: [{ translateY: translateY2 }, { scale: scale2 }],
            },
          ]}
        >
          <LinearGradient
            colors={['#B998F5', '#9B7DF7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.ball,
              {
                width: ballSize,
                height: ballSize,
                borderRadius: ballSize / 2,
              },
            ]}
          >
            <View style={styles.shine} />
          </LinearGradient>
          <View
            style={[
              styles.shadow,
              {
                width: ballSize,
                height: ballSize / 4,
                borderRadius: ballSize / 2,
              },
            ]}
          />
        </Animated.View> */}

        {/* Ball 3 */}
        {/* <Animated.View
          style={[
            styles.ballWrapper,
            {
              transform: [{ translateY: translateY3 }, { scale: scale3 }],
            },
          ]}
        >
          <LinearGradient
            colors={['#D4C4F9', '#B998F5']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.ball,
              {
                width: ballSize,
                height: ballSize,
                borderRadius: ballSize / 2,
              },
            ]}
          >
            <View style={styles.shine} />
          </LinearGradient>
          <View
            style={[
              styles.shadow,
              {
                width: ballSize,
                height: ballSize / 4,
                borderRadius: ballSize / 2,
              },
            ]}
          />
        </Animated.View> */}

        {/* Ball 4 */}
        {/* <Animated.View
          style={[
            styles.ballWrapper,
            {
              transform: [{ translateY: translateY4 }, { scale: scale4 }],
            },
          ]}
        >
          <LinearGradient
            colors={['#E5D9FA', '#D4C4F9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.ball,
              {
                width: ballSize,
                height: ballSize,
                borderRadius: ballSize / 2,
              },
            ]}
          >
            <View style={styles.shine} />
          </LinearGradient>
          <View
            style={[
              styles.shadow,
              {
                width: ballSize,
                height: ballSize / 4,
                borderRadius: ballSize / 2,
              },
            ]}
          />
        </Animated.View> */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  ballsContainer: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-end',
  },
  ballWrapper: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  ball: {
    shadowColor: '#7A5AF8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    position: 'relative',
  },
  shine: {
    position: 'absolute',
    top: '20%',
    left: '25%',
    width: '30%',
    height: '30%',
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  shadow: {
    backgroundColor: '#7A5AF8',
    opacity: 0.15,
    marginTop: 4,
  },
});
