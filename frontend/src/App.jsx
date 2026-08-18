import {
  getAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  login,
  register,
  logout,
  getCurrentUser,
  getVisaTypes, 
} from './services/api';
import { useState, useEffect } from 'react'; 
// 👇 ADD THESE TWO CRUCIAL IMPORTS 👇
import { useTheme } from './ThemeContext'; 
import VisaTypes from './components/VisaTypes';
import NavTabs from './components/NavTabs';
import AuthSection from './components/AuthSection'; 
import AppointmentForm from './components/AppointmentForm'; 
import AppointmentList from './components/AppointmentList'; 
import AdminDashboard from './components/AdminDashboard';

// Helper component for the toggle button (Moved inside App.jsx for simplicity)
function ThemeToggleButton() {
  const { isDarkMode, toggleTheme } = useTheme();
  return (
    <button 
      className="theme-toggle" 
      onClick={toggleTheme} 
      title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
    </button>
  );
}

function App() {
  const [user, setUser] = useState(getCurrentUser());
  const [view, setView] = useState('client');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [visaTypes, setVisaTypes] = useState([]); 

  // Load visa types when the app starts
  useEffect(() => {
    const loadVisaTypes = async () => {
      try {
        const data = await getVisaTypes();
        if (Array.isArray(data)) {
          setVisaTypes(data);
        } else {
          setVisaTypes([]);
        }
      } catch (err) {
        console.error("Failed to load visa types", err);
        setVisaTypes([]);
      }
    };
    loadVisaTypes();
  }, []);

  const loadAppointments = async () => {
    if (!getCurrentUser()) return;
    setLoading(true);
    try {
      const data = await getAppointments();
      setAppointments(data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const handleLogin = async (email, pass) => {
    try {
      const data = await login(email, pass);
      setUser(data.user); 
      
      if (data.user.role === 'admin') setView('admin');
      else setView('client');
      
      await loadAppointments(); 
      return true;
    } catch (err) {
      alert(err.message);
      return false;
    }
  };

  const handleRegister = async (email, pass) => {
    try {
      await register(email, pass);
      alert('Registration successful! Please login.');
      return true;
    } catch (err) {
      alert(err.message);
      return false;
    }
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setView('client');
    setAppointments([]);
  };

  const handleAddAppointment = async (apptData) => {
    try {
      await createAppointment(apptData);
      await loadAppointments();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await updateAppointment(id, { status });
      await loadAppointments();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteAppointment = async (id) => {
    if (!window.confirm('Delete this appointment?')) return;
    try {
      await deleteAppointment(id);
      await loadAppointments();
    } catch (err) {
      alert(err.message);
    }
  };

  const isAdmin = user?.role === 'admin';
  const isLoggedIn = !!user;

  // The backend already filters appointments correctly for users.
  const displayedAppointments = appointments; 

  return (
    <div className="app-wrapper">
        <header className="brand-header">
        <div className="brand">
          <i className="fas fa-passport"></i>
          <h1>Estishara <span>· visa</span></h1>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          
          {/* 🌙 THEME TOGGLE BUTTON */}
          <ThemeToggleButton />

          <div className="auth-badge">
            {isLoggedIn ? (
              <>
                <i className="fas fa-user-circle"></i> {user.email}
                <span style={{ fontWeight: 400, color: '#64748b' }}>({user.role})</span>
                <button className="btn btn-danger-outline" onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt"></i> Logout
                </button>
              </>
            ) : (
              <span style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <i className="fas fa-lock"></i> Not logged in
              </span>
            )}
          </div>
        </div>
      </header>

      {!isLoggedIn && ( <AuthSection onLogin={handleLogin} onRegister={handleRegister} /> )}

      {isLoggedIn && ( <NavTabs view={view} setView={setView} isAdmin={isAdmin} /> )}

      {/* --- VIEW SWITCHING LOGIC --- */}
      {isLoggedIn && (
        <>
          {isAdmin && view === 'admin' ? (
            /* ADMIN DASHBOARD VIEW */
            <AdminDashboard />
          ) : (
            /* CLIENT VIEW (OR ADMIN VIEWING CLIENTS) */
            <>
              {/* Visa Types only visible to clients */}
              {!isAdmin && <VisaTypes visaTypes={visaTypes} />}

              {/* Booking form only visible to clients */}
              {!isAdmin && (
                <AppointmentForm visaTypes={visaTypes} onAdd={handleAddAppointment} />
              )}
              
              <div className="section-title">
                <h2>
                  <i className="fas fa-clock" style={{ marginRight: '10px', color: '#4f46e5' }}></i>
                  {isAdmin ? 'All appointments' : 'My appointments'}
                </h2>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  {loading ? 'Loading...' : `${displayedAppointments.length} total`}
                </span>
              </div>
              
              {error && (
                <div style={{ color: '#dc2626', padding: '12px', background: '#fef2f2', borderRadius: '12px', marginBottom: '10px', border: '1px solid #fecaca' }}>
                  Error: {error}
                </div>
              )}
              <AppointmentList
                appointments={displayedAppointments}
                isAdmin={isAdmin}
                currentUser={user}
                onUpdateStatus={handleUpdateStatus}
                onDelete={handleDeleteAppointment}
              />
            </>
          )}
        </>
      )}

      {!isLoggedIn && (
        <div className="login-prompt">
          <i className="fas fa-lock" style={{ fontSize: '2.5rem', color: '#cbd5e1' }}></i>
          <p style={{ marginTop: '12px', fontWeight: 500, color: '#475569' }}>
            Please login or register to manage your visa appointments.
          </p>
        </div>
      )}

      <footer className="app-footer">
        <i className="fas fa-shield-alt"></i> Estishara · Spain visa consultation
      </footer>
    </div>
  );
}

export default App;