// import React, { useRef } from 'react';
// import { View, Text, Dimensions, StatusBar, Pressable } from 'react-native';
// import { router, Tabs } from 'expo-router';
// import { FontAwesome6, Ionicons, MaterialCommunityIcons, MaterialIcons, Octicons, SimpleLineIcons } from '@expo/vector-icons';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import Animated, { useSharedValue, withSpring, useAnimatedStyle } from 'react-native-reanimated';
import React, { useRef } from 'react';
import { View, Text, Pressable, Dimensions } from 'react-native';

import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome6, SimpleLineIcons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Animated } from 'react-native';
import { preventDoubleTap } from '../../services/debounfunc';
const { width } = Dimensions.get('window');

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const mainbg = '#7A5AF8';

  const scale = useRef(new Animated.Value(1)).current;

const handlePressIn = () => {
  Animated.timing(scale, {
    toValue: 0.9,
    duration: 40, // super fast shrink
    useNativeDriver: true,
  }).start();
};

const handlePressOut = () => {
  Animated.timing(scale, {
    toValue: 1,
    duration: 40, // super fast back
    useNativeDriver: true,
  }).start();
};




  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            height: 60 + insets.bottom,
            paddingBottom: insets.bottom,
            backgroundColor: 'white',
            borderTopWidth: 0.5,
            borderTopColor: '#ddd',
          },
          tabBarButton: (props) => (
            <Pressable
              {...props}
              android_ripple={{
                color: 'rgba(0, 0, 0, 0.2)',
                radius: 35,
              }}
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 4,
              }}
            />
          )
        }}
      >

        <Tabs.Screen
          name="index"
          options={{
            tabBarIcon: ({ focused }) => (
              <View style={{
                alignItems: "center",
                marginTop: 3,
                width: width / 5,
              }}>
                {focused ? (
                  <FontAwesome6 name="house" size={24} color={mainbg} />
                ) : (
                  <SimpleLineIcons name="home" size={21} color="gray" />
                )}

                <Text style={{
                  color: focused ? mainbg : "gray",
                  fontSize: 10,
                  fontFamily: "Poppinssm"
                }}>
                  Home
                </Text>
              </View>
            )
          }}
        />

        <Tabs.Screen
          name="add"
          options={{
            tabBarIcon: ({ focused }) => (
              <View style={{
                alignItems: "center",
                marginTop: 3,
                width: width / 5
              }}>
                <Ionicons
                  name={focused ? "chatbox-ellipses" : "chatbox-ellipses-outline"}
                  color={focused ? mainbg : "gray"}
                  size={24}
                />
                <Text style={{
                  color: focused ? mainbg : "gray",
                  fontSize: 10,
                  fontFamily: "Poppinssm"
                }}>
                  Chat
                </Text>
              </View>
            )
          }}
        />

        <Tabs.Screen
          name="explore"
          options={{
            tabBarButton: (props) => (
              <Pressable
                 onPress={() =>
          preventDoubleTap(() => router.push('../Listingpage'))
        }
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
              >
                {/* ✅ FIXED - Using animatedButtonStyle instead of inline scale.value */}
                <Animated.View
  style={[
    {
      height: 60,
      width: 60,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 99999,
      backgroundColor: mainbg,
      marginBottom: 30,
    },
    { transform: [{ scale: scale }] }  
  ]}
>
                  <Ionicons name="add" color="white" size={24} />
                </Animated.View>
              </Pressable>
            ),
            tabBarIcon: () => null,
          }}
        />

        <Tabs.Screen
          name="likes"
          options={{
            tabBarIcon: ({ focused }) => (
              <View style={{
                alignItems: "center",
                marginTop: 3,
                width: width / 5
              }}>
                <MaterialCommunityIcons
                  name={focused ? "post" : "post-outline"}
                  color={focused ? mainbg : "gray"}
                  size={24}
                />
                <Text style={{
                  color: focused ? mainbg : "gray",
                  fontSize: 10,
                  fontFamily: "Poppinssm"
                }}>
                  My Ads
                </Text>
              </View>
            )
          }}
        />

        <Tabs.Screen
          name="myprofile"
          options={{
            tabBarIcon: ({ focused }) => (
              <View style={{
                alignItems: "center",
                marginTop: 3,
                width: width / 5
              }}>
                <Ionicons
                  name={focused ? "person" : "person-outline"}
                  color={focused ? mainbg : "gray"}
                  size={24}
                />
                <Text style={{
                  color: focused ? mainbg : "gray",
                  fontSize: 10,
                  fontFamily: "Poppinssm"
                }}>
                  Profile
                </Text>
              </View>
            )
          }}
        />

      </Tabs>
    </>
  );
}