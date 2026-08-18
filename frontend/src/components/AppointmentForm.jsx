import React, { useState, useEffect } from 'react';
import { getBookedTimes } from '../services/api';

function AppointmentForm({ onAdd }) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [bookedTimes, setBookedTimes] = useState([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);

  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    meetingPlatform: 'Zoom',
  });

  const generateTimeSlots = () => {
    const slots = [];
    for (let i = 9; i <= 17; i++) {
      const hour = i < 10 ? `0${i}` : i;
      slots.push(`${hour}:00`);
      slots.push(`${hour}:30`);
    }
    return slots;
  };

  // FETCH BOOKED TIMES
  useEffect(() => {
    const fetchBookedTimes = async () => {
      if (!selectedDate) {
        setBookedTimes([]);
        return;
      }

      setIsLoadingAvailability(true);
      try {
        // 🔥 FORCE CORRECT DATE FORMAT (YYYY-MM-DD) NO MATTER WHAT BROWSER YOU USE
        const dateObj = new Date(selectedDate + 'T00:00:00');
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        const isoDate = `${year}-${month}-${day}`; 

        console.log("📤 SENDING TO BACKEND:", isoDate);
        
        const data = await getBookedTimes(isoDate);
        if (Array.isArray(data)) {
          setBookedTimes(data);
        }
      } catch (error) {
        console.error("Failed to fetch booked times", error);
        setBookedTimes([]);
      } finally {
        setIsLoadingAvailability(false);
      }
    };

    fetchBookedTimes();
  }, [selectedDate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.clientName || !formData.clientEmail || !selectedDate || !selectedTime) {
      alert('Please fill all fields and select a date/time');
      return;
    }

    // Generate the correct date string for the backend
    const dateObj = new Date(selectedDate + 'T00:00:00');
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const finalDate = `${year}-${month}-${day}`;

    try {
      await onAdd({ ...formData, date: finalDate, time: selectedTime });
      
      // Reset form on success
      setFormData({
        clientName: '',
        clientEmail: '',
        meetingPlatform: 'Zoom',
      });
      setSelectedDate('');
      setSelectedTime('');
      setBookedTimes([]);
    } catch (error) {
      // 🔥 If the backend rejects it because it's a duplicate, show an alert!
      alert("This time slot was just taken by someone else! Please pick a different time.");
      // Force the availability to reload
      setSelectedTime('');
      if(selectedDate) {
        // Trigger a re-fetch to update the grayed-out buttons
        const dateObj2 = new Date(selectedDate + 'T00:00:00');
        const year2 = dateObj2.getFullYear();
        const month2 = String(dateObj2.getMonth() + 1).padStart(2, '0');
        const day2 = String(dateObj2.getDate()).padStart(2, '0');
        const isoDate2 = `${year2}-${month2}-${day2}`; 
        const data = await getBookedTimes(isoDate2);
        if (Array.isArray(data)) setBookedTimes(data);
      }
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <form className="form-card" onSubmit={handleSubmit} style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <div style={{ 
        marginTop: '12px', 
        padding: '20px', 
        background: 'var(--bg-input)', // ✅ CHANGED FROM #f8fafc TO var(--bg-input)
        borderRadius: '16px', 
        border: '1px dashed var(--border-color)' // ✅ ADDED var(--border-color)
      }}>
        <div className="form-group" style={{ flex: '1 0 200px' }}>
          <label>Full name</label>
          <input type="text" name="clientName" value={formData.clientName} onChange={handleChange} placeholder="Client name" />
        </div>
        <div className="form-group" style={{ flex: '1 0 200px' }}>
          <label>Email</label>
          <input type="email" name="clientEmail" value={formData.clientEmail} onChange={handleChange} placeholder="client@email.com" />
        </div>
        <div className="form-group" style={{ flex: '1 0 200px' }}>
          <label>Preferred Meeting Platform</label>
          <select name="meetingPlatform" value={formData.meetingPlatform} onChange={handleChange}>
            <option value="Zoom">Zoom</option>
            <option value="Microsoft Teams">Microsoft Teams</option>
            <option value="Google Meet">Google Meet</option>
            <option value="In-Person (Office)">In-Person (Office)</option>
          </select>
        </div>
      </div>

      {/* CALENDAR & TIME PICKER SECTION */}
      {/* CALENDAR & TIME PICKER SECTION */}
      <div style={{ 
        marginTop: '12px', 
        padding: '20px', 
        background: 'var(--bg-input)', // ✅ Fixed: Dark mode handles this
        borderRadius: '16px', 
        border: '1px dashed var(--border-color)' // ✅ Fixed: Changed hardcoded #cbd5e1 to theme variable
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-main)' }}>
            <i className="fas fa-calendar-alt" style={{ marginRight: '8px', color: 'var(--primary)' }}></i> Pick a Date & Time
          </h4>
          {isLoadingAvailability && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Checking availability...</span>}
          {!isLoadingAvailability && selectedDate && (
            <span style={{ fontSize: '0.75rem', color: bookedTimes.length > 0 ? '#ef4444' : '#10b981' }}>
              ({bookedTimes.length} slots taken)
            </span>
          )}
        </div>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center' }}>
          <div className="form-group" style={{ flex: '0 0 200px' }}>
            <label style={{ color: 'var(--text-muted)' }}>Select Date</label>
            <input 
              type="date" 
              value={selectedDate} 
              min={today}
              onChange={(e) => setSelectedDate(e.target.value)}
              // ✅ FIX: Changed hardcoded 'white' to 'var(--bg-card)'
              style={{ 
                background: 'var(--bg-card)', 
                color: 'var(--text-main)',
                border: selectedDate ? '2px solid var(--primary)' : '1px solid var(--border-color)' 
              }}
            />
          </div>
          
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Available Slots
            </label>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {generateTimeSlots().map((time) => {
                const isBooked = bookedTimes.includes(time);
                
                return (
                  <button
                    key={time}
                    type="button"
                    disabled={isBooked}
                    onClick={() => setSelectedTime(time)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '12px',
                      cursor: isBooked ? 'not-allowed' : 'pointer',
                      transition: '0.15s',
                      minWidth: '60px',
                      textAlign: 'center',
                      fontWeight: 500,
                      fontSize: '0.8rem',
                      ...(isBooked 
                        ? { 
                            background: 'var(--bg-hover)',
                            color: 'var(--text-light)', 
                            border: '1px solid transparent',
                            textDecoration: 'line-through'
                          } 
                        : selectedTime === time 
                        ? { 
                            background: '#eef2ff', 
                            color: 'var(--primary)', 
                            border: '2px solid var(--primary)' 
                          } 
                        : { 
                            background: 'var(--bg-card)',
                            color: 'var(--text-main)', 
                            border: '1px solid var(--border-color)'
                          }
                      )
                    }}
                  >
                    {time}
                    {isBooked && <span style={{fontSize: '0.65rem', display: 'block'}}>Booked</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-end', marginTop: '8px' }}>
        <i className="fas fa-plus-circle"></i> Book Appointment
      </button>
    </form>
  );
}

export default AppointmentForm;