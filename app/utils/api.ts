export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  endpoints: {
    auth: {
      login: "/api/auth/login",
      register: "/api/auth/register",
      logout: "/api/auth/logout",
      refresh: "/api/auth/refresh",
      me: "/api/auth/me",
    },
    payments: {
      base: "/api/payments",
    },
    defaults: {
      base: "/api/defaults",
    },
    shares: {
      base: "/api/shares",
    },
    ai: {
      summary: "/api/ai/summary",
    },
  },
};

export const getApiUrl = (endpoint: string) => {
  return `${API_CONFIG.baseUrl}${endpoint}`;
}; 