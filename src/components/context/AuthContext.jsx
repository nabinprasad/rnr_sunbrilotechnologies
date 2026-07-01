import { createContext, useState } from "react";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(
    JSON.parse(localStorage.getItem("admin"))
  );

  const login = (adminData, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("admin", JSON.stringify(adminData));

    setAdmin(adminData);
  };

  const logout = () => {
    localStorage.clear();

    setAdmin(null);
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        login,
        logout,
        isAuthenticated: !!admin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}