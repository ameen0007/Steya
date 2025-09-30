import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { io } from 'socket.io-client';
import SafeWrapper from '../../services/Safewrapper';
import { StatusBar } from 'expo-status-bar';
import { useSelector } from 'react-redux';

const SOCKET_URL = 'http://192.168.1.2:8080';

// Guided chat options tree
const optionTree = {
  initial: [
    "Please share your contact info",
    "Is it available?",
    "Price negotiable?",
    "Can I visit?",
    "Any photos?"
  ],
  responses: {
    "Please share your contact info": ["Here’s my contact info", "No, can you share yours?", "No thanks"],
    "Is it available?": ["Yes, available", "Sorry, booked"],
    "Price negotiable?": ["Yes, flexible", "No, fixed"],
    "Can I visit?": ["Sure, schedule a visit", "Not possible"],
    "Any photos?": ["Yes, sending now", "Not available"]
  }
};

const ChatScreen = () => {
  const { id } = useLocalSearchParams();
  const roomId = id;
  const user = useSelector((state) => state.user.userData);
  const [messages, setMessages] = useState([]);
  const [currentOptions, setCurrentOptions] = useState(optionTree.initial);
  const [socket, setSocket] = useState(null);

  const userId = user?._id; // Replace with logged-in user ID

  useEffect(() => {
    if (!roomId) return;

    const newSocket = io(SOCKET_URL, { transports: ['websocket'] });
    setSocket(newSocket);

    newSocket.on('connect', () => console.log('✅ Connected', newSocket.id));
    newSocket.on('disconnect', () => console.log('❌ Disconnected'));

    newSocket.emit('joinRoom', { roomId });
    console.log('📥 Joining room:', roomId);

    newSocket.on('previousMessages', (prev) => setMessages(prev));
    newSocket.on('receiveMessage', (msg) => setMessages((prev) => [...prev, { ...msg, fromMe: false }]));

    return () => newSocket.disconnect();
  }, [roomId]);

  const sendOption = (option) => {
    if (!socket) return;

    // Emit to server
    socket.emit('sendMessage', { roomId, sender: userId, option });

    // Add locally
    setMessages((prev) => [...prev, { sender: userId, option, fromMe: true }]);

    // Update next options
    const next = optionTree.responses[option];
    if (next) setCurrentOptions(next);
    else setCurrentOptions(optionTree.initial); // Reset if no next
  };

  const formatTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <SafeWrapper style={styles.container}>
      <StatusBar style='dark'/>

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Chat Room</Text>
          <Text style={styles.headerSubtitle}>Room ID: {roomId}</Text>
        </View>
        <View style={styles.statusDot} />
      </View>

      {/* Messages */}
      <FlatList
        data={messages}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={styles.messageList}
        renderItem={({ item }) => (
          <View style={[styles.messageContainer, item.fromMe ? styles.myMessage : styles.theirMessage]}>
            <View style={[styles.messageBubble, item.fromMe ? styles.myBubble : styles.theirBubble]}>
              <Text style={[styles.messageText, item.fromMe ? styles.myText : styles.theirText]}>
                {item.option}
              </Text>
              <Text style={[styles.timeText, item.fromMe ? styles.myTimeText : styles.theirTimeText]}>
                {formatTime()}
              </Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyText}>No messages yet</Text>
            <Text style={styles.emptySubtext}>Send a quick reply to start the conversation</Text>
          </View>
        }
      />

      {/* Quick Reply Options */}
      <View style={styles.optionsContainer}>
        <Text style={styles.optionsTitle}>Quick Replies</Text>
        <View style={styles.optionsGrid}>
          {currentOptions.map((text, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.optionButton, { backgroundColor: '#6C5CE7' }]}
              onPress={() => sendOption(text)}
              activeOpacity={0.8}
            >
              <Text style={styles.optionText} numberOfLines={2}>
                {text}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeWrapper>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: '#6C5CE7',
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 2,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00D9A5',
  },
  messageList: {
    padding: 16,
    flexGrow: 1,
  },
  messageContainer: {
    marginVertical: 6,
    maxWidth: '80%',
  },
  myMessage: {
    alignSelf: 'flex-end',
  },
  theirMessage: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  myBubble: {
    backgroundColor: '#6C5CE7',
    borderBottomRightRadius: 4,
  },
  theirBubble: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  myText: {
    color: 'white',
  },
  theirText: {
    color: '#2D3436',
  },
  timeText: {
    fontSize: 10,
    marginTop: 4,
  },
  myTimeText: {
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'right',
  },
  theirTimeText: {
    color: '#B2BEC3',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#B2BEC3',
    textAlign: 'center',
  },
  optionsContainer: {
    backgroundColor: 'white',
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  optionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 12,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  optionButton: {
    width: '48%',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 70,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  optionIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  optionText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default ChatScreen;