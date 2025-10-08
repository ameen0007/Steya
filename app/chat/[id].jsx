// ChatScreen.js - UPDATED HYBRID VERSION (Enhanced)
import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { 
  View, Text, TouchableOpacity, FlatList, StyleSheet, 
  ActivityIndicator, Image, TextInput, KeyboardAvoidingView, Platform,
  RefreshControl
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { io } from 'socket.io-client';
import SafeWrapper from '../../services/Safewrapper';
import { useSelector } from 'react-redux';
import { conversationTree, getNextOptions } from '../../services/chattree';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { showToast } from '../../services/ToastService';
import { BeautifulLoader } from '../../componets/beatifullLoader';

const apiUrl = process.env.EXPO_PUBLIC_API_URL;

// Input validation helper
const validateMessage = (text) => {
  const trimmed = text.trim();
  if (!trimmed) return { isValid: false, error: 'Message cannot be empty' };
  if (trimmed.length > 500) return { isValid: false, error: 'Message too long (max 500 characters)' };
  if (trimmed.length < 1) return { isValid: false, error: 'Message too short' };
  
  // Basic sanitization
  const sanitized = trimmed.replace(/[<>]/g, '');
  return { isValid: true, sanitized };
};

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
  
  // Enhanced state management
  const [isConnected, setIsConnected] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  
  const socketRef = useRef(null);
  const flatListRef = useRef(null);
  const isInitializedRef = useRef(false);
  const inputRef = useRef(null);
  const scrollTimeoutRef = useRef(null);

  const socketConfig = useMemo(() => ({
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
    timeout: 10000
  }), []);

  // Check if all essential data is loaded
  const isDataLoaded = useMemo(() => {
    return (
      !isConnecting && 
      roomInfo !== null && 
      otherUser !== null && 
      userRole !== null &&
      userId !== null
    );
  }, [isConnecting, roomInfo, otherUser, userRole, userId]);

  // Enhanced connection monitoring
  useEffect(() => {
    if (roomInfo?.participants && userId) {
      const other = roomInfo.participants.find(p => 
        String(p._id) !== String(userId)
      ) || roomInfo.participants[0];
      setOtherUser(other);
    }
  }, [roomInfo, userId]);

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
    } catch (error) {
      console.error('❌ Error updating options:', error);
      setCanReply(false);
      setCurrentOptions([]);
    }
  }, []);

  // Enhanced socket connection with better error handling
  useEffect(() => {
    if (!roomId || !userId) {
      setConnectionError('Missing room or user information');
      setIsConnecting(false);
      return;
    }

    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    const socket = io(apiUrl, socketConfig);
    
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ Socket connected');
      setIsConnected(true);
      setIsConnecting(false);
      setConnectionError(null);
      socket.emit('joinRoom', { roomId, userId });
      socket.emit('userOnline', { userId });
    });

    socket.on('initialData', (data) => {
      const { messages: prevMessages, currentState: state, userRole: role, roomInfo: info } = data;
      
      setMessages(prevMessages || []);
      setCurrentState(state);
      setUserRole(role);
      setRoomInfo(info);
      updateOptionsForState(state, role);
    });

    socket.on('newMessage', ({ message, nextState }) => {
      setMessages(prev => {
        // Enhanced deduplication
        const messageKey = `${message.sender}-${message.createdAt}-${message.optionId || message.text?.substring(0,20)}`;
        const exists = prev.some(m => 
          `${m.sender}-${m.createdAt}-${m.optionId || m.text?.substring(0,20)}` === messageKey
        );
        
        if (exists) return prev;
        
        const newMsg = {
          ...message,
          fromMe: message.sender?.toString() === userId?.toString()
        };
        
        return [...prev, newMsg];
      });

      if (nextState) {
        setCurrentState(nextState);
      }
    });

    socket.on('connect_error', (error) => {
      console.log('❌ Connection error:', error);
      setIsConnected(false);
      setConnectionError('Connection failed. Retrying...');
      setIsConnecting(false);
    });

    socket.on('error', (error) => {
      console.log('❌ Socket error:', error);
      setConnectionError(error.message || 'An error occurred');
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      setIsConnected(false);
      if (reason === 'io server disconnect') {
        socket.connect();
      }
    });

    // Cleanup function
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.emit('leaveRoom', { roomId, userId });
        socketRef.current.disconnect();
      }
      isInitializedRef.current = false;
    };
  }, [roomId, userId, socketConfig, updateOptionsForState]);

  // Enhanced scroll with cleanup
  useEffect(() => {
    if (messages.length > 0) {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }

    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [messages.length]);

  useEffect(() => {
    if (userRole && currentState) {
      updateOptionsForState(currentState, userRole);
    }
  }, [userRole, currentState, updateOptionsForState]);

  // Enhanced refresh function
  const refreshChat = useCallback(() => {
    if (!socketRef.current) return;
    
    setIsRefreshing(true);
    socketRef.current.emit('joinRoom', { roomId, userId });
    
    // Auto-stop refreshing after 3 seconds
    setTimeout(() => setIsRefreshing(false), 3000);
  }, [roomId, userId]);

  // Enhanced send option with connection check
  const sendOption = useCallback((option) => {
    if (!socketRef.current || !canReply || !isConnected) {
      setConnectionError('No connection. Please check your internet.');
      return;
    }

    const messageData = {
      roomId,
      sender: userId,
      optionId: option.id,
      optionText: option.text,
      nextState: option.next,
      senderRole: userRole,
      messageType: 'option'
    };

    socketRef.current.emit('sendMessage', messageData);
    setCanReply(false);
    setCurrentOptions([]);
  }, [canReply, roomId, userId, userRole, isConnected]);

  // Enhanced send free-text with validation
  const sendFreeText = useCallback(() => {
    // Connection check
    if (!socketRef.current || !isConnected) {
      setConnectionError('No connection. Please check your internet.');
      return;
    }

    // Validation
    const validation = validateMessage(messageInput);
    if (!validation.isValid) {
     showToast('Invalid Message', validation.error);
      return;
    }

    if (isSending) return;

    setIsSending(true);

    const messageData = {
      roomId,
      sender: userId,
      text: validation.sanitized,
      senderRole: userRole,
      messageType: 'freetext',
      nextState: currentState
    };

    socketRef.current.emit('sendMessage', messageData);
    
    setMessageInput('');
    setIsSending(false);
    inputRef.current?.blur();
  }, [messageInput, roomId, userId, userRole, currentState, isSending, isConnected]);

  const formatTime = useCallback((timestamp) => {
    const date = timestamp ? new Date(timestamp) : new Date();
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }, []);

  // Enhanced message render with error boundary
  const renderMessage = useCallback(({ item }) => {
    try {
      const displayText = item.messageType === 'freetext' ? item.text : item.option;
      
      return (
        <View style={[
          styles.messageContainer, 
          item.fromMe ? styles.myMessage : styles.theirMessage
        ]}>
          <View style={[
            styles.messageBubble, 
            item.fromMe ? styles.myBubble : styles.theirBubble
          ]}>
            {item.messageType === 'option' && (
              <View style={styles.optionIndicator}>
                <Ionicons name="options-outline" size={12} color={item.fromMe ? "#FFFFFF" : "#7A5AF8"} />
              </View>
            )}
            <Text style={[
              styles.messageText, 
              item.fromMe ? styles.myText : styles.theirText
            ]}>
              {displayText}
            </Text>
            <Text style={[
              styles.timeText, 
              item.fromMe ? styles.myTimeText : styles.theirTimeText
            ]}>
              {formatTime(item.createdAt)}
            </Text>
          </View>
        </View>
      );
    } catch (error) {
      console.error('Error rendering message:', error);
      return (
        <View style={styles.errorMessageContainer}>
          <Text style={styles.errorMessageText}>Error displaying message</Text>
        </View>
      );
    }
  }, [formatTime]);

  const keyExtractor = useCallback((item, index) => 
    `${item.sender}-${item.createdAt}-${item.optionId || 'text'}-${index}`, []
  );

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
        Choose a quick reply or type your message
      </Text>
    </View>
  ), []);

  // Show full page loader until all data is ready
  if (!isDataLoaded || isConnecting) {
    return (
      <SafeWrapper style={styles.container}>
        <StatusBar style="dark" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
          <BeautifulLoader/>

        </View>
      </SafeWrapper>
    );
  }

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
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* HEADER */}
        <LinearGradient
          colors={['#FFFFFF', '#F8F7FF']}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
              accessibilityLabel="Go back"
              accessibilityRole="button"
            >
              <Ionicons name="chevron-back" size={28} color="#7A5AF8" />
            </TouchableOpacity>

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
                  isConnected ? styles.onlineActive : styles.onlineInactive
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

            <View style={[
              styles.statusBadge,
              isConnected ? styles.statusActive : styles.statusWaiting
            ]}>
              <Text style={[
                styles.statusText,
                isConnected ? styles.statusActiveText : styles.statusWaitingText
              ]}>
                {isConnected ? 'Online' : 'Offline'}
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
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refreshChat}
              colors={['#7A5AF8']}
              tintColor={'#7A5AF8'}
            />
          }
        />

        {/* Connection Status Banner */}
        {!isConnected && (
          <View style={styles.connectionBanner}>
            <Ionicons name="cloud-offline" size={16} color="#FFFFFF" />
            <Text style={styles.connectionBannerText}>
              No connection. Attempting to reconnect...
            </Text>
          </View>
        )}

        {/* Input Area - HYBRID: Options + Text Input */}
        <View style={styles.inputWrapper}>
          {/* Quick Reply Options */}
          {canReply && currentOptions.length > 0 && (
            <View style={styles.quickRepliesContainer}>
              <Text style={styles.quickRepliesLabel}>Quick replies:</Text>
              <View style={styles.optionsRow}>
                {currentOptions.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={styles.capsuleOption}
                    onPress={() => sendOption(option)}
                    activeOpacity={0.7}
                    accessibilityLabel={`Quick reply: ${option.text}`}
                    accessibilityRole="button"
                  >
                    <Text style={styles.capsuleOptionText} numberOfLines={2}>
                      {option.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Text Input Area - Always visible */}
          <View style={styles.inputContainer}>
            <View style={styles.inputRow}>
              <TextInput
                ref={inputRef}
                style={styles.textInput}
                placeholder="Type your message..."
                placeholderTextColor="#9CA3AF"
                value={messageInput}
                onChangeText={setMessageInput}
                multiline
                maxLength={500}
                editable={!isSending && isConnected}
                accessibilityLabel="Message input"
                accessibilityHint="Type your message here. Press send button when done."
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!messageInput.trim() || isSending || !isConnected) && styles.sendButtonDisabled
                ]}
                onPress={sendFreeText}
                disabled={!messageInput.trim() || isSending || !isConnected}
                accessibilityLabel={`Send message: ${messageInput}`}
                accessibilityRole="button"
              >
                {isSending ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons 
                    name="send" 
                    size={20} 
                    color={messageInput.trim() && isConnected ? "#FFFFFF" : "#9CA3AF"} 
                  />
                )}
              </TouchableOpacity>
            </View>
            <Text style={styles.charCount}>
              {messageInput.length}/500
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: Platform.OS === 'ios' ? 50 : 12,
  },
  backButton: {
    padding: 4,
    marginRight: 8,
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
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  headerAvatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#7A5AF8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerAvatarText: {
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
  onlineActive: {
    backgroundColor: '#10B981',
  },
  onlineInactive: {
    backgroundColor: '#6B7280',
  },
  userTextContainer: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 2,
  },
  productTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: '#D1FAE5',
  },
  statusWaiting: {
    backgroundColor: '#F3F4F6',
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  statusActiveText: {
    color: '#065F46',
  },
  statusWaitingText: {
    color: '#6B7280',
  },
  messageList: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  emptyState: {
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
  emptyText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  messageContainer: {
    marginVertical: 4,
  },
  myMessage: {
    alignItems: 'flex-end',
  },
  theirMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  myBubble: {
    backgroundColor: '#7A5AF8',
    borderBottomRightRadius: 4,
  },
  theirBubble: {
    backgroundColor: '#F3F4F6',
    borderBottomLeftRadius: 4,
  },
  optionIndicator: {
    marginRight: 6,
    marginBottom: 2,
  },
  messageText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    flex: 1,
    lineHeight: 20,
  },
  myText: {
    color: '#FFFFFF',
  },
  theirText: {
    color: '#1F2937',
  },
  timeText: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    marginLeft: 8,
    marginTop: 4,
  },
  myTimeText: {
    color: '#E5E7EB',
  },
  theirTimeText: {
    color: '#9CA3AF',
  },
  errorMessageContainer: {
    padding: 16,
    margin: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorMessageText: {
    color: '#DC2626',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  connectionBanner: {
    backgroundColor: '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  connectionBannerText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginLeft: 8,
  },
  inputWrapper: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
  },
  quickRepliesContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  quickRepliesLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginBottom: 8,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  capsuleOption: {
    backgroundColor: '#F8F7FF',
    borderWidth: 1,
    borderColor: '#7A5AF8',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    marginBottom: 8,
  },
  capsuleOptionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#7A5AF8',
    textAlign: 'center',
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 12,
    maxHeight: 100,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
    marginRight: 8,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#7A5AF8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  charCount: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 4,
    marginRight: 8,
  },
});

export default ChatScreen;