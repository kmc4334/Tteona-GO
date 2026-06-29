const axios = require('axios');

/**
 * FastAPI 데이터 서버 연동을 위한 전용 axios 인스턴스
 * - IP: 192.168.0.12
 * - PORT: 8000
 */
const apiClient = axios.create({
  baseURL: 'http://192.168.0.12:8000',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

module.exports = apiClient;
