import React, { useEffect, useState } from 'react';
import { getVisaTypes } from '../services/api';

function VisaTypes() {
  const [visaTypes, setVisaTypes] = useState([]);

  useEffect(() => {
    const loadVisaTypes = async () => {
      try {
        const data = await getVisaTypes();

        console.log('Visa types API response:', data);

        setVisaTypes(data);
      } catch (error) {
        console.error('Failed to load visa types:', error);
      }
    };

    loadVisaTypes();
  }, []);

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '6px'
        }}
      >
        <h3 style={{ fontWeight: 600, fontSize: '1.1rem' }}>
          <i
            className="fas fa-list-ul"
            style={{ marginRight: '10px', color: '#1e4f8a' }}
          ></i>
          Spain visa types
        </h3>
      </div>

      <div className="visa-grid">
        {visaTypes.map((v) => (
          <div className="visa-card" key={v.id}>
            <i className={`fas ${v.icon}`}></i>
            <h4>{v.name}</h4>
            <p>{v.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default VisaTypes;