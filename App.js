import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Signup from './components/Signup';
import Login from './components/Login';
import Subscription from './components/Subscription';
import Dashboard from './components/Dashboard';
import { supabase } from './utils/supabaseClient';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, check for existing session and set up auth listener
  useEffect(() => {
    const session = supabase.auth.session();
    setUser(session?.user ?? null);
    setLoading(false);
    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      listener?.unsubscribe();
    };
  }, []);

  if (loading) {
    return <div style={{textAlign:'center',marginTop:'3rem'}}>Cargando...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/subscription" element={<Subscription />} />
        <Route
          path="/dashboard"
          element={
            user ? <Dashboard userId={user.id} /> : <Navigate to="/login" replace />
          }
        />
        {/* Default route: redirect to dashboard if logged in, else login */}
        <Route
          path="*"
          element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </Router>
  );
}

export default App; 