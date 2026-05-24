// src/constants/api.js

// Change this to your deployed backend URL when releasing
export const API_BASE_URL = 'http://10.25.199.86:8080/api';
// For local dev: 'http://192.168.x.x:8080/api' (use your PC's local IP, not localhost)

export const WS_URL = API_BASE_URL.replace('/api', '/api/ws/chat');

export const ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  REFRESH: '/auth/refresh',
  SEND_OTP: '/auth/send-otp',
  VERIFY_OTP: '/auth/verify-otp',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  CHECK_USERNAME: '/auth/check-username',
  CHECK_EMAIL: '/auth/check-email',

  // User
  PROFILE: '/user/profile',
  UPDATE_PROFILE: '/user/profile',
  UPLOAD_DP: '/user/upload-dp',
  ACTIVE_COUNT: '/user/active-count',
  UPDATE_PROFILE_REGISTRATION: '/user/update-profile-at-registration',

  // Matching
  JOIN_QUEUE: '/match/join',
  POLL_MATCH: '/match/poll',
  LEAVE_QUEUE: '/match/leave',

  // Chat
  CHAT_ROOMS: '/chat/rooms',
  CHAT_MESSAGES: (roomId) => `/chat/messages/${roomId}`,
  UPLOAD_IMAGE: (roomId) => `/chat/upload-image/${roomId}`,
  REPORT_MESSAGE: (msgId) => `/chat/report/${msgId}`,
  EDIT_MESSAGE: (msgId) => `/chat/message/${msgId}`,
  DELETE_MESSAGE: (msgId) => `/chat/message/${msgId}`,

  // Friends
  FRIENDS_LIST: '/friends',
  FRIEND_REQUESTS: '/friends/requests',
  SEND_REQUEST: (userId) => `/friends/request/${userId}`,
  ACCEPT_REQUEST: (reqId) => `/friends/accept/${reqId}`,
  REJECT_REQUEST: (reqId) => `/friends/reject/${reqId}`,
  REMOVE_FRIEND: (userId) => `/friends/remove/${userId}`,
  BLOCK_USER: (userId) => `/friends/block/${userId}`,
  UNBLOCK_USER: (userId) => `/friends/unblock/${userId}`,
  BLOCKED_LIST: '/friends/blocked',
  FRIEND_CHAT: (userId) => `/friends/chat/${userId}`,
  SEARCH_USER: (username) => `/friends/search?username=${username}`,
  HOME_STATS: '/friends/home-stats',

  // Premium
  CREATE_ORDER: '/payment/create-order',
  VERIFY_PAYMENT: '/payment/verify',
  ACTIVATE_PREMIUM: '/payment/activate',

  // Health
  HEALTH: '/health/status',
};
