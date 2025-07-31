import React, { useRef } from 'react';
import { View, Text, Dimensions, StatusBar, Pressable } from 'react-native';
import { router, Tabs } from 'expo-router';
import { FontAwesome6, Ionicons, MaterialIcons, Octicons, SimpleLineIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useSharedValue, withSpring } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function TabLayout() {
  // const scaleAnim = useRef(new Animated.Value(1)).current;
  const insets = useSafeAreaInsets();
  const mainbg = '#7A5AF8';

  const scale = useSharedValue(1);

  const handlePressIn = () => {
    
    scale.value = withSpring(0.9);
  };
  
  const handlePressOut = () => {
    scale.value = withSpring(1);
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
                color: 'rgba(0, 0, 0, 0.2)', // Swiggy-style ripple
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
              {/* <Pressable></Pressable> */}
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
        onPress={() => router.push('../Listingpage')}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
      >
        <Animated.View
          style={{
            transform: [{ scale: scale.value }],
            height: 60,
            width: 60,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 99999,
            backgroundColor: mainbg,
            marginBottom: 30,
          }}
        >
          <Ionicons name="add" color="white" size={24} />
        </Animated.View>
      </Pressable>
    ),
    tabBarIcon: () => null, // disable default icon
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
              <MaterialIcons
                name={focused ? "favorite" : "favorite-outline"}
                color={focused ? mainbg : "gray"}
                size={24}
              />
              <Text style={{
                color: focused ? mainbg : "gray",
                fontSize: 10,

                fontFamily: "Poppinssm"
              }}>
                Saved
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