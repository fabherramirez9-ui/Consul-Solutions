import React, { useState } from "react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SimpleLogin = () => {
  const [email, setEmail] = useState('test@cofepris.com');
  const [password, setPassword] = useState('test123456');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    console.log('Login button clicked');
    console.log('Backend URL:', BACKEND_URL);
    console.log('API URL:', API);
    
    setLoading(true);
    setResult('Logging in...');
    
    try {
      console.log('Making fetch request...');
      const response = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      });
      
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Login response:', data);
      
      if (response.ok) {
        setResult(`Success! Token: ${data.token.substring(0, 20)}...`);
        
        // Save token
        localStorage.setItem('token', data.token);
        
        // Redirect to dashboard
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1000);
        
      } else {
        setResult(`Error: ${data.detail || 'Login failed'}`);
      }
      
    } catch (error) {
      console.error('Login error:', error);
      setResult(`Network Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '50px auto' }}>
      <h2>Simple Login Test</h2>
      
      <div style={{ marginBottom: '15px' }}>
        <label>Email:</label>
        <input 
          type="email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: '100%', padding: '8px', marginTop: '5px' }}
        />
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <label>Password:</label>
        <input 
          type="password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '100%', padding: '8px', marginTop: '5px' }}
        />
      </div>
      
      <button 
        onClick={handleLogin}
        disabled={loading}
        style={{ 
          width: '100%', 
          padding: '12px', 
          backgroundColor: '#10b981', 
          color: 'white', 
          border: 'none', 
          borderRadius: '8px',
          cursor: 'pointer'
        }}
        id="simple-login-btn"
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>
      
      <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
        <strong>Result:</strong> {result}
      </div>
      
      <div style={{ marginTop: '15px', fontSize: '12px', color: '#666' }}>
        <p>Backend URL: {BACKEND_URL}</p>
        <p>API URL: {API}</p>
      </div>
    </div>
  );
};

export default SimpleLogin;