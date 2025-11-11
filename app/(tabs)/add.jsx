import React, { useEffect, useState, useCallback, useRef } from 'react';
import { 
  View, Text, FlatList, TouchableOpacity, StyleSheet, 
  ActivityIndicator, RefreshControl, Image, AppState
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import api from '../../services/intercepter';
import { useDispatch, useSelector } from 'react-redux';
import SafeWrapper from '../../services/Safewrapper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import ProtectedRoute from '../protectedroute';
import { setUnreadStatus } from '../Redux/unreadSlice';
import { io } from 'socket.io-client';

export default function Add() {
  const router = useRouter();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  const user = useSelector((state) => state.user.userData);
  const dispatch = useDispatch();
  
  // Socket ref
  const socketRef = useRef(null);
  const appState = useRef(AppState.currentState);

  const calculateUnreadCount = useCallback((roomsData) => {
    if (!Array.isArray(roomsData) || !user?._id) return 0;
    
    let unreadCount = 0;
    
    roomsData.forEach((room) => {
      // Skip deleted rooms
      if (room.isDeleted) return;
      
      // Convert everything to strings for comparison
      const lastMessageSenderId = room.lastMessageSender?._id?.toString();
      const currentUserId = user._id.toString();
      
      const isFromOtherUser = lastMessageSenderId && lastMessageSenderId !== currentUserId;
      
      const hasUserReadIt = room.readBy?.some(readByUser => 
        readByUser?.toString() === currentUserId
      );
      
      const isUnread = isFromOtherUser && !hasUserReadIt;
      
      if (isUnread) {
        unreadCount++;
      }
    });
    
    return unreadCount;
  }, [user?._id]);

  const fetchRooms = useCallback(async (silent = false) => {
    if (!user?._id) return;
    try {
      if (!silent) setError(null);
      
      const response = await api.get(`${apiUrl}/api/chat/chatrooms`);
      
      const roomsData = response.data?.chatrooms || [];
      
      if (Array.isArray(roomsData)) {
        // Filter to show both active AND deleted-but-not-expired chats
        const filteredRooms = roomsData.filter(room => {
          if (!room) return false;
          
          // Show active rooms OR deleted rooms that haven't expired yet
          const isActive = room.status === 'active' && room.hasMessages && !room.isDeleted;
          const isDeletedButNotExpired = room.isDeleted && room.deleteExpiresAt && new Date(room.deleteExpiresAt) > new Date();
          
          return isActive || isDeletedButNotExpired;
        });
        
        const unreadCount = calculateUnreadCount(filteredRooms);
        const unreadExists = unreadCount > 0;
        
        setRooms(filteredRooms);
        dispatch(setUnreadStatus({ 
          hasUnread: unreadExists, 
          count: unreadCount 
        }));
      }
    } catch (err) {
      console.log('❌ Error fetching rooms:', err);
      if (!silent) {
        setError('Failed to load conversations');
      }
      setRooms([]);
      dispatch(setUnreadStatus({ hasUnread: false, count: 0 }));
    }
  }, [apiUrl, user?._id, dispatch, calculateUnreadCount]);

  // Setup Socket.IO for real-time updates
  useEffect(() => {
    if (!user?._id) return;

    console.log('🔌 Setting up socket connection for chat list...');

    const socket = io(apiUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 10000
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ Socket connected in chat list');
      // Join a user-specific room to listen for chat updates
      socket.emit('joinUserRoom', { userId: user._id });
    });

    // Listen for new messages in ANY chat room
    socket.on('newMessageInAnyRoom', (data) => {
      console.log('📨 New message received in chat list:', data);
      // Silently refresh the chat list
      fetchRooms(true);
    });

    // Listen for message read status updates
    socket.on('messageRead', (data) => {
      console.log('✅ Message marked as read:', data);
      // Silently refresh the chat list
      fetchRooms(true);
    });

    // Listen for room updates (deleted, expired, etc)
    socket.on('roomUpdated', (data) => {
      console.log('🔄 Room updated:', data);
      // Silently refresh the chat list
      fetchRooms(true);
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected in chat list:', reason);
    });

    socket.on('error', (error) => {
      console.log('❌ Socket error in chat list:', error);
    });

    return () => {
      if (socketRef.current) {
        console.log('🔌 Disconnecting socket in chat list');
        socketRef.current.emit('leaveUserRoom', { userId: user._id });
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user?._id, apiUrl, fetchRooms]);

  // Handle app state changes (foreground/background)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('🔄 App came to foreground - refreshing chat list');
        fetchRooms(true);
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [fetchRooms]);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('👀 Chat list screen focused - refreshing');
      fetchRooms(true);
    }, [fetchRooms])
  );

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

  const getDaysLeft = (deleteExpiresAt) => {
    if (!deleteExpiresAt) return 0;
    const now = new Date();
    const expiry = new Date(deleteExpiresAt);
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const handleChatPress = useCallback(async (item) => {
    if (item._id && !item.isDeleted) {
      // Mark as read when opening the chat
      try {
        await api.post(`${apiUrl}/api/chat/mark-read`, {
          roomId: item._id,
          userId: user._id
        });
        
        // Update local state immediately
        setRooms(prevRooms => 
          prevRooms.map(room => 
            room._id === item._id 
              ? { ...room, readBy: [...(room.readBy || []), user._id] }
              : room
          )
        );
        
        // Recalculate unread count
        const updatedRooms = rooms.map(room => 
          room._id === item._id 
            ? { ...room, readBy: [...(room.readBy || []), user._id] }
            : room
        );
        const newUnreadCount = calculateUnreadCount(updatedRooms);
        dispatch(setUnreadStatus({ 
          hasUnread: newUnreadCount > 0, 
          count: newUnreadCount 
        }));
      } catch (error) {
        console.log('❌ Error marking as read:', error);
      }
      
      router.push(`/chat/${item._id}`);
    }
  }, [user?._id, rooms, calculateUnreadCount, dispatch, router, apiUrl]);

  const renderItem = ({ item, index }) => {
    if (!item) return null;

    const participants = item.participants || [];
    const otherUser = participants.find(p => p && String(p._id) !== String(user?._id)) 
      || participants[0] 
      || { name: 'Unknown User' };

    // Check if chat is deleted/expired
    const isDeleted = item.isDeleted || item.status === 'expired';
    const daysLeft = isDeleted ? getDaysLeft(item.deleteExpiresAt) : null;

    // Check unread status (only for non-deleted chats)
    const isFromOtherUser = !isDeleted && item.lastMessageSender && 
                           item.lastMessageSender._id.toString() !== user?._id?.toString();
    
    const hasUserReadIt = !isDeleted && item.readBy?.some(readByUser => 
      readByUser?.toString() === user?._id?.toString()
    );
    
    const isUnread = isFromOtherUser && !hasUserReadIt;

    return (
      <View style={styles.chatItemWrapper}>
        <TouchableOpacity
          style={[
            styles.chatItem,
            isUnread && styles.chatItemUnread,
            isDeleted && styles.chatItemDeleted
          ]}
          activeOpacity={isDeleted ? 1 : 0.7}
          onPress={() => handleChatPress(item)}
          disabled={isDeleted}
        >
          <View style={styles.avatarWrapper}>
            {otherUser?.picture ? (
              <Image
                source={{ uri: otherUser.picture }}
                style={[
                  styles.avatar,
                  isDeleted && styles.avatarDeleted
                ]}
              />
            ) : (
              <View style={[
                styles.avatarPlaceholder,
                isDeleted && styles.avatarPlaceholderDeleted
              ]}>
                <Text style={[
                  styles.avatarText,
                  isDeleted && styles.avatarTextDeleted
                ]}>
                  {(otherUser.name?.charAt(0) || 'U').toUpperCase()}
                </Text>
              </View>
            )}
            {isUnread && <View style={styles.unreadIndicator} />}
            {isDeleted && (
              <View style={styles.expiredBadge}>
                <Ionicons name="close-circle" size={20} color="#FFFFFF" />
              </View>
            )}
          </View>

          <View style={styles.chatContent}>
            <View style={styles.topRow}>
              <Text 
                style={[
                  styles.userName,
                  isUnread && styles.userNameUnread,
                  isDeleted && styles.userNameDeleted
                ]} 
                numberOfLines={1}
              >
                {otherUser.name || 'Unknown User'}
              </Text>
              {!isDeleted && (
                <Text style={[styles.timestamp, isUnread && styles.timestampUnread]}>
                  {formatTime(item.lastMessageAt || item.updatedAt)}
                </Text>
              )}
            </View>

            {isDeleted ? (
              <View style={styles.expiredContainer}>
                <View style={styles.expiredBanner}>
                  <View style={styles.expiredIconWrapper}>
                    <Ionicons name="alert-circle" size={16} color="#EF4444" />
                  </View>
                  <View style={styles.expiredTextWrapper}>
                    <Text style={styles.expiredTitle}>This property has been sold or expired.</Text>
                    <Text style={styles.expiredSubtitle}>
                      Chat will be deleted in {daysLeft} {daysLeft === 1 ? 'day' : 'days'}.
                    </Text>
                  </View>
                </View>
              </View>
            ) : (
              <>
                <View style={styles.productRow}>
                  <View style={styles.productBadge}>
                    <Ionicons name="cube-outline" size={12} color="#7A5AF8" />
                  </View>
                  <Text style={styles.productName} numberOfLines={1}>
                    {item.name || 'Product Inquiry'}
                  </Text>
                </View>

                <View style={styles.messageRow}>
                  <Text 
                    style={[
                      styles.lastMessage,
                      isUnread && styles.lastMessageUnread
                    ]} 
                    numberOfLines={1}
                  >
                    {item.lastMessage || 'No messages yet'}
                  </Text>
                  {isUnread && (
                    <View style={styles.unreadBadge}>
                      <View style={styles.unreadDot} />
                    </View>
                  )}
                </View>
              </>
            )}
          </View>
        </TouchableOpacity>
        
        {/* ✨ BEAUTIFUL SEPARATOR - Only show if not last item */}
        {index < rooms.length - 1 && (
          <View style={styles.separatorContainer}>
            <View style={styles.separator} />
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <View style={styles.centerContainer}>
          <StatusBar style='dark' />
          <View style={styles.loadingWrapper}>
            <View style={styles.loadingIcon}>
              <Ionicons name="chatbubbles" size={32} color="#7A5AF8" />
            </View>
            <Text style={styles.loadingText}>Loading your messages</Text>
          </View>
        </View>
      </ProtectedRoute>
    );
  }

  if (error && !loading) {
    return (
      <ProtectedRoute>
        <SafeWrapper>
          <StatusBar style='dark' />
          <View style={styles.centerContainer}>
            <View style={styles.errorWrapper}>
              <View style={styles.errorIcon}>
                <Ionicons name="cloud-offline-outline" size={56} color="#EF4444" />
              </View>
              <Text style={styles.errorTitle}>Connection Issue</Text>
              <Text style={styles.errorMessage}>
                We couldn't load your conversations. Please check your connection and try again.
              </Text>
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={retryFetch}
                activeOpacity={0.8}
              >
                <Ionicons name="refresh" size={20} color="#FFFFFF" />
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeWrapper>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <SafeWrapper>
        <StatusBar style='dark' />
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Messages</Text>
            <Text style={styles.headerSubtitle}>
              {rooms.length} {rooms.length === 1 ? 'conversation' : 'conversations'}
            </Text>
          </View>

          <FlatList
            data={rooms}
            keyExtractor={(item, index) => item?._id ? `room-${item._id}` : `room-${index}`}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.listContent,
              rooms.length === 0 && styles.emptyList
            ]}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconWrapper}>
                  <View style={styles.emptyIconCircle}>
                    <Ionicons name="chatbubbles-outline" size={48} color="#7A5AF8" />
                  </View>
                </View>
                <Text style={styles.emptyTitle}>No Messages Yet</Text>
                <Text style={styles.emptySubtitle}>
                  When you start a conversation about a property, it will appear here
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
          />
        </View>
      </SafeWrapper>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 32,
  },
  // ✨ NEW - Chat Item Wrapper
  chatItemWrapper: {
    backgroundColor: '#FFFFFF',
  },
  chatItem: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  chatItemUnread: {
    backgroundColor: '#F8F7FF',
    borderLeftWidth: 3,
    borderLeftColor: '#7A5AF8',
  },
  chatItemDeleted: {
    backgroundColor: '#FEF2F2',
    borderLeftWidth: 3,
    borderLeftColor: '#FCA5A5',
  },
  // ✨ NEW - Beautiful Separator Styles
  separatorContainer: {
    paddingLeft: 90, // Aligns with text, not avatar
    backgroundColor: '#FFFFFF',
  },
  separator: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },
  unreadIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#7A5AF8',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    shadowColor: '#7A5AF8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  expiredBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  userNameUnread: {
    fontWeight: '700',
    color: '#1A1A1A',
  },
  userNameDeleted: {
    color: '#DC2626',
    fontWeight: '600',
  },
  timestampUnread: {
    fontWeight: '600',
    color: '#7A5AF8',
  },
  lastMessageUnread: {
    fontWeight: '600',
    color: '#2D2D2D',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  unreadBadge: {
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#7A5AF8',
  },
  avatarDeleted: {
    opacity: 0.6,
  },
  avatarPlaceholderDeleted: {
    backgroundColor: '#FCA5A5',
  },
  avatarTextDeleted: {
    color: '#FFFFFF',
  },
  expiredContainer: {
    marginTop: 6,
  },
  expiredBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  expiredIconWrapper: {
    marginRight: 10,
  },
  expiredTextWrapper: {
    flex: 1,
  },
  expiredTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#DC2626',
    marginBottom: 2,
  },
  expiredSubtitle: {
    fontSize: 11,
    color: '#EF4444',
    fontWeight: '500',
  },
  loadingWrapper: {
    alignItems: 'center',
  },
  loadingIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F5F3FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#7A5AF8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  errorWrapper: {
    alignItems: 'center',
    maxWidth: 320,
  },
  errorIcon: {
    marginBottom: 24,
    opacity: 0.9,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7A5AF8',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    shadowColor: '#7A5AF8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  listContent: {
    paddingTop: 4,
  },
  emptyList: {
    flexGrow: 1,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#F3F4F6',
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#7A5AF8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F3F4F6',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
  },
  chatContent: {
    flex: 1,
    justifyContent: 'center',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  userName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1A1A1A',
    flex: 1,
    marginRight: 12,
  },
  timestamp: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 7,
  },
  productBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F5F3FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productName: {
    fontSize: 13,
    color: '#7A5AF8',
    fontWeight: '600',
    flex: 1,
  },
  lastMessage: {
    fontSize: 14,
    color: '#9CA3AF',
    flex: 1,
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 48,
  },
  emptyIconWrapper: {
    marginBottom: 28,
  },
  emptyIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F5F3FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7A5AF8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
});