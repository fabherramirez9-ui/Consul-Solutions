import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

// Components
import Welcome from "./components/Welcome";
import Auth from "./components/Auth";
import SimpleLogin from "./components/SimpleLogin";
import Dashboard from "./components/Dashboard";
import ProfilingWizard from "./components/ProfilingWizard";
import SuggestionsView from "./components/SuggestionsView";
import DocumentEditor from "./components/DocumentEditor";
import AIAssistant from "./components/AIAssistant";
import CourseSystem from "./components/CourseSystem";
import FileManager from "./components/FileManager";
import { Toaster } from "./components/ui/sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Auth Context
const AuthContext = React.createContext(null);

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // No need for axios interceptor with fetch

  // Check authentication status on app load
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          // Validate token by making a request to user profile
          const response = await fetch(`${API}/establishments`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            // Token is valid
            setLoading(false);
          } else {
            // Token is invalid
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
            setLoading(false);
          }
        } catch (error) {
          // Token is invalid
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    checkAuth();
  }, [token]);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('token', authToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  const authContextValue = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-cyan-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={authContextValue}>
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/auth" element={
              authContextValue.isAuthenticated ? <Navigate to="/dashboard" /> : <Auth />
            } />
            <Route path="/simple-login" element={<SimpleLogin />} />
            <Route path="/test-login" element={<TestLogin />} />
            <Route path="/dashboard" element={
              authContextValue.isAuthenticated ? <Dashboard /> : <Navigate to="/auth" />
            } />
            <Route path="/profiling" element={
              authContextValue.isAuthenticated ? <ProfilingWizard /> : <Navigate to="/auth" />
            } />
            <Route path="/suggestions" element={
              authContextValue.isAuthenticated ? <SuggestionsView /> : <Navigate to="/auth" />
            } />
            <Route path="/editor/:templateId?" element={
              authContextValue.isAuthenticated ? <DocumentEditor /> : <Navigate to="/auth" />
            } />
            <Route path="/ai-assistant" element={
              authContextValue.isAuthenticated ? <AIAssistant /> : <Navigate to="/auth" />
            } />
            <Route path="/course" element={
              authContextValue.isAuthenticated ? <CourseSystem /> : <Navigate to="/auth" />
            } />
            <Route path="/files" element={
              authContextValue.isAuthenticated ? <FileManager /> : <Navigate to="/auth" />
            } />
          </Routes>
        </BrowserRouter>
        <Toaster />
      </div>
    </AuthContext.Provider>
  );
}

export default App;