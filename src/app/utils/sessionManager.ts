// Start a session timer and auto-logout when expired
export function startSessionTimer(sessionExpiryDate: string) {
  const expiryTime = new Date(sessionExpiryDate).getTime();
  const currentTime = Date.now();
  const timeRemaining = expiryTime - currentTime;

  // Save expiry in localStorage for global checks
  if (typeof window !== "undefined") {
    localStorage.setItem("sessionExpiryDate", sessionExpiryDate);
  }

  const logoutAndRedirect = async () => {
    const { store } = await import("../redux/store");
    const { logoutAdmin } = await import("../redux/slices/adminSlice");
    store.dispatch(logoutAdmin());
    if (typeof window !== "undefined") {
      localStorage.removeItem("userData");
      localStorage.removeItem("sessionExpiryDate");
      window.location.href = "/login";
    }
  };

  if (timeRemaining > 0) {
    setTimeout(() => {
      logoutAndRedirect();
    }, timeRemaining);
  } else {
    logoutAndRedirect();
  }
}



// Call this on app load to check expiry and auto-logout if needed
export function checkSessionExpiry() {
  if (typeof window === "undefined") return;
  const expiry = localStorage.getItem("sessionExpiryDate");
  if (!expiry) return;
  const expiryTime = new Date(expiry).getTime();
  const currentTime = Date.now();
  if (currentTime >= expiryTime) {
    // Use dynamic import to avoid circular dependency
    (async () => {
      const { store } = await import("../redux/store");
      const { logoutAdmin } = await import("../redux/slices/adminSlice");
      store.dispatch(logoutAdmin());
      localStorage.removeItem("userData");
      localStorage.removeItem("sessionExpiryDate");
      window.location.href = "/login";
    })();
  } else {
    // Set timer for remaining time
    startSessionTimer(expiry);
  }
}

// AUTHSERVICE.TS CONTENT - Centralized authentication management
import { store } from '../redux/store';
import { logoutAdmin } from '../redux/slices/adminSlice';

export interface UserData {
  token: string;
  uuid: string;
  merchantId: string;
  sessionExpiryDate?: string;
  sessionToken?: string;
  email?: string;
  phoneNumber?: string;
  emailVerified?: number;
}

export interface LoginResponse {
  msg: string[];
  status: boolean;
  successCode: string;
  statusCode: number;
  extraData: {
    LoginData: {
      uuid: string;
      jwtToken: string;
      email: string;
      phoneNumber: string;
      sessionStatus: number;
      sessionToken: string;
      sessionExpiryDate: string;
      emailVerified: number;
      merchantId: string;
    };
  };
}

class AuthService {
  private static instance: AuthService;
  private logoutTimer: NodeJS.Timeout | null = null;

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Store user data in localStorage and setup session timer
   */
  storeUserData(loginData: LoginResponse['extraData']['LoginData']): void {
    const userData: UserData = {
      token: loginData.jwtToken,
      uuid: loginData.uuid,
      merchantId: loginData.merchantId,
      sessionExpiryDate: loginData.sessionExpiryDate,
      sessionToken: loginData.sessionToken,
      email: loginData.email,
      phoneNumber: loginData.phoneNumber,
      emailVerified: loginData.emailVerified,
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem('userData', JSON.stringify(userData));
      localStorage.setItem('sessionExpiryDate', loginData.sessionExpiryDate);
    }

    // Setup automatic logout timer
    this.setupLogoutTimer(loginData.sessionExpiryDate);
  }

  /**
   * Get user data from localStorage
   */
  getUserData(): UserData | null {
    if (typeof window === 'undefined') {
      console.log('[AuthService] Window undefined, returning null');
      return null;
    }
    
    try {
      const storedData: string | null = localStorage.getItem('userData');
      if (!storedData) {
        console.log('[AuthService] No stored user data found');
        return null;
      }
      
      const userData = JSON.parse(storedData);
      console.log('[AuthService] Retrieved user data:', { 
        hasToken: !!userData.token, 
        uuid: userData.uuid,
        hasSessionExpiry: !!userData.sessionExpiryDate 
      });
      
      return userData;
    } catch (error) {
      console.error('[AuthService] Error parsing user data:', error);
      this.logout();
      return null;
    }
  }

  /**
   * Check if user is authenticated and session is valid
   */
  isAuthenticated(): boolean {
    const userData = this.getUserData();
    if (!userData || !userData.token) {
      console.log('[AuthService] No user data or token found');
      return false;
    }

    // Check if session is expired
    if (userData.sessionExpiryDate) {
      const expiryTime = new Date(userData.sessionExpiryDate).getTime();
      const currentTime = Date.now();
      
      if (currentTime >= expiryTime) {
        console.log('[AuthService] Session expired, logging out...');
        this.logout();
        return false;
      }
      
      console.log('[AuthService] Session valid, expires in:', Math.floor((expiryTime - currentTime) / 1000 / 60), 'minutes');
    }

    console.log('[AuthService] User is authenticated');
    return true;
  }

  /**
   * Get authentication headers for API calls
   */
  getAuthHeaders(): Record<string, string> {
    const userData = this.getUserData();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (userData?.token) {
      headers.Authorization = `Token ${userData.token}`;
    }

    return headers;
  }

  /**
   * Setup automatic logout timer based on session expiry
   */
  private setupLogoutTimer(sessionExpiryDate: string): void {
    // Clear existing timer
    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
    }

    const expiryTime = new Date(sessionExpiryDate).getTime();
    const currentTime = Date.now();
    const timeRemaining = expiryTime - currentTime;

    if (timeRemaining <= 0) {
      // Session already expired
      this.logout();
      return;
    }

    // Set timer for automatic logout
    this.logoutTimer = setTimeout(() => {
      console.log('Session timer expired, logging out...');
      this.logout();
    }, timeRemaining);

    console.log(`Session timer set for ${Math.floor(timeRemaining / 1000)} seconds`);
  }

  /**
   * Initialize session checking on app start
   */
  initializeSession(): void {
    if (typeof window === 'undefined') return;

    const userData = this.getUserData();
    if (!userData || !userData.sessionExpiryDate) {
      return;
    }

    const expiryTime = new Date(userData.sessionExpiryDate).getTime();
    const currentTime = Date.now();

    if (currentTime >= expiryTime) {
      console.log('Session expired on app start, logging out...');
      this.logout();
    } else {
      // Setup timer for remaining time
      this.setupLogoutTimer(userData.sessionExpiryDate);
    }
  }

  /**
   * Handle logout - clear data and redirect
   */
  logout(): void {
    // Clear logout timer
    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
      this.logoutTimer = null;
    }

    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('userData');
      localStorage.removeItem('sessionExpiryDate');
      localStorage.removeItem('rememberMeCredentials');
    }

    // Dispatch logout action to Redux
    try {
      store.dispatch(logoutAdmin());
    } catch (error) {
      console.error('Error dispatching logout:', error);
    }

    // Redirect to login
    if (typeof window !== 'undefined') {
      // Use window.location for immediate redirect
      window.location.href = '/login';
    }
  }

  /**
   * Handle API 401 responses
   */
  handleUnauthorized(): void {
    console.log('Unauthorized API response, logging out...');
    this.logout();
  }

  /**
   * Refresh session timer (call this when user is active)
   */
  refreshSession(): void {
    const userData = this.getUserData();
    if (userData?.sessionExpiryDate) {
      this.setupLogoutTimer(userData.sessionExpiryDate);
    }
  }

  /**
   * Get time remaining until session expires (in milliseconds)
   */
  getSessionTimeRemaining(): number {
    const userData = this.getUserData();
    if (!userData?.sessionExpiryDate) return 0;

    const expiryTime = new Date(userData.sessionExpiryDate).getTime();
    const currentTime = Date.now();
    return Math.max(0, expiryTime - currentTime);
  }

  /**
   * Check if session will expire within specified minutes
   */
  isSessionExpiringSoon(minutes: number = 5): boolean {
    const timeRemaining = this.getSessionTimeRemaining();
    return timeRemaining <= (minutes * 60 * 1000) && timeRemaining > 0;
  }
}

export const authService = AuthService.getInstance();

// APICLIENT.TS CONTENT - Axios instance with interceptors
import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import type { AxiosRequestHeaders } from 'axios';
import { BASE_URL } from '../config';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Track if we're already redirecting to avoid multiple redirects
let isRedirecting = false;

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    // Get fresh token for each request
    const userData = authService.getUserData();
    
    if (userData?.token) {
      if (!config.headers) {
        config.headers = {} as AxiosRequestHeaders;
      }
      config.headers.Authorization = `Token ${userData.token}`;
    }

    // Log request for debugging (remove in production)
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, {
      headers: config.headers,
      data: config.data,
    });

    return config;
  },
  (error) => {
    console.error('[API] Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
apiClient.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    // Log successful response for debugging (remove in production)
    console.log(`[API] ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`, {
      data: response.data,
    });
    
    return response;
  },
  (error) => {
    console.error('[API] Response interceptor error:', error);

    // Handle network errors
    if (!error.response) {
      console.error('[API] Network error or request timeout');
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    // Handle 401 Unauthorized - token expired or invalid
    if (status === 401 && !isRedirecting) {
      console.log('[API] 401 Unauthorized - token expired, logging out...');
      isRedirecting = true;
      
      // Use setTimeout to avoid blocking the current execution
      setTimeout(() => {
        authService.handleUnauthorized();
        isRedirecting = false;
      }, 100);
      
      return Promise.reject(new Error('Session expired. Please login again.'));
    }

    // Handle 403 Forbidden - user doesn't have permission
    if (status === 403) {
      console.log('[API] 403 Forbidden - insufficient permissions');
      return Promise.reject(new Error('You do not have permission to perform this action.'));
    }

    // Handle 404 Not Found
    if (status === 404) {
      console.log('[API] 404 Not Found');
      return Promise.reject(new Error('The requested resource was not found.'));
    }

    // Handle 500 Internal Server Error
    if (status >= 500) {
      console.log('[API] Server error:', status);
      return Promise.reject(new Error('Server error. Please try again later.'));
    }

    // Handle other errors
    const errorMessage = data?.msg || data?.message || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(errorMessage));
  }
);

export default apiClient;
