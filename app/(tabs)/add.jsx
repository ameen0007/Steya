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

const fetchRooms = useCallback(async () => {
  try {
    setError(null);
    const response = await api.get(`${apiUrl}/api/chat/chatrooms`);
    
    const roomsData = response.data?.data || response.data;
    
    if (Array.isArray(roomsData)) {
      console.log('Rooms data received:', roomsData.length, 'rooms');
      
      // Filter to show only active rooms with messages
      const activeRooms = roomsData.filter(room => 
        room.status === 'active' && room.hasMessages
      );
      
      console.log('Active rooms with messages:', activeRooms.length);
      setRooms([...activeRooms]);
    } else {
      setRooms([]);
      setError('Invalid data format received');
    }
  } catch (err) {
    console.log('Error fetching rooms:', err);
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

  const renderItem = ({ item, index }) => {
    const participants = item.participants || [];
    const otherUser = participants.find(p => String(p?._id) !== String(user?._id)) 
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
              {formatTime(item.lastMessageTime)}
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
            keyExtractor={(item, index) => item._id ? `room-${item._id}` : `room-${index}`}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
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
    backgroundColor: '#FFFFFF' 
  },
  listContainer: {
    flex: 1,
    width: '100%',
  },
  headerGradient: {
    paddingBottom: 8, // Reduced bottom padding
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50, // Reduced top padding
    paddingBottom: 12, // Reduced bottom padding
  },
  headerTitle: {
    fontSize: 28, // Slightly smaller
    fontWeight: '700',
    color: '#1A1A2C',
    marginBottom: 4, // Reduced margin
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#7A5AF8',
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 12, // Reduced padding
    paddingTop: 8, // Reduced top padding
    paddingBottom: 20,
    flexGrow: 1,
  },
  roomItem: {
    flexDirection: 'row',
    padding: 12, // Reduced padding
    backgroundColor: '#FFFFFF',
    borderRadius: 12, // Slightly smaller radius
    alignItems: 'center',
    shadowColor: '#7A5AF8',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F8F7FF',
    height: 80, // Fixed height - much smaller!
    marginHorizontal: 4, // Small horizontal margin
  },
  unreadRoomItem: {
    backgroundColor: '#F8F7FF',
    borderLeftWidth: 3, // Thinner border
    borderLeftColor: '#7A5AF8',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12, // Reduced margin
  },
  avatar: {
    width: 48, // Smaller avatar
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
  },
  avatarFallback: {
    width: 48, // Smaller avatar
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E9E5FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarFallbackText: {
    fontSize: 18, // Smaller text
    fontWeight: '600',
    color: '#7A5AF8',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12, // Smaller indicator
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  onlineIndicatorActive: {
    backgroundColor: '#10B981',
  },
  onlineIndicatorInactive: {
    backgroundColor: '#9CA3AF',
  },
  roomContent: {
    flex: 1,
    justifyContent: 'center',
    height: '100%', // Take full height of parent
  },
  roomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2, // Reduced margin
  },
  roomName: { 
    fontSize: 15, // Smaller font
    fontWeight: '700', 
    color: '#1A1A2C',
    flex: 1,
  },
  timeText: {
    fontSize: 11, // Smaller font
    color: '#9CA3AF',
    fontWeight: '500',
  },
  productContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2, // Reduced margin
  },
  productIcon: {
    width: 14, // Smaller icon
    height: 14,
    borderRadius: 7,
    backgroundColor: '#7A5AF8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4, // Reduced margin
  },
  productTitle: { 
    fontSize: 12, // Smaller font
    color: '#7A5AF8', 
    fontWeight: '600',
    flex: 1,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1, // Take available space
  },
  lastMsg: { 
    fontSize: 13, // Slightly smaller
    color: '#6B7280',
    flex: 1,
    lineHeight: 16, // Tighter line height
  },
  unreadLastMsg: {
    color: '#1A1A2C',
    fontWeight: '500',
  },
  unreadBadge: {
    backgroundColor: '#7A5AF8',
    paddingHorizontal: 6, // Smaller padding
    paddingVertical: 2, // Smaller padding
    borderRadius: 8, // Smaller radius
    marginLeft: 6, // Reduced margin
  },
  unreadText: {
    fontSize: 10, // Smaller font
    color: '#FFFFFF',
    fontWeight: '700',
  },
  separator: {
    height: 6, // Smaller separator
  },
  emptyContainer: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 60, // Reduced padding
    paddingHorizontal: 40,
  },
  emptyIconBackground: {
    width: 80, // Smaller icon
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16, // Reduced margin
  },
  emptyTitle: {
    fontSize: 18, // Slightly smaller
    fontWeight: '700',
    color: '#1A1A2C',
    marginBottom: 8, // Reduced margin
  },
  emptySubtitle: {
    fontSize: 14, // Slightly smaller
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20, // Tighter line height
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingIconBackground: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#7A5AF8',
    fontWeight: '600',
  },
  chevronContainer: {
    paddingLeft: 8, // Reduced padding
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 40,
  },
  errorIconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A2C',
    marginBottom: 10,
  },
  errorSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 30,
  },
  retryButton: {
    width: '80%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  retryButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});