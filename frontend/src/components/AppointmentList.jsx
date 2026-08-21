import React from 'react';
import { updateAppointment } from '../services/api';

function AppointmentList({ appointments, isAdmin, currentUser, onUpdateStatus, onDelete, refreshAppointments }) {
  
  const handleGenerateLink = async (appointment) => {
    // ✅ Check if user is authenticated
    const token = localStorage.getItem('estishara_token');
    if (!token) {
      alert('Please log in again to generate meeting links.');
      return;
    }

    let generatedLink = '';
    const platform = appointment.visa_type || 'Video';

    if (platform.toLowerCase().includes('zoom')) {
      generatedLink = `https://zoom.us/j/${Math.floor(Math.random() * 1000000000)}`;
    } else if (platform.toLowerCase().includes('teams')) {
      generatedLink = `https://teams.microsoft.com/l/meetup-join/${Math.random().toString(36).substring(7)}`;
    } else if (platform.toLowerCase().includes('meet')) {
      generatedLink = `https://meet.google.com/${Math.random().toString(36).substring(2, 8)}`;
    } else {
      generatedLink = `https://meeting.estishara.com/${Math.random().toString(36).substring(7)}`;
    }

    try {
      // ✅ Use 'meetingLink' (camelCase) - the backend expects this
      await updateAppointment(appointment.id, { meetingLink: generatedLink });
      alert(`✅ Link Generated and Saved!\n\n${generatedLink}`);
      if (refreshAppointments) refreshAppointments();
    } catch (error) {
      alert("Failed to save link: " + error.message);
    }
  };

  if (appointments.length === 0) {
    return (
      <div style={{ 
        padding: '40px', 
        background: 'var(--bg-card)',
        borderRadius: '20px', 
        textAlign: 'center', 
        color: 'var(--text-muted)',
        border: '1px solid var(--border-color)'
      }}>
        <i className="fas fa-calendar-check" style={{ fontSize: '2.5rem', color: 'var(--text-light)', marginBottom: '12px' }}></i>
        <br />
        <strong style={{ color: 'var(--text-main)' }}>No appointments scheduled</strong>
        <p style={{ fontSize: '0.9rem', marginTop: '4px' }}>Use the form above to book your first slot.</p>
      </div>
    );
  }

  return (
    <div className="appt-list">
      {appointments.map((a) => (
        <div className="appt-item" key={a.id} style={{ borderLeft: `4px solid ${a.status === 'confirmed' ? '#10b981' : '#f59e0b'}` }}>
          <div className="appt-info">
            
            <div style={{ minWidth: '140px' }}>
              <strong>{a.client_name}</strong>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                <i className="far fa-envelope"></i> {a.client_email}
              </div>
            </div>

            {isAdmin && (
              <span className="meta" style={{ background: '#e0e7ff', padding: '4px 12px', borderRadius: '20px', color: '#4338ca', fontWeight: 500 }}>
                <i className="fas fa-video" style={{ marginRight: '4px' }}></i> {a.visa_type || 'Not specified'}
              </span>
            )}

            <div style={{ fontWeight: 500, minWidth: '100px' }}>
              <i className="far fa-calendar-alt"></i> {a.date} <span style={{ color: '#64748b', fontSize: '0.85rem' }}>at</span> {a.time}
            </div>
            
            <span className={`badge-status ${a.status}`}>
              <i className={`fas ${a.status === 'confirmed' ? 'fa-check-circle' : 'fa-clock'}`} style={{ marginRight: '6px' }}></i>
              {a.status}
            </span>

            {/* RENDER MEETING LINK FOR BOTH ADMIN AND CLIENT */}
            {a.meeting_link && (
              <a 
                href={a.meeting_link} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  background: '#059669',
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: '60px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <i className="fas fa-external-link-alt"></i> Join Meeting
              </a>
            )}
          </div>

          <div className="appt-actions">
            
            {/* GENERATE LINK BUTTON (Only for Admin on Confirmed appointments without a link) */}
            {isAdmin && a.status === 'confirmed' && !a.meeting_link && (
              <button 
                className="btn btn-primary" 
                style={{ padding: '6px 16px', fontSize: '0.75rem', background: '#2563eb' }}
                onClick={() => handleGenerateLink(a)}
              >
                <i className="fas fa-link"></i> Generate Link
              </button>
            )}
            
            {isAdmin && (
              <>
                {a.status === 'pending' && (
                  <button className="btn btn-success" style={{ padding: '6px 16px', fontSize: '0.75rem' }} onClick={() => onUpdateStatus(a.id, 'confirmed')}>
                    <i className="fas fa-check"></i> Confirm
                  </button>
                )}
                {a.status === 'confirmed' && (
                  <button className="btn btn-outline" style={{ padding: '6px 16px', fontSize: '0.75rem', color: '#92400e', borderColor: '#fcd34d' }} onClick={() => onUpdateStatus(a.id, 'pending')}>
                    <i className="fas fa-undo"></i> Revert
                  </button>
                )}
              </>
            )}
            
            {(isAdmin || a.client_email === currentUser?.email) && (
              <button className="btn btn-danger-outline" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => onDelete(a.id)}>
                <i className="fas fa-trash-alt"></i>
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default AppointmentList;