// File: frontend/src/components/NavTabs.jsx
import React from 'react';

function NavTabs({ view, setView, isAdmin }) {
  return (
    <div className="nav-tabs">
      <button
        className={`nav-tab ${view === 'client' ? 'active' : ''}`}
        onClick={() => setView('client')}
      >
        <i className="fas fa-calendar-check"></i> Client
      </button>
      {isAdmin && (
        <button
          className={`nav-tab ${view === 'admin' ? 'active' : ''}`}
          onClick={() => setView('admin')}
        >
          <i className="fas fa-user-cog"></i> Admin
        </button>
      )}
    </div>
  );
}

export default NavTabs;