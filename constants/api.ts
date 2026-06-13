export const API_BASE_URL = 'https://splitwise-clone-imds.onrender.com/api'; // Android emulator
// export const API_BASE_URL = 'http://127.0.0.1:8000/api'; // iOS simulator
// export const API_BASE_URL = 'https://your-ec2-domain.com/api'; // Production

export const WS_BASE_URL = 'wss://splitwise-clone-imds.onrender.com/ws'; // Android emulator

export const ENDPOINTS = {
  // Auth
  REGISTER: '/auth/register/',
  LOGIN: '/auth/login/',
  LOGOUT: '/auth/logout/',
  GOOGLE_AUTH: '/auth/google/',
  TOKEN_REFRESH: '/auth/token/refresh/',

  // Users
  ME: '/users/me/',
  USER_SEARCH: '/users/search/',

  // Groups
  GROUPS: '/groups/',
  GROUP_DETAIL: (id: number) => `/groups/${id}/`,
  GROUP_MEMBERS: (id: number) => `/groups/${id}/members/`,
  GROUP_MEMBER_REMOVE: (groupId: number, userId: number) => `/groups/${groupId}/members/${userId}/`,
  GROUP_INVITE: (id: number) => `/groups/${id}/invite/`,
  GROUP_JOIN: (token: string) => `/groups/join/${token}/`,
  GROUP_BALANCES: (id: number) => `/groups/${id}/balances/`,
  MY_BALANCE: (id: number) => `/groups/${id}/my-balance/`,

  // Expenses
  EXPENSES: (groupId: number) => `/groups/${groupId}/expenses/`,
  EXPENSE_DETAIL: (id: number) => `/expenses/${id}/`,
  EXPENSE_SPLITS: (id: number) => `/expenses/${id}/splits/`,

  // Settlements
  SETTLEMENTS: (groupId: number) => `/groups/${groupId}/settlements/`,
  INITIATE_PAYMENT: (groupId: number) => `/groups/${groupId}/settlements/initiate-payment/`,
  VERIFY_PAYMENT: (groupId: number) => `/groups/${groupId}/settlements/verify-payment/`,

  // Chat
  GROUP_MESSAGES: (groupId: number) => `/groups/${groupId}/messages/`,
  EXPENSE_MESSAGES: (expenseId: number) => `/expenses/${expenseId}/messages/`,

  // Notifications
  NOTIFICATIONS: '/notifications/',
  MARK_READ: (id: number) => `/notifications/${id}/read/`,
  MARK_ALL_READ: '/notifications/read-all/',
};