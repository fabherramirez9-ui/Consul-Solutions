import React, { useState } from "react";

const TestLogin = () => {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    setLoading(true);
    setResult("Iniciando login...");

    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || window.location.origin;
      const API = `${BACKEND_URL}/api`;
      
      console.log("Testing login to:", API);
      
      const response = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@cofepris.com',
          password: 'password123'
        })
      });
      
      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);
      
      if (response.ok) {
        setResult(`✅ LOGIN SUCCESS! Token: ${data.token.substring(0, 30)}...`);
        localStorage.setItem('token', data.token);
        
        // Redirect after 2 seconds
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
      } else {
        setResult(`❌ LOGIN FAILED: ${data.detail}`);
      }
      
    } catch (error) {
      console.error("Login error:", error);
      setResult(`❌ ERROR: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      padding: '50px', 
      maxWidth: '500px', 
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>🧪 Test Login Component</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <p><strong>Email:</strong> test@cofepris.com</p>
        <p><strong>Password:</strong> password123</p>
        <p><strong>Backend:</strong> {process.env.REACT_APP_BACKEND_URL}</p>
      </div>
      
      <button 
        onClick={testLogin}
        disabled={loading}
        style={{
          padding: '15px 30px',
          fontSize: '16px',
          backgroundColor: '#10b981',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: loading ? 'not-allowed' : 'pointer',
          width: '100%'
        }}
      >
        {loading ? 'Testing...' : '🚀 Test Login'}
      </button>
      
      <div style={{
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        minHeight: '60px',
        whiteSpace: 'pre-wrap'
      }}>
        <strong>Result:</strong><br />
        {result || 'Click the button to test login'}
      </div>
      
      <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
        <p>This is a debug component to test the login functionality.</p>
        <p>Check browser console for detailed logs.</p>
      </div>
    </div>
  );
};

export default TestLogin;