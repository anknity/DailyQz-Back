/**
 * Socket.io Handler — Interview rooms, WebRTC signaling, chat, notifications
 * Handles all real-time events for the DailyQ interview system
 */
const roomManager = require('./roomManager');

// Track socket => user mapping
const socketUserMap = new Map();

/**
 * Initialize socket event handlers
 * @param {import('socket.io').Server} io
 */
function initSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // ─────────────── AUTHENTICATION ───────────────
    socket.on('authenticate', ({ userId, displayName, photoUrl }) => {
      socketUserMap.set(socket.id, { userId, displayName, photoUrl });
      socket.userId = userId;
      socket.displayName = displayName;
      socket.photoUrl = photoUrl;
      console.log(`✅ Authenticated: ${displayName} (${userId})`);
      socket.emit('authenticated', { success: true });
    });

    // ─────────────── ROOM EVENTS ───────────────

    // Create a new interview room
    socket.on('create-room', ({ title }, callback) => {
      const user = socketUserMap.get(socket.id);
      if (!user) return callback?.({ error: 'Not authenticated' });

      const room = roomManager.createRoom({
        hostId: user.userId,
        hostName: user.displayName,
        hostPhoto: user.photoUrl,
        title,
      });

      // Auto-join the creator
      const joinResult = roomManager.joinRoom(room.id, {
        userId: user.userId,
        displayName: user.displayName,
        photoUrl: user.photoUrl,
        socketId: socket.id,
      });

      socket.join(room.id);
      console.log(`🏠 Room created: ${room.id} by ${user.displayName}`);

      // Broadcast to all connected users (for listing page)
      io.emit('interview-created', {
        roomId: room.id,
        title: room.title,
        hostName: room.hostName,
        createdAt: room.createdAt,
      });

      callback?.({ room: joinResult.room, participant: joinResult.participant });
    });

    // Join an existing room
    socket.on('join-room', ({ roomId }, callback) => {
      const user = socketUserMap.get(socket.id);
      if (!user) return callback?.({ error: 'Not authenticated' });

      const result = roomManager.joinRoom(roomId, {
        userId: user.userId,
        displayName: user.displayName,
        photoUrl: user.photoUrl,
        socketId: socket.id,
      });

      if (result.error) return callback?.({ error: result.error });

      socket.join(roomId);

      // Notify other participants
      socket.to(roomId).emit('user-joined', {
        participant: result.participant,
        roomId,
      });

      // Notify room about participant joined
      socket.to(roomId).emit('participant-joined', {
        displayName: user.displayName,
        photoUrl: user.photoUrl,
        timestamp: new Date().toISOString(),
      });

      console.log(`👋 ${user.displayName} joined room ${roomId}${result.reconnected ? ' (reconnected)' : ''}`);
      callback?.({ room: result.room, participant: result.participant });
    });

    // Leave room
    socket.on('leave-room', ({ roomId }) => {
      handleLeaveRoom(socket, io, roomId);
    });

    // End interview (host only)
    socket.on('end-room', ({ roomId }, callback) => {
      const user = socketUserMap.get(socket.id);
      if (!user) return callback?.({ error: 'Not authenticated' });

      const result = roomManager.endRoom(roomId, user.userId);
      if (!result) return callback?.({ error: 'Room not found' });
      if (result.error) return callback?.({ error: result.error });

      io.to(roomId).emit('interview-ended', {
        roomId,
        endedBy: user.displayName,
        endedAt: result.endedAt,
      });

      callback?.({ success: true });
    });

    // Get room info
    socket.on('get-room', ({ roomId }, callback) => {
      const room = roomManager.getRoom(roomId);
      callback?.({ room });
    });

    // Get active rooms
    socket.on('get-active-rooms', (callback) => {
      const rooms = roomManager.getActiveRooms();
      callback?.({ rooms });
    });

    // ─────────────── WEBRTC SIGNALING ───────────────

    // Relay WebRTC offer
    socket.on('offer', ({ roomId, targetSocketId, offer }) => {
      socket.to(targetSocketId).emit('offer', {
        offer,
        senderSocketId: socket.id,
        senderName: socket.displayName,
      });
    });

    // Relay WebRTC answer
    socket.on('answer', ({ roomId, targetSocketId, answer }) => {
      socket.to(targetSocketId).emit('answer', {
        answer,
        senderSocketId: socket.id,
      });
    });

    // Relay ICE candidate
    socket.on('ice-candidate', ({ roomId, targetSocketId, candidate }) => {
      socket.to(targetSocketId).emit('ice-candidate', {
        candidate,
        senderSocketId: socket.id,
      });
    });

    // ─────────────── MEDIA STATE ───────────────

    socket.on('media-state-change', ({ roomId, isMuted, isCameraOff, isScreenSharing }) => {
      const participant = roomManager.updateParticipantMedia(roomId, socket.id, {
        isMuted,
        isCameraOff,
        isScreenSharing,
      });
      if (participant) {
        socket.to(roomId).emit('participant-media-changed', {
          socketId: socket.id,
          isMuted: participant.isMuted,
          isCameraOff: participant.isCameraOff,
          isScreenSharing: participant.isScreenSharing,
        });
      }
    });

    // ─────────────── CHAT EVENTS ───────────────

    socket.on('send-message', ({ roomId, text }, callback) => {
      const user = socketUserMap.get(socket.id);
      if (!user) return callback?.({ error: 'Not authenticated' });

      const message = roomManager.addMessage(roomId, {
        senderId: user.userId,
        senderName: user.displayName,
        senderPhoto: user.photoUrl,
        text,
      });

      if (!message) return callback?.({ error: 'Room not found' });

      io.to(roomId).emit('receive-message', message);
      callback?.({ success: true, message });
    });

    socket.on('typing', ({ roomId }) => {
      const user = socketUserMap.get(socket.id);
      if (user) {
        socket.to(roomId).emit('typing', {
          userId: user.userId,
          displayName: user.displayName,
        });
      }
    });

    // ─────────────── EMOJI REACTIONS ───────────────

    socket.on('send-reaction', ({ roomId, emoji }) => {
      const user = socketUserMap.get(socket.id);
      if (!user || !roomId || !emoji) return;
      // Broadcast to others in the room (the sender handles their own tile locally)
      socket.to(roomId).emit('receive-reaction', {
        from: socket.id,
        userId: user.userId,
        displayName: user.displayName,
        emoji,
      });
    });

    // ─────────────── GLOBAL NOTIFICATIONS ───────────────
    // Used for exam notifications, announcements, etc.

    socket.on('subscribe-notifications', ({ userId }) => {
      // Join a personal notification channel
      socket.join(`user:${userId}`);
      // Join global notifications channel
      socket.join('global-notifications');
      console.log(`🔔 ${userId} subscribed to notifications`);
    });

    // ─────────────── EXAM NOTIFICATIONS ───────────────

    socket.on('exam-notification', ({ type, data }) => {
      // Broadcast exam notifications to all connected users
      io.to('global-notifications').emit('exam-notification', {
        type, // 'exam-created', 'exam-starting-soon', 'exam-started', 'exam-ended', 'results-available'
        data,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('exam-reminder', ({ userId, examData }) => {
      // Send exam reminder to specific user
      io.to(`user:${userId}`).emit('exam-reminder', {
        ...examData,
        timestamp: new Date().toISOString(),
      });
    });

    // ─────────────── DISCONNECT ───────────────

    socket.on('disconnect', () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
      const disconnected = roomManager.handleDisconnect(socket.id);
      
      for (const { roomId, participant } of disconnected) {
        socket.to(roomId).emit('user-left', {
          socketId: socket.id,
          participant,
          roomId,
        });
        socket.to(roomId).emit('participant-left', {
          displayName: participant.displayName,
          timestamp: new Date().toISOString(),
        });
      }

      socketUserMap.delete(socket.id);
    });
  });

  return io;
}

/**
 * Handle leave room logic (shared between explicit leave and disconnect)
 */
function handleLeaveRoom(socket, io, roomId) {
  const result = roomManager.leaveRoom(roomId, socket.id);
  if (!result) return;

  socket.leave(roomId);

  socket.to(roomId).emit('user-left', {
    socketId: socket.id,
    participant: result.participant,
    roomId,
  });

  socket.to(roomId).emit('participant-left', {
    displayName: result.participant?.displayName,
    timestamp: new Date().toISOString(),
  });

  // If room ended, notify everyone
  if (result.room?.status === 'ended') {
    io.to(roomId).emit('interview-ended', {
      roomId,
      reason: 'All participants left',
      endedAt: result.room.endedAt,
    });
  }
}

/**
 * Helper to send notification to a specific user
 */
function sendNotificationToUser(io, userId, notification) {
  io.to(`user:${userId}`).emit('notification', {
    ...notification,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Helper to broadcast notification to all users
 */
function broadcastNotification(io, notification) {
  io.to('global-notifications').emit('notification', {
    ...notification,
    timestamp: new Date().toISOString(),
  });
}

module.exports = { initSocketHandlers, sendNotificationToUser, broadcastNotification };
