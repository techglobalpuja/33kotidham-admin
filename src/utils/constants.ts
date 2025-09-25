// Application constants
export const APP_NAME = '33KotiDham';
export const APP_DESCRIPTION = 'पूजा एवं ज्योतिष सेवाएं';

export const ROUTES = {
  HOME: '/',
  ADMIN: '/admin',
  ADMIN_PUJAS: '/admin/pujas',
  ADMIN_USERS: '/admin/users', 
  ADMIN_ORDERS: '/admin/orders',
  ADMIN_CONTENT: '/admin/content',
  ADMIN_CHAWADA: '/admin/chawada',
  ADD_PUJA: '/admin/add-puja',
  DASHBOARD: '/dashboard',
  HOROSCOPE: '/horoscope',
  SHOP: '/shop',
  NEWS: '/news',
  PAGES: '/pages',
  PRIVACY_POLICY: '/privacy-policy',
  TERMS_CONDITIONS: '/terms-conditions',
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
  },
  PUJAS: {
    GET_ALL: '/pujas',
    GET_BY_ID: (id: string) => `/pujas/${id}`,
    CREATE: '/pujas',
    UPDATE: (id: string) => `/pujas/${id}`,
    DELETE: (id: string) => `/pujas/${id}`,
  },
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
} as const;