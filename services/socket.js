import { io } from 'socket.io-client';


const SOCKET_URL = process.env.EXPO_PUBLIC_API_URL 

export const socket = io(SOCKET_URL, {
  autoConnect: false, // connect manually
});
