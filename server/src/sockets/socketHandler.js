const mongoose = require('mongoose');
const Conversation = require('../models/Conversation');

const socketHandler = (io) => {
  io.on('connection', (socket) => {
    const user = socket.data.user;
    socket.join(`user_${user._id}`);

    // Join conversation room
    socket.on('join_conversation', async (conversationId) => {
      if (!mongoose.Types.ObjectId.isValid(conversationId)) return;
      const conversation = await Conversation.exists({
        _id: conversationId,
        participants: user._id,
      });
      if (conversation) socket.join(`conversation_${conversationId}`);
    });

    // Leave conversation room
    socket.on('leave_conversation', (conversationId) => {
      if (conversationId) {
        socket.leave(`conversation_${conversationId}`);
        // console.log(`[Socket] ${socket.id} left conversation_${conversationId}`);
      }
    });

    // Typing indicators
    socket.on('typing', async ({ conversationId, isTyping }) => {
      if (!mongoose.Types.ObjectId.isValid(conversationId)) return;
      const conversation = await Conversation.exists({
        _id: conversationId,
        participants: user._id,
      });
      if (conversation) {
        socket.to(`conversation_${conversationId}`).emit('user_typing', {
          conversationId,
          userId: user._id,
          userName: user.name,
          isTyping: Boolean(isTyping),
        });
      }
    });

    socket.on('disconnect', () => {
      // console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });
};

module.exports = socketHandler;
