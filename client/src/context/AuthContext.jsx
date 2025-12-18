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
    const token = localStorage.getItem("fittrack_token");
    {
      /* Get token from localStorage */
    }
    if (token) {
      {
        /* If token exists, validate it */
      }
      try {
        {
          /* Set Authorization header for future requests */
        }
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        {
          /* Fetch current user data from backend */
        }
        const response = await api.get("/auth/me");
        {
          /* If successful, set user state */
        }
        setUser(response.data);
      } catch (err) {
        localStorage.removeItem("fittrack_token");
        delete api.defaults.headers.common["Authorization"];
      }
    }
    {
      /* After check (regardless of outcome), set loading to false */
    }
    setLoading(false);
  };

  {
    /*
      Purpose:
      Logs in user with email and password.
      On success, stores token and user data.
      On failure, sets error message.
     */
  }
  const login = async (email, password) => {
    try {
      {
        /* Clear previous errors */
      }
      setError(null);
      {
        /* Send login request to backend */
      }
      const response = await api.post("/auth/login", { email, password });
      {
        /* Destructure token and user data from response */
      }
      const { token, ...userData } = response.data;
      {
        /* Store token in localStorage for persistence */
      }
      localStorage.setItem("fittrack_token", token);
      {
        /* Set Authorization header for future requests */
      }
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      {
        /* Update user state with logged-in user data */
      }
      setUser(userData);

      return { success: true };
    } catch (err) {
      {
        /* On error, extract message and set error state */
      }
      const message = err.response?.data?.message || "Login failed";
      setError(message);
      return { success: false, error: message };
    }
  };

  {
    /*
    Purpose:
    Registers a new user with name, email, password, and role.
    On success, stores token and user data.
    On failure, sets error message.
    */
  }
  const register = async (name, email, password, role = "user") => {
    try {
      {
        /* Clear previous errors */
      }
      setError(null);
      {
        /* Send registration request to backend */
      }
      const response = await api.post("/auth/register", {
        name,
        email,
        password,
        role,
      });
      {
        /* Destructure token and user data from response */
      }
      const { token, ...userData } = response.data;

      {
        /* Store token in localStorage for persistence */
      }
      localStorage.setItem("fittrack_token", token);
      {
        /* Set Authorization header for future requests */
      }
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      {
        /* Update user state with registered user data */
      }
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

  {
    /*
    Purpose:
    Logs out the current user by clearing token and user data.
    */
  }
  const logout = () => {
    localStorage.removeItem("fittrack_token");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
  };

  {
    /*
    Purpose:
    Updates the user's profile information.
    On success, updates user state.
    On failure, returns error message.
    */
  }
  const updateProfile = async (data) => {
    try {
      {
        /* Send profile update request to backend */
      }
      const response = await api.put("/auth/profile", data);
      {
        /* On success, update user state with new profile data, this happens on client side so that the user see's the effect quickly. */
      }
      setUser(response.data);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "Update failed";
      return { success: false, error: message };
    }
  };

  {
    /*
    Purpose:
    Refreshes the current user's data from the backend.
    On success, updates user state.
    On failure, returns error message.
    eg, if user updated their profile in another tab, this fetches the latest data.
     */
  }
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

  {
    /*
    Provides auth state and functions to child components
    isTrainer - convenience boolean to check if user is a trainer
    */
  }
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
