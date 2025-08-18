const getUserData = () => {
  if (typeof window === "undefined") return { token: undefined, uuid: undefined };
  const storedData = localStorage.getItem("userData");
  const userData = storedData ? JSON.parse(storedData) : null;
  return {
    token: userData?.token,
    uuid: userData?.uuid,
    merchantId: userData?.merchantId,
  };
};

export default getUserData;
