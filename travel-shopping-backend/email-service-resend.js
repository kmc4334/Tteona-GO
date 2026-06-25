require('dotenv').config();
const express = require('express');
const { Resend } = require('resend');

const app = express();
app.use(express.json());

// 1. Resend API 클라이언트 설정
// .env 파일에 RESEND_API_KEY가 필요합니다.
const resend = new Resend(process.env.RESEND_API_KEY);

// 5. 인증 코드 저장소 (메모리 방식 - 실제 서비스에서는 Redis 등을 권장)
const verificationStore = new Map();

// 3. 6자리 인증 코드 생성 함수
const generateCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// 2. 이메일 전송 함수
const sendEmail = async (to, code) => {
  try {
    const data = await resend.emails.send({
      from: 'onboarding@resend.dev', // Resend 기본 발신 주소
      to: [to],
      subject: '[떠나 GO] 이메일 인증 코드를 확인해주세요',
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #007bff; text-align: center;">이메일 인증 안내</h2>
          <p>안녕하세요! 서비스 가입을 위해 아래 인증 번호를 입력해 주세요.</p>
          <div style="background-color: #f8f9fa; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #333;">${code}</span>
          </div>
          <p style="font-size: 13px; color: #666;">본 인증 번호는 발송 후 5분간 유효합니다.</p>
          <hr style="border: none; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #999; text-align: center;">본 이메일은 발신 전용입니다.</p>
        </div>
      `,
    });
    return { success: true, data };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error };
  }
};

// 4. 인증 코드 전송 API
app.post('/send-code', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: '이메일을 입력해주세요.' });
  }

  const code = generateCode();
  
  // 저장 (이메일을 키로, 인증 코드를 값으로 저장. 만료 시간 설정을 위해 객체 형태로 저장)
  verificationStore.set(email, {
    code,
    expiresAt: Date.now() + 5 * 60 * 1000 // 5분 유효
  });

  const result = await sendEmail(email, code);

  if (result.success) {
    res.json({ success: true, message: '인증 코드가 이메일로 전송되었습니다.' });
  } else {
    res.status(500).json({ success: false, message: '이메일 발송에 실패했습니다.', error: result.error });
  }
});

// 6. 코드 검증 API
app.post('/verify-code', (req, res) => {
  const { email, code } = req.body;
  
  if (!email || !code) {
    return res.status(400).json({ success: false, message: '이메일과 인증 코드를 입력해주세요.' });
  }

  const storedData = verificationStore.get(email);

  if (!storedData) {
    return res.status(400).json({ success: false, message: '인증 요청 정보가 없습니다. 다시 요청해주세요.' });
  }

  // 만료 체크
  if (Date.now() > storedData.expiresAt) {
    verificationStore.delete(email);
    return res.status(400).json({ success: false, message: '인증 코드 유효 시간이 만료되었습니다.' });
  }

  // 일치 여부 확인
  if (storedData.code === code) {
    verificationStore.delete(email); // 인증 성공 후 삭제
    res.json({ success: true, message: '이메일 인증에 성공했습니다.' });
  } else {
    res.status(400).json({ success: false, message: '인증 코드가 일치하지 않습니다.' });
  }
});

// 서버 실행
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Resend Auth Server is running on http://localhost:${PORT}`);
  console.log('--- 패키지 설치 방법 ---');
  console.log('npm install express resend dotenv');
  console.log('------------------------');
});
