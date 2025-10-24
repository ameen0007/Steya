// redux/slices/chatSlice.js
import { createSlice } from '@reduxjs/toolkit';

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    hasUnread: false,
    unreadCount: 0,
    unreadRooms: []
  },
  reducers: {
    setUnreadStatus: (state, action) => {
      state.hasUnread = action.payload.hasUnread;
      state.unreadCount = action.payload.count;
      state.unreadRooms = action.payload.unreadRooms || [];
    },
    markRoomAsRead: (state, action) => {
      const roomId = action.payload;
      state.unreadRooms = state.unreadRooms.filter(id => id !== roomId);
      state.unreadCount = Math.max(0, state.unreadCount - 1);
      state.hasUnread = state.unreadCount > 0;
    },
    updateRoomUnreadStatus: (state, action) => {
      // This will be used for real-time updates from socket
      const { roomId, hasUnread } = action.payload;
      if (hasUnread && !state.unreadRooms.includes(roomId)) {
        state.unreadRooms.push(roomId);
        state.unreadCount++;
      } else if (!hasUnread) {
        state.unreadRooms = state.unreadRooms.filter(id => id !== roomId);
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
      state.hasUnread = state.unreadCount > 0;
    }
  }
});

export const { setUnreadStatus, markRoomAsRead, updateRoomUnreadStatus } = chatSlice.actions;
export default chatSlice.reducer;