import { authService } from './sessionManager';

const getAuthHeaders = () => {
  if (typeof window === "undefined") return { headers: { "Content-Type": "application/json" } };
  
  // Use authService for consistent headers and validation
  return { headers: authService.getAuthHeaders() };
};

export default getAuthHeaders;
