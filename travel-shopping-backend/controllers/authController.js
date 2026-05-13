const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../utils/emailUtils');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register new user
// @route   POST /api/auth/signup
// @access  Public
exports.signup = async (req, res) => {
  try {
    const { name, nickname, email, password } = req.body;

    // Check if user exists and is verified
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ success: false, message: '이메일 인증을 먼저 완료해주세요.' });
    }

    if (!user.isVerified) {
      return res.status(400).json({ success: false, message: '이메일 인증이 완료되지 않았습니다.' });
    }

    // Update user with real name, nickname and password
    user.name = name;
    user.nickname = nickname || name; // Default nickname to name if not provided
    user.password = password;
    await user.save();

    res.status(201).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        nickname: user.nickname,
        email: user.email
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user
    // We intentionally select the password here because it's required for auth check
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        nickname: user.nickname,
        email: user.email
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    // req.user is set in authMiddleware
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user name and nickname
// @route   PUT /api/auth/name
// @access  Private
exports.updateName = async (req, res) => {
  try {
    const { name, nickname } = req.body;
    if (!name && !nickname) {
      return res.status(400).json({ success: false, message: '이름 또는 닉네임을 입력해주세요.' });
    }
    const updateData = {};
    if (name) updateData.name = name;
    if (nickname) updateData.nickname = nickname;
    const user = await User.findByIdAndUpdate(req.user.id, updateData, { new: true });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user email
// @route   PUT /api/auth/email
// @access  Private
exports.updateEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: '이메일을 입력해주세요.' });
    }
    const existing = await User.findOne({ email });
    if (existing && existing._id.toString() !== req.user.id) {
      return res.status(400).json({ success: false, message: '이미 사용 중인 이메일입니다.' });
    }
    const user = await User.findByIdAndUpdate(req.user.id, { email }, { new: true });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user profile details
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, nickname, phoneNumber } = req.body;
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (nickname !== undefined) updateData.nickname = nickname;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;

    const user = await User.findByIdAndUpdate(req.user.id, updateData, { new: true });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// @desc    Send Verification Code
// @route   POST /api/auth/send-code
// @access  Public
exports.sendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: '이메일을 입력해주세요.' });
    }

    // Generate 6-digit code for better security
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Store code in a temporary user or just a verification record
    let user = await User.findOne({ email });
    if (!user) {
      // Create a temporary user record
      user = new User({ email, name: 'Guest', nickname: '떠나 GO 여행자', password: 'temp_password_123!', isVerified: false });
    }
    
    user.verificationCode = code;
    await user.save();

    await sendEmail(
      email,
      '[떠나 GO] 이메일 인증 코드',
      `인증 코드: ${code}`,
      `<h3>떠나 GO 이메일 인증</h3><p>아래 인증 코드를 입력하여 회원가입을 완료해 주세요.</p><h2>${code}</h2>`
    );

    res.json({ success: true, message: '인증 코드가 발송되었습니다.' });
  } catch (error) {
    console.error('Send Code Error:', error);
    res.status(500).json({ success: false, message: '인증 코드 발송 중 오류가 발생했습니다.' });
  }
};

// @desc    Verify Code
// @route   POST /api/auth/verify-code
// @access  Public
exports.verifyCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ success: false, message: '이메일과 인증 코드를 입력해주세요.' });
    }

    const user = await User.findOne({ email, verificationCode: code });

    if (!user) {
      return res.status(400).json({ success: false, message: '인증 코드가 올바르지 않습니다.' });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    await user.save();

    res.json({ success: true, message: '이메일 인증이 완료되었습니다.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// @desc    Update user password
// @route   PUT /api/auth/password
// @access  Private
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: '현재 비밀번호가 올바르지 않습니다.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: '새 비밀번호는 6자 이상이어야 합니다.' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: '비밀번호가 변경되었습니다.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
