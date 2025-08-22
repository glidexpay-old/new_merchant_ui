import { authService } from './sessionManager';

const getUserData = () => {
  if (typeof window === "undefined") return { token: undefined, uuid: undefined };
  
  // Use authService for consistent data retrieval and validation
  const userData = authService.getUserData();
  
  if (!userData) {
    return { 
      token: undefined, 
      uuid: undefined,
      merchantId: undefined,
      sessionExpiryDate: undefined,
      sessionToken: undefined,
      email: undefined,
      phoneNumber: undefined,
      emailVerified: undefined,
    };
  }
  
  return {
    token: userData.token,
    uuid: userData.uuid,
    merchantId: userData.merchantId,
    sessionExpiryDate: userData.sessionExpiryDate,
    sessionToken: userData.sessionToken,
    email: userData.email,
    phoneNumber: userData.phoneNumber,
    emailVerified: userData.emailVerified,
  };
};

export default getUserData;
