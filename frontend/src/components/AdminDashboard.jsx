import React, { useEffect, useState } from 'react';
import { getAdminStats, updateAppointment } from '../services/api';

function AdminDashboard() {
  const [data, setData] = useState({ stats: {}, recentAppointments: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingPriceId, setEditingPriceId] = useState(null);
  const [newPrice, setNewPrice] = useState('');

  const fetchStats = async () => {
    setLoading(true);
    try {
      const result = await getAdminStats();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Handle Price Update
  const handlePriceUpdate = async (id) => {
    if (!newPrice || isNaN(newPrice)) {
      alert("Please enter a valid number");
      return;
    }
    try {
      await updateAppointment(id, { price: parseFloat(newPrice) });
      
      setEditingPriceId(null);
      setNewPrice('');
      fetchStats(); // Refresh the dashboard
    } catch (err) {
      alert("Failed to update price: " + err.message);
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading dashboard...</div>;
  if (error) return <div style={{ color: '#dc2626', padding: '20px', background: '#fef2f2', borderRadius: '12px' }}>Error: {error}</div>;

  const { stats, recentAppointments } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* STATS CARDS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' }}>
        <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)', textAlign: 'center', boxShadow: '0 2px 4px var(--shadow-color)' }}>
          <div style={{ color: '#4f46e5', fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.totalClients}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>Total Clients</div>
        </div>
        <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)', textAlign: 'center', boxShadow: '0 2px 4px var(--shadow-color)' }}>
          <div style={{ color: '#2563eb', fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.totalAppointments}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>Total Appointments</div>
        </div>
        <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)', textAlign: 'center', boxShadow: '0 2px 4px var(--shadow-color)' }}>
          <div style={{ color: '#10b981', fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.confirmedAppointments}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>Confirmed</div>
        </div>
        <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)', textAlign: 'center', boxShadow: '0 2px 4px var(--shadow-color)' }}>
          <div style={{ color: '#f59e0b', fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.pendingAppointments}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>Pending</div>
        </div>
        <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)', textAlign: 'center', boxShadow: '0 2px 4px var(--shadow-color)' }}>
          <div style={{ color: '#8b5cf6', fontSize: '1.5rem', fontWeight: 'bold' }}>${stats.totalProfit ? stats.totalProfit.toFixed(2) : '0.00'}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>Total Profit</div>
        </div>
      </div>

      {/* RECENT APPOINTMENTS TABLE WITH EDITABLE PRICE */}
      <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-color)', padding: '20px', boxShadow: '0 2px 4px var(--shadow-color)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>Manage Appointments & Prices</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{recentAppointments.length} latest</span>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {recentAppointments.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-light)', padding: '20px' }}>No recent appointments.</div>
          ) : (
            recentAppointments.map((appt) => (
              <div key={appt.id} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                padding: '14px 16px', 
                background: 'var(--bg-input)', 
                borderRadius: '12px',
                borderLeft: `4px solid ${appt.status === 'confirmed' ? '#10b981' : '#f59e0b'}`
              }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{appt.client_name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '12px', marginTop: '2px' }}>
                    <span><i className="far fa-envelope"></i> {appt.client_email}</span>
                    <span><i className="fas fa-tag"></i> {appt.visa_type}</span>
                    <span><i className="far fa-calendar-alt"></i> {appt.date}</span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ 
                    background: appt.status === 'confirmed' ? '#d1fae5' : '#fef3c7', 
                    color: appt.status === 'confirmed' ? '#065f46' : '#b45309',
                    padding: '4px 12px', 
                    borderRadius: '60px', 
                    fontSize: '0.75rem', 
                    fontWeight: 600 
                  }}>
                    {appt.status}
                  </span>

                  {/* EDITABLE PRICE SECTION */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {editingPriceId === appt.id ? (
                      <>
                        <input 
                          type="number" 
                          step="0.01"
                          value={newPrice}
                          onChange={(e) => setNewPrice(e.target.value)}
                          style={{ width: '70px', padding: '4px 8px', borderRadius: '6px', border: '1px solid #4f46e5', fontSize: '0.85rem', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                          placeholder="30.00"
                        />
                        <button 
                          onClick={() => handlePriceUpdate(appt.id)}
                          style={{ background: '#4f46e5', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer' }}
                        >
                          Save
                        </button>
                        <button 
                          onClick={() => { setEditingPriceId(null); setNewPrice(''); }}
                          style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer' }}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <span style={{ fontWeight: 600, color: '#059669', fontSize: '0.9rem', marginRight: '6px' }}>
                          ${parseFloat(appt.price || 0).toFixed(2)}
                        </span>
                        <button 
                          onClick={() => { setEditingPriceId(appt.id); setNewPrice(appt.price || '30.00'); }}
                          style={{ background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border-color)', padding: '2px 8px', borderRadius: '6px', fontSize: '0.7rem', cursor: 'pointer' }}
                        >
                          <i className="fas fa-edit"></i> Edit
                        </button>
                      </>
                    )}
                  </div>

                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;