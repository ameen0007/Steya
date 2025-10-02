// ChatScreen.js - UPDATED WITH CAPSULE OPTIONS & NO PROFILE PICS IN MESSAGES
import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { 
  View, Text, TouchableOpacity, FlatList, StyleSheet, 
  ActivityIndicator, Image,  
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { io } from 'socket.io-client';
import SafeWrapper from '../../services/Safewrapper';
import { useSelector } from 'react-redux';
import { conversationTree, getNextOptions } from '../../services/chattree';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
const SOCKET_URL = 'http://192.168.1.2:8080';

const ChatScreen = () => {
  const { id: roomId } = useLocalSearchParams();
  const router = useRouter();
  const user = useSelector((state) => state.user.userData);
  const userId = user?._id;

  const [messages, setMessages] = useState([]);
  const [currentState, setCurrentState] = useState('START');
  const [userRole, setUserRole] = useState(null);
  const [currentOptions, setCurrentOptions] = useState([]);
  const [canReply, setCanReply] = useState(false);
  const [waitingFor, setWaitingFor] = useState(null);
  const [roomInfo, setRoomInfo] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [connectionError, setConnectionError] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  
  const socketRef = useRef(null);
  const flatListRef = useRef(null);
  const isInitializedRef = useRef(false);

  // Memoize socket configuration
  const socketConfig = useMemo(() => ({
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
    timeout: 10000
  }), []);

  // Extract other user from room info
  useEffect(() => {
    if (roomInfo?.participants && userId) {
      const other = roomInfo.participants.find(p => 
        String(p._id) !== String(userId)
      ) || roomInfo.participants[0];
      setOtherUser(other);
    }
  }, [roomInfo, userId]);

  // Memoized update options function
  const updateOptionsForState = useCallback((state, role) => {
    if (!role) return;

    try {
      const { canReply: userCanReply, options, waitingFor: waiting } = getNextOptions(
        state,
        role,
        conversationTree
      );

      setCanReply(userCanReply);
      setCurrentOptions(options || []);
      setWaitingFor(waiting);
      
      console.log(`🎯 Options updated for ${role} at state ${state}:`, {
        canReply: userCanReply,
        optionsCount: options?.length || 0,
        waitingFor: waiting
      });
    } catch (error) {
      console.error('❌ Error updating options:', error);
      setCanReply(false);
      setCurrentOptions([]);
    }
  }, []);

  // Socket initialization and event handling
  useEffect(() => {
    if (!roomId || !userId) {
      setConnectionError('Missing room or user information');
      setIsConnecting(false);
      return;
    }

    // Prevent duplicate initialization
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    console.log('🔌 Initializing socket connection...');
    const socket = io(SOCKET_URL, socketConfig);
    socketRef.current = socket;

    // Connection successful
    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
      setIsConnecting(false);
      setConnectionError(null);
      
      // Join room immediately after connection
      socket.emit('joinRoom', { roomId, userId });
      console.log('📨 Emitted joinRoom:', { roomId, userId });
    });

    // Receive initial room data
    socket.on('initialData', (data) => {
      console.log('📦 Initial data received:', data);
      const { messages: prevMessages, currentState: state, userRole: role, roomInfo: info } = data;
      
      setMessages(prevMessages || []);
      setCurrentState(state);
      setUserRole(role);
      setRoomInfo(info);
      
      // Update options based on received state and role
      updateOptionsForState(state, role);
      
      console.log('✅ Room initialized:', {
        messagesCount: prevMessages?.length || 0,
        currentState: state,
        userRole: role,
        roomName: info?.propertyTitle
      });
    });

    // Receive new messages
    socket.on('newMessage', ({ message, nextState }) => {
      console.log('📨 New message received:', message);
      
      setMessages(prev => {
        const messageKey = `${message.sender}-${message.createdAt}`;
        const exists = prev.some(m => 
          `${m.sender}-${m.createdAt}` === messageKey
        );
        
        if (exists) {
          console.log('⚠️ Duplicate message detected, skipping');
          return prev;
        }
        
        const newMsg = {
          ...message,
          fromMe: message.sender?.toString() === userId?.toString()
        };
        
        console.log('✅ Message added to list:', newMsg.option);
        return [...prev, newMsg];
      });

      setCurrentState(nextState);
      console.log('🔄 State transitioned to:', nextState);
    });

    // Update options when state changes
    socket.on('newMessage', ({ nextState }) => {
      updateOptionsForState(nextState, userRole);
    });

    // Connection error
    socket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error);
      setConnectionError('Connection failed. Retrying...');
      setIsConnecting(false);
    });

    // General error
    socket.on('error', (error) => {
      console.error('❌ Socket error:', error);
      setConnectionError(error.message || 'An error occurred');
    });

    // Disconnection
    socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      if (reason === 'io server disconnect') {
        socket.connect();
      }
    });

    // Cleanup
    return () => {
      console.log('🧹 Cleaning up socket connection');
      if (socketRef.current) {
        socketRef.current.emit('leaveRoom', { roomId, userId });
        socketRef.current.disconnect();
      }
      isInitializedRef.current = false;
    };
  }, [roomId, userId, socketConfig, updateOptionsForState]);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  // Update options when userRole or currentState changes
  useEffect(() => {
    if (userRole && currentState) {
      updateOptionsForState(currentState, userRole);
    }
  }, [userRole, currentState, updateOptionsForState]);

  // Memoized send option handler
  const sendOption = useCallback((option) => {
    if (!socketRef.current || !canReply) {
      console.log('⚠️ Cannot send message:', { 
        hasSocket: !!socketRef.current, 
        canReply 
      });
      return;
    }

    const messageData = {
      roomId,
      sender: userId,
      optionId: option.id,
      optionText: option.text,
      nextState: option.next,
      senderRole: userRole
    };

    console.log('📤 Sending message:', messageData);
    socketRef.current.emit('sendMessage', messageData);

    // Optimistic UI update
    setCanReply(false);
    setCurrentOptions([]);
  }, [canReply, roomId, userId, userRole]);

  // Memoized time formatter
  const formatTime = useCallback((timestamp) => {
    const date = timestamp ? new Date(timestamp) : new Date();
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }, []);

  // Memoized render item for FlatList - REMOVED PROFILE PICTURES
  const renderMessage = useCallback(({ item }) => (
    <View style={[
      styles.messageContainer, 
      item.fromMe ? styles.myMessage : styles.theirMessage
    ]}>
      <View style={[
        styles.messageBubble, 
        item.fromMe ? styles.myBubble : styles.theirBubble
      ]}>
        <Text style={[
          styles.messageText, 
          item.fromMe ? styles.myText : styles.theirText
        ]}>
          {item.option}
        </Text>
        <Text style={[
          styles.timeText, 
          item.fromMe ? styles.myTimeText : styles.theirTimeText
        ]}>
          {formatTime(item.createdAt)}
        </Text>
      </View>
    </View>
  ), [formatTime]);

  // Memoized key extractor
  const keyExtractor = useCallback((item, index) => 
    `${item.sender}-${item.createdAt}-${index}`, []
  );

  // Memoized empty component
  const EmptyComponent = useMemo(() => (
    <View style={styles.emptyState}>
      <LinearGradient
        colors={['#E9E5FF', '#F8F7FF']}
        style={styles.emptyIconBackground}
      >
        <Ionicons name="chatbubble-ellipses" size={40} color="#7A5AF8" />
      </LinearGradient>
      <Text style={styles.emptyText}>Start the conversation</Text>
      <Text style={styles.emptySubtext}>
        {userRole === 'inquirer' 
          ? 'Choose a question to ask the owner'
          : 'Wait for the inquirer to send a message'}
      </Text>
    </View>
  ), [userRole]);

  // Memoized waiting message
  const waitingMessage = useMemo(() => {
    if (waitingFor) {
      return ` Waiting for ${waitingFor === 'owner' ? 'owner' : 'inquirer'}...`;
    }
    if (currentState === 'END_CONVERSATION') {
      return '✅ Conversation complete';
    }
    return ' Waiting...';
  }, [waitingFor, currentState]);

  // Show loading state
  if (isConnecting) {
    return (
      <SafeWrapper style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.loadingContainer}>
          <LinearGradient
            colors={['#8E6AFB', '#7A5AF8']}
            style={styles.loadingIconBackground}
          >
            <Ionicons name="chatbubble-ellipses" size={32} color="#FFFFFF" />
          </LinearGradient>
          <Text style={styles.loadingText}>Connecting to chat...</Text>
        </View>
      </SafeWrapper>
    );
  }

  // Show error state
  if (connectionError && !roomInfo) {
    return (
      <SafeWrapper style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.errorContainer}>
          <LinearGradient
            colors={['#FFE5E5', '#FFFAFA']}
            style={styles.errorIconBackground}
          >
            <Ionicons name="warning" size={40} color="#FF4757" />
          </LinearGradient>
          <Text style={styles.errorTitle}>Connection Error</Text>
          <Text style={styles.errorSubtitle}>{connectionError}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              setConnectionError(null);
              setIsConnecting(true);
              isInitializedRef.current = false;
            }}
          >
            <LinearGradient
              colors={['#7A5AF8', '#8E6AFB']}
              style={styles.retryButtonGradient}
            >
              <Ionicons name="refresh" size={20} color="#FFFFFF" />
              <Text style={styles.retryButtonText}>Retry Connection</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeWrapper>
    );
  }

  return (
    <SafeWrapper style={styles.container}>
      <StatusBar style="dark"/>

      {/* HEADER */}
      <LinearGradient
        colors={['#FFFFFF', '#F8F7FF']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          {/* Back Button */}
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={28} color="#7A5AF8" />
          </TouchableOpacity>

          {/* User Info */}
          <View style={styles.userInfo}>
            <View style={styles.avatarContainer}>
              {otherUser?.picture ? (
                <Image
                  source={{ uri: otherUser.picture }}
                  style={styles.headerAvatar}
                />
              ) : (
                <View style={styles.headerAvatarFallback}>
                  <Text style={styles.headerAvatarText}>
                    {(otherUser?.name?.charAt(0) || 'U').toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={[
                styles.onlineIndicator,
                canReply ? styles.onlineActive : styles.onlineInactive
              ]} />
            </View>
            
            <View style={styles.userTextContainer}>
              <Text style={styles.userName} numberOfLines={1}>
                {otherUser?.name || 'User'}
              </Text>
              <Text style={styles.productTitle} numberOfLines={1}>
                {roomInfo?.propertyTitle || 'Property Chat'}
              </Text>
            </View>
          </View>

          {/* Status Badge */}
          <View style={[
            styles.statusBadge,
            canReply ? styles.statusActive : styles.statusWaiting
          ]}>
            <Text style={[
              styles.statusText,
              canReply ? styles.statusActiveText : styles.statusWaitingText
            ]}>
              {canReply ? 'Active' : 'Waiting'}
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.messageList}
        renderItem={renderMessage}
        ListEmptyComponent={EmptyComponent}
        removeClippedSubviews={true}
        maxToRenderPerBatch={20}
        windowSize={10}
        initialNumToRender={15}
        showsVerticalScrollIndicator={false}
      />

      {/* Options Panel - CAPSULE STYLE */}
      <View style={styles.optionsContainer}>
        {canReply && currentOptions.length > 0 ? (
          <>
            <Text style={styles.optionsTitle}>
              💬 Choose your reply
            </Text>
            <View style={styles.optionsRow}>
              {currentOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={styles.capsuleOption}
                  onPress={() => sendOption(option)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.capsuleOptionText} numberOfLines={2}>
                    {option.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : (
          <View style={styles.waitingContainer}>
            <Ionicons 
              name="time-outline" 
              size={24} 
              color="#9CA3AF" 
              style={styles.waitingIcon}
            />
            <Text style={styles.waitingText}>{waitingMessage}</Text>
          </View>
        )}
      </View>
    </SafeWrapper>
  );
};

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
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#7A5AF8',
    fontWeight: '600',
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
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A2C',
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
  },
  retryButton: {
    width: '80%',
    borderRadius: 14,
    overflow: 'hidden',
  },
  retryButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },

  // HEADER STYLES
  headerGradient: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: 'transparent',
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  headerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E5E7EB',
  },
  headerAvatarFallback: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E9E5FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerAvatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#7A5AF8',
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
  onlineActive: {
    backgroundColor: '#10B981',
  },
  onlineInactive: {
    backgroundColor: '#9CA3AF',
  },
  userTextContainer: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A2C',
    marginBottom: 2,
  },
  productTitle: {
    fontSize: 14,
    color: '#7A5AF8',
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: '#10B98120',
  },
  statusWaiting: {
    backgroundColor: '#F59E0B20',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusActiveText: {
    color: '#10B981',
  },
  statusWaitingText: {
    color: '#F59E0B',
  },

  // MESSAGE STYLES - NO PROFILE PICTURES
  messageList: {
    padding: 16,
    flexGrow: 1,
  },
  messageContainer: {
    marginBottom: 16,
  },
  myMessage: {
    alignSelf: 'flex-end',
  },
  theirMessage: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    borderRadius: 18,
    padding: 12,
    maxWidth: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  myBubble: {
    backgroundColor: '#7A5AF8',
    borderBottomRightRadius: 4,
  },
  theirBubble: {
    backgroundColor: '#F8F7FF',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  myText: {
    color: '#FFFFFF',
  },
  theirText: {
    color: '#1A1A2C',
  },
  timeText: {
    fontSize: 11,
    marginTop: 4,
  },
  myTimeText: {
    color: '#E0E0E0',
    textAlign: 'right',
  },
  theirTimeText: {
    color: '#6B7280',
  },

  // EMPTY STATE
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A2C',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 20,
  },

  // OPTIONS STYLES - CAPSULE DESIGN
  optionsContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    padding: 16,
    paddingBottom: 24,
  },
  optionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A2C',
    marginBottom: 12,
    textAlign: 'center',
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  capsuleOption: {
    backgroundColor: '#7A5AF8',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25, // Capsule shape
    marginBottom: 8,
    shadowColor: '#7A5AF8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  capsuleOptionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  waitingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F8F7FF',
    borderRadius: 12,
  },
  waitingIcon: {
    marginRight: 8,
  },
  waitingText: {
    fontSize: 15,
    color: '#6B7280',
    fontStyle: 'italic',
  },
});

export default ChatScreen;