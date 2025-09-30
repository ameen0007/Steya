import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../../services/intercepter';

export default function Add() {
  const router = useRouter();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true); // Initial page loading
  const [refreshing, setRefreshing] = useState(false); // Pull-to-refresh state
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  const fetchRooms = useCallback(async () => {
    try {
      const response = await api.get(`${apiUrl}/api/chat/chatrooms`);
      setRooms(response.data); // Update rooms
    } catch (err) {
      console.log('Error fetching rooms:', err);
    }
  }, [apiUrl]);

  // Initial load
  useEffect(() => {
    const loadInitial = async () => {
      await fetchRooms();
      setLoading(false); // Turn off initial loading
    };
    loadInitial();
  }, [fetchRooms]);

  // Pull-to-refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRooms();
    setRefreshing(false); // Reset refreshing state
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#7A5AF8" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={rooms}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.roomItem}
            onPress={() => router.push(`/chat/${item._id}`)}
          >
            <Text style={styles.roomName}>{item.name || 'Room'}</Text>
            <Text style={styles.lastMsg}>{item.lastMessage || 'No messages yet'}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text>No chats available</Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#7A5AF8"
            colors={['#7A5AF8']} // Android
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  roomItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd'
  },
  roomName: { fontSize: 16, fontWeight: 'bold' },
  lastMsg: { fontSize: 14, color: '#666', marginTop: 4 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 40 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
