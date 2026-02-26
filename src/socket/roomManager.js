/**
 * Room Manager — Manages interview rooms in memory
 * Tracks rooms, participants, and chat history
 */
const { v4: uuidv4 } = require('uuid');

class RoomManager {
  constructor() {
    // Map<roomId, RoomState>
    this.rooms = new Map();
  }

  /**
   * Create a new interview room
   */
  createRoom({ hostId, hostName, hostPhoto, title = 'Interview Room' }) {
    const roomId = uuidv4();
    const room = {
      id: roomId,
      title,
      hostId,
      hostName,
      hostPhoto,
      status: 'waiting', // waiting | active | ended
      participants: new Map(),
      chat: [],
      createdAt: new Date().toISOString(),
      startedAt: null,
      endedAt: null,
      maxParticipants: 5,
    };
    this.rooms.set(roomId, room);
    return this.serializeRoom(room);
  }

  /**
   * Join a room
   */
  joinRoom(roomId, { userId, displayName, photoUrl, socketId }) {
    const room = this.rooms.get(roomId);
    if (!room) return { error: 'Room not found' };
    if (room.status === 'ended') return { error: 'Interview has ended' };
    if (room.participants.size >= room.maxParticipants) return { error: 'Room is full' };

    // Prevent duplicate socket connections
    for (const [, p] of room.participants) {
      if (p.userId === userId) {
        // Update socket id (reconnection)
        p.socketId = socketId;
        p.isConnected = true;
        return { room: this.serializeRoom(room), participant: p, reconnected: true };
      }
    }

    const participant = {
      id: uuidv4(),
      userId,
      displayName,
      photoUrl,
      socketId,
      isConnected: true,
      isMuted: false,
      isCameraOff: false,
      isScreenSharing: false,
      joinedAt: new Date().toISOString(),
    };

    room.participants.set(socketId, participant);

    if (room.status === 'waiting') {
      room.status = 'active';
      room.startedAt = new Date().toISOString();
    }

    return { room: this.serializeRoom(room), participant };
  }

  /**
   * Leave a room
   */
  leaveRoom(roomId, socketId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const participant = room.participants.get(socketId);
    room.participants.delete(socketId);

    // End room if empty
    if (room.participants.size === 0) {
      room.status = 'ended';
      room.endedAt = new Date().toISOString();
      // Clean up after 5 minutes
      setTimeout(() => this.rooms.delete(roomId), 5 * 60 * 1000);
    }

    return { room: this.serializeRoom(room), participant };
  }

  /**
   * Handle disconnect — mark participant as disconnected
   */
  handleDisconnect(socketId) {
    const results = [];
    for (const [roomId, room] of this.rooms) {
      const participant = room.participants.get(socketId);
      if (participant) {
        participant.isConnected = false;
        // Remove after 30s if still disconnected
        setTimeout(() => {
          const p = room.participants.get(socketId);
          if (p && !p.isConnected) {
            this.leaveRoom(roomId, socketId);
          }
        }, 30000);
        results.push({ roomId, participant });
      }
    }
    return results;
  }

  /**
   * Add chat message
   */
  addMessage(roomId, { senderId, senderName, senderPhoto, text }) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const message = {
      id: uuidv4(),
      senderId,
      senderName,
      senderPhoto,
      text,
      timestamp: new Date().toISOString(),
    };

    room.chat.push(message);
    // Keep only last 500 messages
    if (room.chat.length > 500) room.chat = room.chat.slice(-500);

    return message;
  }

  /**
   * Get room info
   */
  getRoom(roomId) {
    const room = this.rooms.get(roomId);
    return room ? this.serializeRoom(room) : null;
  }

  /**
   * Get room by socket id
   */
  getRoomBySocket(socketId) {
    for (const [roomId, room] of this.rooms) {
      if (room.participants.has(socketId)) {
        return { roomId, room: this.serializeRoom(room) };
      }
    }
    return null;
  }

  /**
   * Update participant media state
   */
  updateParticipantMedia(roomId, socketId, { isMuted, isCameraOff, isScreenSharing }) {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    const participant = room.participants.get(socketId);
    if (!participant) return null;

    if (isMuted !== undefined) participant.isMuted = isMuted;
    if (isCameraOff !== undefined) participant.isCameraOff = isCameraOff;
    if (isScreenSharing !== undefined) participant.isScreenSharing = isScreenSharing;

    return participant;
  }

  /**
   * End room (host only)
   */
  endRoom(roomId, userId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    if (room.hostId !== userId) return { error: 'Only host can end the interview' };

    room.status = 'ended';
    room.endedAt = new Date().toISOString();
    setTimeout(() => this.rooms.delete(roomId), 5 * 60 * 1000);
    return this.serializeRoom(room);
  }

  /**
   * Serialize room for transport (convert Maps to arrays)
   */
  serializeRoom(room) {
    return {
      ...room,
      participants: Array.from(room.participants.values()),
    };
  }

  /**
   * Get all active rooms (for admin/listing)
   */
  getActiveRooms() {
    const active = [];
    for (const [, room] of this.rooms) {
      if (room.status !== 'ended') {
        active.push(this.serializeRoom(room));
      }
    }
    return active;
  }
}

module.exports = new RoomManager();
