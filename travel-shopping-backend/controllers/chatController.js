const ChatHistory = require('../models/ChatHistory');
const { generateTravelData } = require('../utils/travelDataGenerator');
const ragService = require('../services/ragService');

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

// @desc    Send a message and get AI response via RAG pipeline
// @route   POST /api/chat/message
// @access  Private
exports.sendMessage = async (req, res) => {
  const { message } = req.body;

  // Requirement 4.4: validate message field
  if (!message || message.trim() === '') {
    return res.status(400).json({ success: false, message: 'message 필드는 필수입니다.' });
  }

  const userId = req.user._id;

  let ragResponse;
  try {
    // Requirement 4.3: call RAG service
    ragResponse = await ragService.generateResponse(userId, message);
  } catch (error) {
    // Requirement 4.9: unrecoverable RAG error → HTTP 500
    console.error('[chatController] RAG 서비스 오류:', error.message || error);
    return res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }

  // Build message objects
  const userMessage = {
    role: 'user',
    content: message,
    timestamp: new Date(),
  };

  const botMessage = {
    role: 'bot',
    content: ragResponse.content,
    recommendation: ragResponse.recommendation || undefined,
    itinerary: ragResponse.itinerary || undefined,
    timestamp: new Date(),
  };

  // Requirement 4.5 / 4.6: persist messages; log error but still return response on failure
  try {
    let chat = await ChatHistory.findOne({ userId });
    if (!chat) {
      chat = await ChatHistory.create({
        userId,
        messages: [userMessage, botMessage],
      });
    } else {
      chat.messages.push(userMessage, botMessage);

      // Requirement 7.5: keep only the most recent 100 messages
      if (chat.messages.length > 100) {
        chat.messages = chat.messages.slice(-100);
      }

      chat.updatedAt = Date.now();
      await chat.save();
    }
  } catch (saveError) {
    // Requirement 4.6: log save failure but continue to return AI response
    console.error('[chatController] ChatHistory 저장 실패:', saveError.message || saveError);
  }

  // Requirement 4.7 / 4.8: success response
  return res.json({ success: true, userMessage, botMessage });
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
