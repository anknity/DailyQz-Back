/**
 * Interview REST Routes — Room management via HTTP
 * (Socket.io handles real-time; these are for initial room creation/lookup)
 */
const express = require('express');
const router = express.Router();
const roomManager = require('../socket/roomManager');

// GET /api/v2/interview/rooms — List active interview rooms
router.get('/rooms', (req, res) => {
  try {
    const rooms = roomManager.getActiveRooms();
    res.json({ success: true, rooms });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/v2/interview/rooms/:roomId — Get room details
router.get('/rooms/:roomId', (req, res) => {
  try {
    const room = roomManager.getRoom(req.params.roomId);
    if (!room) return res.status(404).json({ success: false, error: 'Room not found' });
    res.json({ success: true, room });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/v2/interview/rooms — Create room via REST (alternative to socket)
router.post('/rooms', (req, res) => {
  try {
    const { hostId, hostName, hostPhoto, title } = req.body;
    if (!hostId || !hostName) {
      return res.status(400).json({ success: false, error: 'hostId and hostName are required' });
    }
    const room = roomManager.createRoom({ hostId, hostName, hostPhoto, title });
    res.status(201).json({ success: true, room });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
