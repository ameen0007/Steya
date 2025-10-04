import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, Text, FlatList, TouchableOpacity, StyleSheet, 
  ActivityIndicator, RefreshControl, Image,  
} from 'react-native';
import { useRouter } from 'expo-router';
import api from '../../services/intercepter';
import { useSelector } from 'react-redux';
import SafeWrapper from '../../services/Safewrapper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';

export default function Add() {
  const router = useRouter();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  const user = useSelector((state) => state.user.userData);

  // ✅ FIXED: Correct data parsing
  const fetchRooms = useCallback(async () => {
    try {
      setError(null);
      const response = await api.get(`${apiUrl}/api/chat/chatrooms`);
      
      console.log('📦 Full API Response:', response.data);
      
      // ✅ CORRECT: The data is in response.data.chatrooms (with pagination)
      const roomsData = response.data?.chatrooms || [];
      
      if (Array.isArray(roomsData)) {
        console.log('✅ Rooms data received:', roomsData.length, 'rooms');
        
        // Filter to show only active rooms with messages
        const activeRooms = roomsData.filter(room => 
          room && room.status === 'active' && room.hasMessages
        );
        
        console.log('✅ Active rooms with messages:', activeRooms.length);
        setRooms(activeRooms);
      } else {
        console.log('❌ Invalid data format:', response.data);
        setRooms([]);
        setError('Invalid data format received');
      }
    } catch (err) {
      console.log('❌ Error fetching rooms:', err.response?.data || err.message);
      setError('Failed to load conversations');
      setRooms([]);
    }
  }, [apiUrl]);

  useEffect(() => {
    const loadInitial = async () => {
      await fetchRooms();
      setLoading(false);
    };
    loadInitial();
  }, [fetchRooms]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRooms();
    setRefreshing(false);
  };

  const retryFetch = async () => {
    setLoading(true);
    setError(null);
    await fetchRooms();
    setLoading(false);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInHours = (now - date) / (1000 * 60 * 60);

      if (diffInHours < 24) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else {
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      }
    } catch (error) {
      return '';
    }
  };

  // Render loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style='dark' />
        <LinearGradient
          colors={['#8E6AFB', '#7A5AF8']}
          style={styles.loadingIconBackground}
        >
          <Ionicons name="chatbubble-ellipses" size={32} color="#FFFFFF" />
        </LinearGradient>
        <Text style={styles.loadingText}>Loading conversations...</Text>
      </View>
    );
  }

  // Render error state
  if (error && !loading) {
    return (
      <SafeWrapper>
        <StatusBar style='dark' />
        <View style={styles.errorContainer}>
          <LinearGradient
            colors={['#FFE5E5', '#FFFAFA']}
            style={styles.errorIconBackground}
          >
            <Ionicons name="warning" size={40} color="#FF4757" />
          </LinearGradient>
          <Text style={styles.errorTitle}>Unable to Load</Text>
          <Text style={styles.errorSubtitle}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={retryFetch}
          >
            <LinearGradient
              colors={['#7A5AF8', '#8E6AFB']}
              style={styles.retryButtonGradient}
            >
              <Ionicons name="refresh" size={20} color="#FFFFFF" />
              <Text style={styles.retryButtonText}>Try Again</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeWrapper>
    );
  }

  const renderItem = ({ item, index }) => {
    if (!item) return null;

    const participants = item.participants || [];
    const otherUser = participants.find(p => p && String(p._id) !== String(user?._id)) 
      || participants[0] 
      || { name: 'Unknown User' };

    const isUnread = item.lastMessageViewedBy?.includes 
      ? !item.lastMessageViewedBy.includes(user?._id)
      : false;

    return (
      <TouchableOpacity
        style={[
          styles.roomItem,
          isUnread && styles.unreadRoomItem
        ]}
        activeOpacity={0.7}
        onPress={() => {
          if (item._id) {
            router.push(`/chat/${item._id}`);
          }
        }}
      >
        <View style={styles.avatarContainer}>
          {otherUser?.picture ? (
            <Image
              source={{ uri: otherUser.picture }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarFallbackText}>
                {(otherUser.name?.charAt(0) || 'U').toUpperCase()}
              </Text>
            </View>
          )}
          <View style={[styles.onlineIndicator, styles.onlineIndicatorInactive]} />
        </View>

        <View style={styles.roomContent}>
          <View style={styles.roomHeader}>
            <Text style={styles.roomName} numberOfLines={1}>
              {otherUser.name || 'Unknown User'}
            </Text>
            <Text style={styles.timeText}>
              {formatTime(item.updatedAt)}
            </Text>
          </View>

          <View style={styles.productContainer}>
            <View style={styles.productIcon}>
              <Ionicons name="cube" size={10} color="#FFFFFF" />
            </View>
            <Text style={styles.productTitle} numberOfLines={1}>
              {item.name || 'Product Inquiry'}
            </Text>
          </View>

          <View style={styles.messageContainer}>
            <Text 
              style={[
                styles.lastMsg,
                isUnread && styles.unreadLastMsg
              ]} 
              numberOfLines={2}
            >
              {item.lastMessage || 'No messages yet'}
            </Text>

            {isUnread && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>New</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.chevronContainer}>
          <Ionicons name="chevron-forward" size={20} color={isUnread ? "#7A5AF8" : "#C5C5D3"} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeWrapper>
      <StatusBar style='dark' />
      <View style={styles.container}>
        <LinearGradient
          colors={['#FFFFFF', '#F8F7FF']}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Messages</Text>
            <Text style={styles.headerSubtitle}>Your conversations</Text>
          </View>
        </LinearGradient>

        <View style={styles.listContainer}>
          <FlatList
            data={rooms}
            keyExtractor={(item, index) => item?._id ? `room-${item._id}` : `room-${index}`}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.listContent,
              rooms.length === 0 && styles.emptyListContent
            ]}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <LinearGradient
                  colors={['#E9E5FF', '#F8F7FF']}
                  style={styles.emptyIconBackground}
                >
                  <Ionicons name="chatbubble-ellipses" size={40} color="#7A5AF8" />
                </LinearGradient>
                <Text style={styles.emptyTitle}>No conversations yet</Text>
                <Text style={styles.emptySubtitle}>
                  Start a chat to connect with others
                </Text>
              </View>
            }
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#7A5AF8"
                colors={['#7A5AF8']}
              />
            }
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>
      </View>
    </SafeWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingIconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'Inter-Medium',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  errorIconBackground: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 30,
  },
  retryButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  retryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  headerGradient: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 8,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  roomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  unreadRoomItem: {
    backgroundColor: '#F8F7FF',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarFallback: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#7A5AF8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarFallbackText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  onlineIndicatorInactive: {
    backgroundColor: '#6B7280',
  },
  roomContent: {
    flex: 1,
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  roomName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    flex: 1,
    marginRight: 8,
  },
  timeText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  productContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  productIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#7A5AF8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  productTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    flex: 1,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMsg: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    flex: 1,
    marginRight: 8,
  },
  unreadLastMsg: {
    color: '#1F2937',
    fontFamily: 'Inter-SemiBold',
  },
  unreadBadge: {
    backgroundColor: '#7A5AF8',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  unreadText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  chevronContainer: {
    marginLeft: 8,
  },
  separator: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconBackground: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});