import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { 
  View, Text, TouchableOpacity, FlatList, StyleSheet, 
  ActivityIndicator, Image, TextInput, KeyboardAvoidingView, Platform,
  RefreshControl, Modal, Animated, TouchableWithoutFeedback
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
  
  const sanitized = trimmed.replace(/[<>]/g, '');
  return { isValid: true, sanitized };
};

// Generate unique ID for messages
const generateMessageId = () => {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Beautiful Delete Modal Component
const DeleteMessageModal = ({ visible, onClose, onConfirm, messageText }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true
        })
      ]).start();
    } else {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.modalOverlay, { opacity: opacityAnim }]}>
          <TouchableWithoutFeedback>
            <Animated.View style={[
              styles.modalContent,
              { transform: [{ scale: scaleAnim }] }
            ]}>
              <View style={styles.modalIconContainer}>
                <LinearGradient
                  colors={['#FEE2E2', '#FEF2F2']}
                  style={styles.modalIconGradient}
                >
                  <Ionicons name="trash-outline" size={32} color="#DC2626" />
                </LinearGradient>
              </View>

              <Text style={styles.modalTitle}>Delete Message?</Text>
              <Text style={styles.modalSubtitle}>
                This message will be permanently removed
              </Text>

              {messageText && (
                <View style={styles.messagePreviewContainer}>
                  <Text style={styles.messagePreviewText} numberOfLines={2}>
                    "{messageText}"
                  </Text>
                </View>
              )}

              <View style={styles.modalButtonsContainer}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={onClose}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.deleteButton]}
                  onPress={onConfirm}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#DC2626', '#EF4444']}
                    style={styles.deleteButtonGradient}
                  >
                    <Ionicons name="trash" size={18} color="#FFFFFF" />
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
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
  
  const [isConnected, setIsConnected] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [onlineStatus, setOnlineStatus] = useState({});
  
  // Delete message states
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // WhatsApp-like scroll states
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  
  const socketRef = useRef(null);
  const flatListRef = useRef(null);
  const isInitializedRef = useRef(false);
  const inputRef = useRef(null);
  const scrollTimeoutRef = useRef(null);
  const longPressTimer = useRef(null);
  
  // WhatsApp-like scroll refs
  const shouldAutoScrollRef = useRef(true);
  const hasInitialScrolledRef = useRef(false);
  const isNearBottomRef = useRef(true);
  const scrollOffsetRef = useRef(0);
  const contentHeightRef = useRef(0);
  const layoutHeightRef = useRef(0);

  const socketConfig = useMemo(() => ({
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
    timeout: 10000
  }), []);

  const isDataLoaded = useMemo(() => {
    return (
      !isConnecting && 
      roomInfo !== null && 
      otherUser !== null && 
      userRole !== null &&
      userId !== null
    );
  }, [isConnecting, roomInfo, otherUser, userRole, userId]);

  const isOtherUserOnline = useMemo(() => {
    if (!otherUser || !otherUser._id) return false;
    
    const otherUserId = otherUser._id.toString();
    const currentUserId = userId?.toString();
    
    if (otherUserId === currentUserId) {
      return false;
    }
    
    const isOnline = onlineStatus[otherUserId];
    return Boolean(isOnline);
  }, [otherUser, onlineStatus, userId]);

  useEffect(() => {
    if (roomInfo?.participants && userId) {
      const other = roomInfo.participants.find(p => {
        const participantId = p._id?.toString();
        const currentUserId = userId?.toString();
        return participantId !== currentUserId;
      }) || roomInfo.participants[0];
      
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

  // Socket connection setup
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
     socket.emit('markAsRead', { roomId, userId });
  
      setTimeout(() => {
        socket.emit('getOnlineStatus', { roomId, userId });
      }, 500);
    });

    socket.on('initialData', (data) => {
      const { messages: prevMessages, currentState: state, userRole: role, roomInfo: info, onlineStatuses } = data;
      
      // Add unique IDs to messages if they don't have them
      const messagesWithIds = (prevMessages || []).map(msg => ({
        ...msg,
        uniqueId: msg.uniqueId || generateMessageId()
      }));
      
      setMessages(messagesWithIds);
      setCurrentState(state);
      setUserRole(role);
      setRoomInfo(info);
      
      if (onlineStatuses) {
        setOnlineStatus(onlineStatuses);
      }
      
      updateOptionsForState(state, role);
      
      // WhatsApp-like behavior: Scroll to bottom initially but only once
      if (messagesWithIds.length > 0 && !hasInitialScrolledRef.current) {
        hasInitialScrolledRef.current = true;
        
        // Small delay to ensure layout is ready
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: false });
        }, 100);
      }
    });

    socket.on('newMessage', ({ message, nextState }) => {
      setMessages(prev => {
        const exists = prev.some(m => 
          m.sender?.toString() === message.sender?.toString() && 
          m.createdAt === message.createdAt
        );
        
        if (exists) return prev;
        
        const newMsg = {
          ...message,
          fromMe: message.sender?.toString() === userId?.toString(),
          uniqueId: generateMessageId() // Add unique ID for new messages
        };
        
        return [...prev, newMsg];
      });

      if (nextState) {
        setCurrentState(nextState);
        updateOptionsForState(nextState, userRole);
      }
    });

    // Listen for message deletion
    socket.on('messageDeleted', ({ messageId, roomId: deletedRoomId }) => {
      console.log('🗑️ Message deleted:', messageId);
      
      if (deletedRoomId === roomId) {
        setMessages(prev => prev.filter(msg => 
          msg.uniqueId !== messageId && 
          msg._id?.toString() !== messageId
        ));
      }
    });

    socket.on('onlineStatuses', (data) => {
      if (data.statuses) {
        setOnlineStatus(data.statuses);
      }
    });

    socket.on('userStatusUpdate', ({ userId: updatedUserId, isOnline }) => {
      setOnlineStatus(prev => ({
        ...prev,
        [updatedUserId]: isOnline
      }));
    });

    socket.on('error', (error) => {
      console.log('❌ Socket error:', error);
      setConnectionError(error.message || 'An error occurred');
      showToast('An error occurred');
      
      // If it's a deletion error, reset the delete state
      if (error.message?.includes('delete')) {
        setShowDeleteModal(false);
        setSelectedMessage(null);
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      setIsConnected(false);
    });

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

  // WhatsApp-like auto-scrolling when messages change
  useEffect(() => {
    if (messages.length > 0 && isNearBottomRef.current) {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      scrollTimeoutRef.current = setTimeout(() => {
        // Only auto-scroll if user is near the bottom
        if (isNearBottomRef.current) {
          flatListRef.current?.scrollToEnd({ animated: true });
        }
      }, 100);
    }

    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [messages.length]);

  // Enhanced scroll event handlers for WhatsApp-like behavior
  const handleScroll = useCallback((event) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 100; // Increased threshold for "near bottom"
    
    // Update refs for scroll position tracking
    scrollOffsetRef.current = contentOffset.y;
    contentHeightRef.current = contentSize.height;
    layoutHeightRef.current = layoutMeasurement.height;
    
    // User is considered "near bottom" if within 100px of the bottom
    const isNearBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
    isNearBottomRef.current = isNearBottom;
    
    // Show/hide scroll to bottom button
    setShowScrollToBottom(!isNearBottom && messages.length > 3);
  }, [messages.length]);

  const handleScrollBeginDrag = useCallback(() => {
    // User started scrolling manually - disable auto-scroll temporarily
    isNearBottomRef.current = false;
  }, []);

  const handleScrollEndDrag = useCallback((event) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 50;
    
    // If user releases scroll near bottom, re-enable auto-scroll
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
      isNearBottomRef.current = true;
      
      // Smooth scroll to exact bottom when user releases near bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 300);
    }
  }, []);

  const handleMomentumScrollEnd = useCallback((event) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 30;
    
    // After momentum scroll ends, check if we're at bottom
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
      isNearBottomRef.current = true;
      setShowScrollToBottom(false);
    }
  }, []);

  // Manual scroll to bottom function (like WhatsApp's scroll to bottom button)
  const scrollToBottom = useCallback(() => {
    isNearBottomRef.current = true;
    setShowScrollToBottom(false);
    flatListRef.current?.scrollToEnd({ animated: true });
  }, []);

  const refreshChat = useCallback(() => {
    if (!socketRef.current) return;
    
    setIsRefreshing(true);
    socketRef.current.emit('joinRoom', { roomId, userId })
    ; socketRef.current.emit('markAsRead', { roomId, userId });
    socketRef.current.emit('getOnlineStatus', { roomId, userId });
    
    setTimeout(() => setIsRefreshing(false), 3000);
  }, [roomId, userId]);

  // Enhanced Delete Message Handler with immediate UI update
  const handleDeleteMessage = useCallback(async () => {
    if (!selectedMessage || !socketRef.current || isDeleting) return;

    // Store the message to be deleted for immediate UI update
    const messageToDelete = selectedMessage;
    
    // Create a composite identifier
    const messageIdentifier = {
      roomId,
      sender: userId,
      createdAt: selectedMessage.createdAt,
      text: selectedMessage.messageType === 'freetext' ? selectedMessage.text : selectedMessage.option,
      messageType: selectedMessage.messageType
    };

    console.log('🗑️ Attempting to delete message with identifier:', messageIdentifier);

    setIsDeleting(true);

    try {
      // IMMEDIATELY REMOVE FROM UI - No waiting for server response
      setMessages(prev => prev.filter(msg => 
        msg.uniqueId !== messageToDelete.uniqueId && 
        !(
          msg.sender?.toString() === messageToDelete.sender?.toString() &&
          msg.createdAt === messageToDelete.createdAt &&
          (
            (msg.messageType === 'freetext' && msg.text === messageToDelete.text) ||
            (msg.messageType === 'option' && msg.option === messageToDelete.option)
          )
        )
      ));

      // Then emit the deletion to server
      socketRef.current.emit('deleteMessage', {
        roomId,
        messageIdentifier,
        userId
      });

      setShowDeleteModal(false);
      setSelectedMessage(null);
      showToast('Message deleted successfully');
      
    } catch (error) {
      console.error('❌ Error deleting message:', error);
      showToast('Failed to delete message');
      
      // If there was an error, refresh to get the correct state
      refreshChat();
    } finally {
      setIsDeleting(false);
    }
  }, [selectedMessage, roomId, userId, isDeleting, refreshChat]);

  // Enhanced socket message deletion handler
  useEffect(() => {
    if (!socketRef.current) return;

    // Listen for message deletion confirmation from server
    socketRef.current.on('messageDeleted', ({ messageId, roomId: deletedRoomId }) => {
      console.log('🗑️ Message deleted confirmation received:', messageId);
      
      if (deletedRoomId === roomId) {
        // This is just a backup - the UI should already be updated
        setMessages(prev => prev.filter(msg => 
          msg.uniqueId !== messageId && 
          msg._id?.toString() !== messageId
        ));
      }
    });

    return () => {
      socketRef.current?.off('messageDeleted');
    };
  }, [roomId]);

  // Long Press Handler
  const handleLongPress = useCallback((message) => {
    // Only allow deletion of own messages
    if (message.sender?.toString() !== userId?.toString()) {
      return;
    }

    console.log('📱 Long press on message:', {
      messageText: message.messageType === 'freetext' ? message.text : message.option,
      createdAt: message.createdAt,
      sender: message.sender
    });

    setSelectedMessage(message);
    setShowDeleteModal(true);
  }, [userId]);

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

  const sendFreeText = useCallback(() => {
    if (!socketRef.current || !isConnected) {
      setConnectionError('No connection. Please check your internet.');
      return;
    }

    const validation = validateMessage(messageInput);
    if (!validation.isValid) {
      showToast('Invalid Message');
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

  const renderMessage = useCallback(({ item }) => {
    try {
      const displayText = item.messageType === 'freetext' ? item.text : item.option;
      const isMyMessage = item.fromMe || item.sender?.toString() === userId?.toString();
      
      return (
        <TouchableOpacity
          activeOpacity={0.9}
          onLongPress={() => handleLongPress(item)}
          delayLongPress={500}
        >
          <View style={[
            styles.messageContainer, 
            isMyMessage ? styles.myMessage : styles.theirMessage
          ]}>
            <View style={[
              styles.messageBubble, 
              isMyMessage ? styles.myBubble : styles.theirBubble
            ]}>
              <Text style={[
                styles.messageText, 
                isMyMessage ? styles.myText : styles.theirText
              ]}>
                {displayText}
              </Text>
              <Text style={[
                styles.timeText, 
                isMyMessage ? styles.myTimeText : styles.theirTimeText
              ]}>
                {formatTime(item.createdAt)}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    } catch (error) {
      console.error('Error rendering message:', error);
      return null;
    }
  }, [formatTime, handleLongPress, userId]);

  const keyExtractor = useCallback((item, index) => 
    item.uniqueId || `${item.sender}-${item.createdAt}-${index}`, []
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

  if (!isDataLoaded || isConnecting) {
    return (
      <SafeWrapper style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.loadingContainer}>
          <BeautifulLoader/>
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
                  isOtherUserOnline ? styles.onlineActive : styles.onlineInactive
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
              isOtherUserOnline ? styles.statusActive : styles.statusWaiting
            ]}>
              <Text style={[
                styles.statusText,
                isOtherUserOnline ? styles.statusActiveText : styles.statusWaitingText
              ]}>
                {isOtherUserOnline ? 'Online' : 'Offline'}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Messages List Container */}
        <View style={styles.chatContainer}>
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
            onScroll={handleScroll}
            onScrollBeginDrag={handleScrollBeginDrag}
            onScrollEndDrag={handleScrollEndDrag}
            onMomentumScrollEnd={handleMomentumScrollEnd}
            scrollEventThrottle={16}
            onContentSizeChange={() => {
              // Auto-scroll only when user is near bottom
              if (messages.length > 0 && isNearBottomRef.current) {
                setTimeout(() => {
                  flatListRef.current?.scrollToEnd({ animated: false });
                }, 50);
              }
            }}
            onLayout={() => {
              // Initial scroll to bottom only
              if (messages.length > 0 && !hasInitialScrolledRef.current) {
                hasInitialScrolledRef.current = true;
                setTimeout(() => {
                  flatListRef.current?.scrollToEnd({ animated: false });
                }, 100);
              }
            }}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={refreshChat}
                colors={['#7A5AF8']}
                tintColor={'#7A5AF8'}
              />
            }
          />

          {/* WhatsApp-like Scroll to Bottom Button */}
          {showScrollToBottom && (
            <TouchableOpacity
              style={styles.scrollToBottomButton}
              onPress={scrollToBottom}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#7A5AF8', '#6B46C1']}
                style={styles.scrollButtonGradient}
              >
                <Ionicons name="chevron-down" size={24} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>

        {/* Connection Status Banner */}
        {!isConnected && (
          <View style={styles.connectionBanner}>
            <Ionicons name="cloud-offline" size={16} color="#FFFFFF" />
            <Text style={styles.connectionBannerText}>
              No connection. Attempting to reconnect...
            </Text>
          </View>
        )}

        {/* Input Area */}
        <View style={styles.inputWrapper}>
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
                  >
                    <Text style={styles.capsuleOptionText} numberOfLines={2}>
                      {option.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

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
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!messageInput.trim() || isSending || !isConnected) && styles.sendButtonDisabled
                ]}
                onPress={sendFreeText}
                disabled={!messageInput.trim() || isSending || !isConnected}
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

        {/* Delete Message Modal */}
        <DeleteMessageModal
          visible={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedMessage(null);
          }}
          onConfirm={handleDeleteMessage}
          messageText={
            selectedMessage?.messageType === 'freetext' 
              ? selectedMessage?.text 
              : selectedMessage?.option
          }
        />
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
  chatContainer: {
    flex: 1,
    position: 'relative',
  },
  headerGradient: {
    paddingTop: 10,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
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
    fontWeight: 'bold',
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
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  productTitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusActive: {
    backgroundColor: '#D1FAE5',
  },
  statusWaiting: {
    backgroundColor: '#F3F4F6',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
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
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  messageContainer: {
    marginVertical: 4,
    flexDirection: 'row',
  },
  myMessage: {
    justifyContent: 'flex-end',
  },
  theirMessage: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    position: 'relative',
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
    position: 'absolute',
    top: 18,
    left: 12,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  myText: {
    color: '#FFFFFF',
  },
  theirText: {
    color: '#374151',
  },
  timeText: {
    fontSize: 11,
    marginTop: 4,
    opacity: 0.7,
  },
  myTimeText: {
    color: '#E5E7EB',
    textAlign: 'right',
  },
  theirTimeText: {
    color: '#6B7280',
    textAlign: 'left',
  },
  // WhatsApp-like Scroll to Bottom Button
  scrollToBottomButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 1000,
  },
  scrollButtonGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  connectionBanner: {
    backgroundColor: '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  connectionBannerText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
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
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 8,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  capsuleOption: {
    backgroundColor: '#F8F7FF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  capsuleOptionText: {
    color: '#7A5AF8',
    fontSize: 14,
    fontWeight: '500',
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
    backgroundColor: '#F3F4F6',
  },
  charCount: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 4,
    marginRight: 8,
  },
  // Delete Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalIconContainer: {
    marginBottom: 16,
  },
  modalIconGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  messagePreviewContainer: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    width: '100%',
  },
  messagePreviewText: {
    fontSize: 14,
    color: '#374151',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 14,
  },
  deleteButton: {
    borderRadius: 12,
  },
  deleteButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ChatScreen;