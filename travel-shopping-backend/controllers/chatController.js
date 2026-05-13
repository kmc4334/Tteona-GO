const ChatHistory = require('../models/ChatHistory');
const { generateTravelData } = require('../utils/travelDataGenerator');

// @desc    Get chat history for current user
// @route   GET /api/chat
// @access  Private
exports.getChatHistory = async (req, res) => {
  try {
    let chat = await ChatHistory.findOne({ userId: req.user.id });
    if (!chat) {
      chat = { userId: req.user.id, messages: [] };
    }
    res.json({ success: true, messages: chat.messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Save a message to chat history
// @route   POST /api/chat
// @access  Private
exports.saveMessage = async (req, res) => {
  try {
    const { role, content, recommendation } = req.body;
    if (!role || !content) {
      return res.status(400).json({ success: false, message: 'role과 content는 필수입니다.' });
    }

    const newMessage = {
      role,
      content,
      recommendation: recommendation || undefined,
      timestamp: new Date(),
    };

    // 만약 사용자가 보낸 메시지인 경우, AI 응답 시 일정을 생성할 수 있도록 로직 추가 가능
    // 현재 구조에서는 bot의 응답 시점에 일정을 포함하도록 구현
    if (role === 'bot') {
      const itinerary = generateTravelData(content);
      if (itinerary) {
        newMessage.itinerary = itinerary;
      }
    }

    let chat = await ChatHistory.findOne({ userId: req.user.id });
    if (!chat) {
      chat = await ChatHistory.create({ userId: req.user.id, messages: [newMessage] });
    } else {
      chat.messages.push(newMessage);
      // Keep only last 100 messages for performance
      if (chat.messages.length > 100) {
        chat.messages = chat.messages.slice(-100);
      }
      chat.updatedAt = Date.now();
      await chat.save();
    }

    res.status(201).json({ success: true, message: newMessage });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Clear chat history
// @route   DELETE /api/chat
// @access  Private
exports.clearChatHistory = async (req, res) => {
  try {
    await ChatHistory.findOneAndUpdate(
      { userId: req.user.id },
      { messages: [], updatedAt: Date.now() }
    );
    res.json({ success: true, message: '채팅 기록이 삭제되었습니다.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
