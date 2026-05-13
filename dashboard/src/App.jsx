import React, { useState, useEffect } from 'react'

function App() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('/api/meetings/cost-trend')
      .then(res => {
        if (!res.ok) throw new Error('Backend not responding')
        return res.json()
      })
      .then(data => {
        setData(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingCard}>
          <div style={styles.emoji}>💰</div>
          <h2>Loading Meeting Costs...</h2>
          <p>Make sure backend is running on port 3001</p>
          <div style={styles.spinner}></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorCard}>
          <div style={styles.emoji}>❌</div>
          <h2>Connection Error</h2>
          <p>{error}</p>
          <p style={{ fontSize: '14px', marginTop: '10px' }}>
            Please run: <code style={{ background: '#ddd', padding: '2px 6px', borderRadius: '4px' }}>cd C:\meeting-cost-calculator\backend && npm start</code>
          </p>
        </div>
      </div>
    )
  }

  const maxCost = Math.max(...data.costTrend.map(d => d.cost))

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>💰 Meeting Cost Calculator</h1>
        <p style={styles.subtitle}>Know the true cost of every meeting before you accept</p>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Total Meeting Cost</div>
          <div style={styles.statValue}>${data.weeklyCost.toLocaleString()}</div>
          <div style={styles.statSub}>This week</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Meetings This Week</div>
          <div style={styles.statValue}>{data.meetingsCount}</div>
          <div style={styles.statSub}>Avg ${Math.round(data.weeklyCost / data.meetingsCount)} per meeting</div>
        </div>
        <div style={{ ...styles.statCard, background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)' }}>
          <div style={{ ...styles.statLabel, color: '#2e7d32' }}>Estimated Savings</div>
          <div style={{ ...styles.statValue, color: '#2e7d32' }}>${data.savings.toLocaleString()}</div>
          <div style={{ ...styles.statSub, color: '#2e7d32' }}>From async alternatives</div>
        </div>
      </div>

      {/* Top Meetings Table */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>🏆 Most Expensive Meetings</h2>
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.th}>Meeting</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Attendees</th>
                <th style={styles.th}>Cost</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {data.topMeetings.map((meeting, i) => (
                <tr key={i} style={styles.tableRow}>
                  <td style={styles.td}><strong>{meeting.name}</strong></td>
                  <td style={styles.td}>{meeting.date}</td>
                  <td style={styles.td}>{meeting.attendees} people</td>
                  <td style={{ ...styles.td, color: '#e53935', fontWeight: 'bold' }}>${meeting.cost}</td>
                  <td style={styles.td}>
                    <button style={styles.suggestButton} onClick={() => {
                      navigator.clipboard.writeText(`💡 Suggestion: This meeting (${meeting.name}) would cost $${meeting.cost}. Can we cover this async?`)
                      alert('✅ Suggestion copied to clipboard!')
                    }}>
                      📋 Suggest Async
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cost Trend Chart */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>📊 Daily Cost Trend</h2>
        <div style={styles.chartContainer}>
          {data.costTrend.map((day) => (
            <div key={day.day} style={styles.chartBar}>
              <div style={{ textAlign: 'center', marginBottom: '8px', fontSize: '12px', fontWeight: 'bold' }}>{day.day}</div>
              <div style={styles.barWrapper}>
                <div style={{
                  ...styles.bar,
                  height: `${Math.max(30, (day.cost / maxCost) * 150)}px`,
                  background: day.cost > 800 ? '#e53935' : day.cost > 400 ? '#fb8c00' : '#43a047'
                }}>
                  <span style={styles.barLabel}>${day.cost}</span>
                </div>
              </div>
              <div style={{ fontSize: '11px', color: '#666', marginTop: '8px' }}>{day.meetings} mtgs</div>
            </div>
          ))}
        </div>
      </div>

      {/* Pro Tip Box */}
      <div style={styles.tipBox}>
        <div style={{ fontSize: '24px', marginBottom: '8px' }}>💡</div>
        <div>
          <strong>Pro Tip:</strong> Install the Chrome extension to see cost badges directly on Google Calendar events.
          Click "Suggest Async" to propose async alternatives and track savings in this dashboard.
        </div>
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <p>© 2026 Meeting Cost Calculator | Built for Internal Tools Hacks</p>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#f0f2f5',
    padding: '20px'
  },
  loadingCard: {
    maxWidth: '500px',
    margin: '100px auto',
    textAlign: 'center',
    background: 'white',
    padding: '40px',
    borderRadius: '16px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  },
  errorCard: {
    maxWidth: '500px',
    margin: '100px auto',
    textAlign: 'center',
    background: '#ffebee',
    padding: '40px',
    borderRadius: '16px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  },
  emoji: {
    fontSize: '48px',
    marginBottom: '20px'
  },
  spinner: {
    width: '40px',
    height: '40px',
    margin: '20px auto',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #0066ff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px'
  },
  title: {
    fontSize: '36px',
    color: '#1a1a1a',
    marginBottom: '8px'
  },
  subtitle: {
    fontSize: '16px',
    color: '#666'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '32px'
  },
  statCard: {
    background: 'white',
    padding: '24px',
    borderRadius: '16px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'pointer'
  },
  statLabel: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  },
  statValue: {
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: '8px'
  },
  statSub: {
    fontSize: '12px',
    color: '#666'
  },
  section: {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  sectionTitle: {
    marginBottom: '20px',
    fontSize: '20px',
    color: '#1a1a1a'
  },
  tableContainer: {
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  tableHeader: {
    background: '#f5f5f5',
    borderBottom: '2px solid #ddd'
  },
  th: {
    textAlign: 'left',
    padding: '12px',
    fontWeight: '600',
    color: '#333'
  },
  tableRow: {
    borderBottom: '1px solid #eee',
    transition: 'background 0.2s'
  },
  td: {
    padding: '12px',
    color: '#444'
  },
  suggestButton: {
    background: '#0066ff',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    transition: 'background 0.2s'
  },
  chartContainer: {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    gap: '20px',
    padding: '20px 0',
    flexWrap: 'wrap'
  },
  chartBar: {
    flex: 1,
    textAlign: 'center',
    minWidth: '60px'
  },
  barWrapper: {
    display: 'flex',
    justifyContent: 'center'
  },
  bar: {
    width: '50px',
    borderRadius: '8px 8px 0 0',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    transition: 'height 0.3s',
    minHeight: '30px'
  },
  barLabel: {
    color: 'white',
    fontSize: '11px',
    fontWeight: 'bold',
    padding: '4px'
  },
  tipBox: {
    background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdef5 100%)',
    borderRadius: '16px',
    padding: '20px',
    display: 'flex',
    gap: '15px',
    alignItems: 'center',
    marginBottom: '24px'
  },
  footer: {
    textAlign: 'center',
    padding: '20px',
    color: '#666',
    fontSize: '12px'
  }
}

// Add animation to document
const styleSheet = document.createElement("style")
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  .stat-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0,0,0,0.1);
  }
  button:hover {
    background: #0052cc !important;
    transform: scale(1.02);
  }
  tr:hover {
    background: #f9f9f9;
  }
`
document.head.appendChild(styleSheet)

export default App
