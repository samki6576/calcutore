import React, { useState, useEffect } from 'react';
import { getMeetings, getMeetingStats, getTotalSavings, addMeeting, saveSuggestion, deleteMeeting } from './firebase';

function App() {
  const [meetings, setMeetings] = useState([]);
  const [stats, setStats] = useState({ totalCost: 0, totalMeetings: 0, avgCostPerMeeting: 0, costTrend: [] });
  const [totalSavings, setTotalSavings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [attendees, setAttendees] = useState(4);
  const [hours, setHours] = useState(1);
  const [rate, setRate] = useState(100);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const loadData = async () => {
    setLoading(true);
    const [meetingsRes, statsRes, savingsRes] = await Promise.all([
      getMeetings(), getMeetingStats(), getTotalSavings()
    ]);
    if (meetingsRes.success) setMeetings(meetingsRes.data);
    if (statsRes.success) setStats(statsRes.data);
    if (savingsRes.success) setTotalSavings(savingsRes.total);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleAddMeeting = async (e) => {
    e.preventDefault();
    const result = await addMeeting({ name, attendees, durationHours: hours, hourlyRate: rate, date });
    if (result.success) {
      alert('✅ Meeting added!');
      setShowForm(false);
      setName('');
      setAttendees(4);
      setHours(1);
      setRate(100);
      setDate(new Date().toISOString().split('T')[0]);
      loadData();
    } else {
      alert('❌ Error: ' + result.error);
    }
  };

  const handleSuggest = async (meeting) => {
    const text = "Meeting Cost Suggestion: " + meeting.name + " costs $" + meeting.totalCost + ". Can we do this async?";
    await navigator.clipboard.writeText(text);
    await saveSuggestion(meeting);
    alert("✅ Saved $" + meeting.totalCost);
    loadData();
  };

  const formatMoney = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val || 0);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', color: 'white' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid white', borderTop: '4px solid #667eea', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }}></div>
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', background: 'rgba(255,255,255,0.1)', padding: '15px 20px', borderRadius: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <img src="/logo.png" alt="Logo" style={{ height: '50px', width: 'auto', borderRadius: '10px' }} />
          <div>
            <h1 style={{ color: 'white', fontSize: '24px', margin: 0 }}>Meeting Cost Calculator</h1>
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '12px' }}>Know the true cost of every meeting</p>
          </div>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ background: 'white', color: '#667eea', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
          {showForm ? 'Cancel' : '+ Add Meeting'}
        </button>
      </div>

      {showForm && (
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
          <h3>Add New Meeting</h3>
          <form onSubmit={handleAddMeeting}>
            <input type="text" placeholder="Meeting name" required value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', padding: '12px', margin: '8px 0', border: '1px solid #ddd', borderRadius: '8px' }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
              <input type="number" placeholder="Attendees" required min="1" value={attendees} onChange={(e) => setAttendees(parseInt(e.target.value))} style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }} />
              <input type="number" placeholder="Hours" required min="0.5" step="0.5" value={hours} onChange={(e) => setHours(parseFloat(e.target.value))} style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }} />
              <input type="number" placeholder="Hourly rate" required min="50" value={rate} onChange={(e) => setRate(parseInt(e.target.value))} style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }} />
              <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }} />
            </div>
            <button type="submit" style={{ width: '100%', padding: '12px', marginTop: '12px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
              Save (Total: {formatMoney(attendees * hours * rate)})
            </button>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '24px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px' }}>💰</div>
          <div style={{ fontSize: '12px', color: '#666' }}>TOTAL COST</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{formatMoney(stats.totalCost)}</div>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px' }}>📊</div>
          <div style={{ fontSize: '12px', color: '#666' }}>MEETINGS</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{stats.totalMeetings}</div>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px' }}>📈</div>
          <div style={{ fontSize: '12px', color: '#666' }}>AVERAGE</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{formatMoney(stats.avgCostPerMeeting)}</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #e8f5e9, #c8e6c9)', padding: '20px', borderRadius: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px' }}>🎉</div>
          <div style={{ fontSize: '12px', color: '#2e7d32' }}>SAVINGS</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#2e7d32' }}>{formatMoney(totalSavings)}</div>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '16px', padding: '24px' }}>
        <h2>📋 Recent Meetings</h2>
        {meetings.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '40px' }}>No meetings yet. Click "Add Meeting" to start!</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f5f5f5' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>Meeting</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Date</th>
                <th style={{ padding: '12px' }}>People</th>
                <th style={{ padding: '12px' }}>Cost</th>
                <th style={{ padding: '12px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {meetings.map((m) => (
                <tr key={m.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}><strong>{m.name}</strong></td>
                  <td style={{ padding: '12px' }}>{m.date}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>{m.attendees}</td>
                  <td style={{ padding: '12px', color: '#e53935', fontWeight: 'bold' }}>{formatMoney(m.totalCost)}</td>
                  <td style={{ padding: '12px' }}>
                    <button onClick={() => handleSuggest(m)} style={{ background: '#0066ff', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', marginRight: '8px' }}>Suggest</button>
                    <button onClick={() => { if(confirm('Delete?')) deleteMeeting(m.id).then(() => loadData()); }} style={{ background: '#ddd', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={{ marginTop: '24px', padding: '20px', background: 'linear-gradient(135deg, #e3f2fd, #bbdef5)', borderRadius: '16px', textAlign: 'center' }}>
        💡 Pro Tip: Every "Suggest" click saves money! Average company saves $1,240/week.
      </div>

      <div style={{ textAlign: 'center', padding: '20px', color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>
        Powered by Firebase Firestore
      </div>
    </div>
  );
}

export default App;
