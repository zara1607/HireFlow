const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Get all conversations for logged in user
// @route   GET /api/conversations
// @access  Private
const getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate('participants', 'name email role avatar companyName headline')
      .populate('job', 'title company')
      .populate('lastMessage')
      .sort({ lastMessageAt: -1 });

    res.status(200).json({
      success: true,
      count: conversations.length,
      conversations,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get or create conversation with a user
// @route   POST /api/conversations
// @access  Private
const getOrCreateConversation = async (req, res, next) => {
  try {
    const { recipientId, jobId } = req.body;

    if (!recipientId) {
      return res.status(400).json({
        success: false,
        message: 'Recipient ID is required',
      });
    }

    if (recipientId.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot start a conversation with yourself',
      });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Recipient user not found',
      });
    }

    // Check if conversation already exists between these 2 users
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, recipientId], $size: 2 },
    })
      .populate('participants', 'name email role avatar companyName headline')
      .populate('job', 'title company')
      .populate('lastMessage');

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, recipientId],
        job: jobId || null,
        lastMessageAt: new Date(),
      });

      conversation = await Conversation.findById(conversation._id)
        .populate('participants', 'name email role avatar companyName headline')
        .populate('job', 'title company');
    }

    res.status(200).json({
      success: true,
      conversation,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get messages for a conversation
// @route   GET /api/conversations/:id/messages
// @access  Private
const getMessages = async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
      });
    }

    // Verify user is participant
    const isParticipant = conversation.participants.some(
      (p) => p.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view messages in this conversation',
      });
    }

    const messages = await Message.find({ conversation: req.params.id })
      .populate('sender', 'name role avatar')
      .sort({ createdAt: 1 });

    // Mark messages sent to this user as read
    await Message.updateMany(
      {
        conversation: req.params.id,
        recipient: req.user._id,
        isRead: false,
      },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Send a message in a conversation
// @route   POST /api/conversations/:id/messages
// @access  Private
const sendMessage = async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message text cannot be empty',
      });
    }

    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
      });
    }

    // Check participation
    const isParticipant = conversation.participants.some(
      (p) => p.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to send messages in this conversation',
      });
    }

    const recipientId = conversation.participants.find(
      (p) => p.toString() !== req.user._id.toString()
    );

    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user._id,
      recipient: recipientId,
      text: text.trim(),
    });

    // Update conversation metadata
    conversation.lastMessage = message._id;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    const populatedMessage = await Message.findById(message._id).populate(
      'sender',
      'name role avatar'
    );

    // Create notification for recipient
    try {
      const notif = await Notification.create({
        recipient: recipientId,
        sender: req.user._id,
        type: 'NEW_MESSAGE',
        title: 'New Message',
        message: `${req.user.name}: "${text.length > 50 ? text.substring(0, 47) + '...' : text}"`,
        link: req.user.role === 'JOB_SEEKER' ? '/recruiter/chat' : '/candidate/chat',
      });

      // Emit realtime events
      const io = req.app.get('io');
      if (io) {
        // Emit message to conversation room and to recipient user room
        io.to(`conversation_${conversation._id}`).emit('new_message', populatedMessage);
        io.to(`user_${recipientId.toString()}`).emit('notification', notif);
      }
    } catch (notifErr) {
      console.error('Failed to notify message recipient:', notifErr.message);
    }

    res.status(201).json({
      success: true,
      message: populatedMessage,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
};
