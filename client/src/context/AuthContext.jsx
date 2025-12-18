import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

{
  /*
  createContext(null) - Creates context with default value null
  This context will hold auth state and functions
  Think of it as a "global variable" accessible anywhere
  */
}
const AuthContext = createContext(null);

{
  /*
  Purpose:
  Custom hook to access auth context from any component.
  */
}
export const useAuth = () => {
  const context = useContext(AuthContext);
  {
    /* useContext(AuthContext) - Reads value from nearest AuthProvider, Returns whatever is in the Provider's value prop */
  }
  {
    /* prevents using useAuth() outside of <AuthProvider>, Better developer experience with clear error message */
  }
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
  {
    /* returns the auth context value (user, login, logout, etc.) */
  }
  {
    /* Returns auth state and functions
    Components can destructure what they need */
  }
};

{
  /* 
  Provider component that wraps your app
  children - All components inside <AuthProvider> (your entire app)
*/
}
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  {
    /* user - Current logged-in user object or null
    Initial value: null (not logged in)
    After login:
    {
      _id: "abc123",
      name: "manthan",
      email: "msb@example.com",
      role: "user",
      profile: { age: 19, gender: "male", ... }
    }
    */
  }
  const [loading, setLoading] = useState(true);
  {
    /* loading - true while checking auth status on app load
    Initial value: true
    After check: false
    prevents flash of login screen
    */
  }
  const [error, setError] = useState(null);
  {
    /* error - holds any auth-related error messages */
  }

  {
    /* 
      Runs once when app loads to check if user is already logged in.
      Empty dependency array [] - Runs only once on mount
      Calls checkAuth() function
    */
  }
  useEffect(() => {
    checkAuth();
  }, []);

  {
    /*
    Purpose:
    Validates stored JWT token and restores user session.
    */
  }
  const checkAuth = async () => {
    const token = localStorage.getItem("fittrack_token"); {/* Get token from localStorage */ }
    if (token) { {/* If token exists, validate it */ }
      try {
        {/* Set Authorization header for future requests */ }
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          {/* Fetch current user data from backend */ }
        const response = await api.get("/auth/me");
        {/* If successful, set user state */ }
        setUser(response.data);
      } catch (err) {
        localStorage.removeItem("fittrack_token");
        delete api.defaults.headers.common["Authorization"];
      }
    }
    {/* After check (regardless of outcome), set loading to false */ }
    setLoading(false);
  };

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await api.post("/auth/login", { email, password });
      const { token, ...userData } = response.data;

      localStorage.setItem("fittrack_token", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser(userData);

      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "Login failed";
      setError(message);
      return { success: false, error: message };
    }
  };

  const register = async (name, email, password, role = "user") => {
    try {
      setError(null);
      const response = await api.post("/auth/register", {
        name,
        email,
        password,
        role,
      });
      const { token, ...userData } = response.data;

      localStorage.setItem("fittrack_token", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser(userData);

      return { success: true };
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        "Registration failed";
      setError(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem("fittrack_token");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
  };

  const updateProfile = async (data) => {
    try {
      const response = await api.put("/auth/profile", data);
      setUser(response.data);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "Update failed";
      return { success: false, error: message };
    }
  };

  const refreshUser = async () => {
    try {
      const response = await api.get("/auth/me");
      setUser(response.data);
      return { success: true };
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to refresh user data";
      return { success: false, error: message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
        refreshUser,
        isTrainer: user?.role === "trainer",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
