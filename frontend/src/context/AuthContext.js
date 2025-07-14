import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1️⃣ Mise à jour du token (login ou refresh)
  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log("dec", decoded);
        setUser({
          id: decoded.id || decoded._id || "",
          name: decoded.name || "",
          email: decoded.email || "",
          role: decoded.role || "",
          phone: decoded.phone || "",
          profileImage: decoded.profileImage || "",

          companyDetails: decoded.companyDetails || null,
          admin: decoded.admin || null,
          superAdmin: decoded.superAdmin || null,
          driverDetails: decoded.driverDetails || null,
        });
      } catch (error) {
        console.error("Erreur de décodage:", error);
        setUser(null);
        setToken(null);
        localStorage.removeItem("token");
      }
    } else {
      setUser(null);
    }

    setLoading(false);
  }, [token]); // 👈 ce watcher est la clé

  // 2️⃣ Login direct
  const login = (userData, authToken) => {
    localStorage.setItem("token", authToken);
    localStorage.setItem("user", JSON.stringify(userData));
    setToken(authToken); // 👈 déclenche le useEffect
  };

  // 3️⃣ Logout
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
