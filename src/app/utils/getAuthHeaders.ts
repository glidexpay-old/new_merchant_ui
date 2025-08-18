const getAuthHeaders = () => {
  if (typeof window === "undefined") return { headers: { "Content-Type": "application/json" } };
  const storedData = localStorage.getItem("userData");
  const userData = storedData ? JSON.parse(storedData) : null;

  return {
    headers: {
      "Content-Type": "application/json",
      Authorization: userData?.token ? `Token ${userData.token}` : undefined,
    }
  };
};

export default getAuthHeaders;
