import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, Dimensions, Text, View, StatusBar } from 'react-native';
import { Tabs } from 'expo-router';
import { Entypo, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get("window");

export default function TabLayout() {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const insets = useSafeAreaInsets();
    console.log('====================================');
    console.log(insets,);
    console.log('====================================');

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
  
  
    <Tabs
    screenOptions={{
      headerShown: false,
      tabBarShowLabel: false,
     
      tabBarButton: (props) => (
        <Pressable
          {...props}
          android_ripple={{
            color: 'rgba(0, 0, 0, 0.2)', // Swiggy-style ripple
            radius: 35,
   
          }}
          
            style={({ pressed }) => [
              {
                flex: 1,
                borderRadius: 999,         // Round corners to match ripple
                alignItems: 'center',
                justifyContent: 'center',
                // Make sure ripple has space to grow without clipping:
                padding: pressed ? 6 : 0,  // Adjust the padding when pressed to create space
              },
    ]}
        />
      ),
      tabBarStyle: {
        backgroundColor: "white",
 
     
      }
    }}
  >

      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={{
              alignItems: "center",
              marginTop:3,
              width: width / 5
            }}>
              <Ionicons
                name={focused ? "home-sharp" : "home-outline"}
                color={focused ? "#673AB7" : "gray"}
                size={24}
              />
              <Text style={{
                color: focused ? "#673AB7" : "gray",
              
                fontSize: 10,
               
                fontFamily:"Poppinssm"
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
              marginTop:3,
              width: width / 5
            }}>
               {/* <Pressable></Pressable> */}
              <Ionicons
                name={focused ? "chatbox-ellipses" : "chatbox-ellipses-outline"}
                color={focused ? "#673AB7" : "gray"}
                size={24}
              />
              <Text style={{
                color: focused ? "#673AB7" : "gray",
                fontSize: 10,
              
                fontFamily:"Poppinssm"
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
          tabBarIcon: () => (
            <Pressable
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              style={{ alignItems: 'center', justifyContent: 'center' }}
            >
              <Animated.View style={{
                transform: [{ scale: scaleAnim }],
                height: 60,
                width: 60,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 99999,
                backgroundColor: '#673AB7',
                marginBottom: 30
              }}>
                <Ionicons name="add" color="white" size={24} />
              </Animated.View>
            </Pressable>
          )
        }}
      />

      <Tabs.Screen
        name="likes"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={{
              alignItems: "center",
              marginTop:3,
              width: width / 5
            }}>
              <MaterialIcons
                name={focused ? "favorite" : "favorite-outline"}
                color={focused ? "#673AB7" : "gray"}
                size={24}
              />
              <Text style={{
                color: focused ? "#673AB7" : "gray",
                fontSize: 10,
              
                fontFamily:"Poppinssm"
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
              marginTop:3,
              width: width / 5
            }}>
              <Ionicons
                name={focused ? "person" : "person-outline"}
                color={focused ? "#673AB7" : "gray"}
                size={24}
              />
              <Text style={{
                color: focused ? "#673AB7" : "gray",
                fontSize: 10,
              
                fontFamily:"Poppinssm"
              }}>
               Profile
              </Text>
            </View>
          )
        }}
      />

    </Tabs>

  
  );
}