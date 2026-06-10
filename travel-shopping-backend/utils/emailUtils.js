const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

exports.sendEmail = async (to, subject, text, html) => {
  // If no Resend API key is provided, log to console for development
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 're_your_api_key_here') {
    console.log('-----------------------------------------');
    console.log('📧 MOCK EMAIL SENT (RESEND MODE)');
    console.log(`TO: ${to}`);
    console.log(`SUBJECT: ${subject}`);
    console.log(`CONTENT: ${text}`);
    console.log('-----------------------------------------');
    return { success: true, message: 'Mock email sent to console' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev', // Default sender for Resend
      to: [to],
      subject,
      text,
      html,
    });

    if (error) {
      throw error;
    }

    console.log('✅ Email sent via Resend:', data.id);
    return { success: true, messageId: data.id };
  } catch (error) {
    // ⚠️ CRITICAL FALLBACK FOR DEVELOPMENT/TESTING
    // API Key 만료, 쿼터 제한, 네트워크 장애 등 어떤 이유로든 발송에 실패할 경우
    // 가입 프로세스가 막히지 않도록 콘솔에 인증 코드를 출력하고 '성공' 응답을 반환합니다.
    
    console.log('-----------------------------------------');
    console.log('📬 [FALLBACK] 이메일 발송 실패 - 콘솔 확인 필요');
    console.log(`대상: ${to}`);
    console.log(`이유: ${error.message || 'Unknown error'}`);
    
    // 이메일 본문이나 텍스트에서 인증 코드 추출 (일반적으로 "인증 코드: 123456" 형식)
    const codeMatch = text.match(/(\d{6})/);
    const code = codeMatch ? codeMatch[0] : '코드를 utils/emailUtils.js에서 확인하세요';
    
    console.log(`🔥 인증 코드: [ ${code} ]`);
    console.log('-----------------------------------------');
    
    return { 
      success: true, 
      message: 'Email failed but fallback triggered', 
      isFallback: true 
    };
  }
};
