/**
 * Room Manager — Manages interview rooms in memory
 * Tracks rooms, participants, waiting room, and chat history
 */
const { v4: uuidv4 } = require('uuid');

class RoomManager {
  constructor() {
    // Map<roomId, RoomState>
    this.rooms = new Map();
    // Map<userId, socketId> — global mapping to prevent duplicate sessions
    this.userSockets = new Map();
  }

  /**
   * Register a userId ↔ socketId mapping (called on authenticate).
   * Returns the OLD socketId if this user was already connected (so caller can disconnect it).
   */
  registerUser(userId, socketId) {
    const oldSocketId = this.userSockets.get(userId);
    this.userSockets.set(userId, socketId);
    return oldSocketId && oldSocketId !== socketId ? oldSocketId : null;
  }

  /**
   * Unregister a userId mapping (called on disconnect, only if the socketId still matches).
   */
  unregisterUser(userId, socketId) {
    if (this.userSockets.get(userId) === socketId) {
      this.userSockets.delete(userId);
    }
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
      waitingRoom: new Map(), // Map<socketId, { userId, displayName, photoUrl, socketId, requestedAt }>
      chat: [],
      createdAt: new Date().toISOString(),
      startedAt: null,
      endedAt: null,
      maxParticipants: 10,
    };
    this.rooms.set(roomId, room);
    return this.serializeRoom(room);
  }

  /**
   * Request to join a room (non-host users go to waiting room)
   */
  requestJoin(roomId, { userId, displayName, photoUrl, socketId }) {
    const room = this.rooms.get(roomId);
    if (!room) return { error: 'Room not found' };
    if (room.status === 'ended') return { error: 'Interview has ended' };

    // If user is the host, admit directly
    if (userId === room.hostId) {
      return this.joinRoom(roomId, { userId, displayName, photoUrl, socketId });
    }

    // Check if already a participant (reconnection)
    for (const [oldSid, p] of room.participants) {
      if (p.userId === userId) {
        // Remove old socketId entry and re-key with new socketId
        room.participants.delete(oldSid);
        p.socketId = socketId;
        p.isConnected = true;
        room.participants.set(socketId, p);
        return { room: this.serializeRoom(room), participant: p, reconnected: true, admitted: true };
      }
    }

    // Check if already in waiting room — update socket
    for (const [oldSid, w] of room.waitingRoom) {
      if (w.userId === userId) {
        room.waitingRoom.delete(oldSid);
        w.socketId = socketId;
        room.waitingRoom.set(socketId, w);
        return { waiting: true, position: Array.from(room.waitingRoom.keys()).indexOf(socketId) + 1 };
      }
    }

    // Add to waiting room
    const waitEntry = {
      userId,
      displayName,
      photoUrl,
      socketId,
      requestedAt: new Date().toISOString(),
    };
    room.waitingRoom.set(socketId, waitEntry);

    return {
      waiting: true,
      position: room.waitingRoom.size,
      waitEntry,
    };
  }

  /**
   * Admit a user from waiting room into the meeting (host action)
   */
  admitUser(roomId, targetSocketId, hostUserId) {
    const room = this.rooms.get(roomId);
    if (!room) return { error: 'Room not found' };
    if (room.hostId !== hostUserId) return { error: 'Only host can admit users' };

    const waitEntry = room.waitingRoom.get(targetSocketId);
    if (!waitEntry) return { error: 'User not found in waiting room' };

    // Check capacity
    if (room.participants.size >= room.maxParticipants) return { error: 'Room is full' };

    // Remove from waiting room
    room.waitingRoom.delete(targetSocketId);

    // Add as full participant
    const participant = {
      id: uuidv4(),
      userId: waitEntry.userId,
      displayName: waitEntry.displayName,
      photoUrl: waitEntry.photoUrl,
      socketId: targetSocketId,
      isConnected: true,
      isMuted: false,
      isCameraOff: false,
      isScreenSharing: false,
      joinedAt: new Date().toISOString(),
    };

    room.participants.set(targetSocketId, participant);

    if (room.status === 'waiting') {
      room.status = 'active';
      room.startedAt = new Date().toISOString();
    }

    return { room: this.serializeRoom(room), participant };
  }

  /**
   * Reject a user from waiting room
   */
  rejectUser(roomId, targetSocketId, hostUserId) {
    const room = this.rooms.get(roomId);
    if (!room) return { error: 'Room not found' };
    if (room.hostId !== hostUserId) return { error: 'Only host can reject users' };

    const waitEntry = room.waitingRoom.get(targetSocketId);
    if (!waitEntry) return { error: 'User not found in waiting room' };

    room.waitingRoom.delete(targetSocketId);
    return { success: true, rejected: waitEntry };
  }

  /**
   * Get waiting room list
   */
  getWaitingRoom(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return [];
    return Array.from(room.waitingRoom.values());
  }

  /**
   * Join a room (direct — for host, or after being admitted)
   */
  joinRoom(roomId, { userId, displayName, photoUrl, socketId }) {
    const room = this.rooms.get(roomId);
    if (!room) return { error: 'Room not found' };
    if (room.status === 'ended') return { error: 'Interview has ended' };
    if (room.participants.size >= room.maxParticipants) return { error: 'Room is full' };

    // Prevent duplicate — if same userId already present, re-key the entry
    for (const [oldSid, p] of room.participants) {
      if (p.userId === userId) {
        room.participants.delete(oldSid);
        p.socketId = socketId;
        p.isConnected = true;
        room.participants.set(socketId, p);
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

    return { room: this.serializeRoom(room), participant, admitted: true };
  }

  /**
   * Leave a room
   */
  leaveRoom(roomId, socketId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const participant = room.participants.get(socketId);
    room.participants.delete(socketId);

    // Also remove from waiting room if present
    room.waitingRoom.delete(socketId);

    // End room if empty (no participants & no waiting)
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
      // Remove from waiting room immediately
      if (room.waitingRoom.has(socketId)) {
        room.waitingRoom.delete(socketId);
      }

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
    // Reject all waiting users
    room.waitingRoom.clear();
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
      waitingRoom: Array.from(room.waitingRoom.values()),
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
