import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get meeting costs
app.get('/api/meetings/cost-trend', (req, res) => {
  const data = {
    weeklyCost: 3240,
    meetingsCount: 15,
    savings: 1240,
    topMeetings: [
      { name: 'Product Sync', cost: 840, attendees: 8, date: '2026-05-11' },
      { name: 'Engineering Planning', cost: 620, attendees: 6, date: '2026-05-10' },
      { name: 'Design Review', cost: 480, attendees: 4, date: '2026-05-09' },
      { name: 'All Hands', cost: 1250, attendees: 25, date: '2026-05-08' },
      { name: 'Client Call', cost: 320, attendees: 3, date: '2026-05-07' }
    ],
    costTrend: [
      { day: 'Mon', cost: 840, meetings: 4 },
      { day: 'Tue', cost: 620, meetings: 3 },
      { day: 'Wed', cost: 480, meetings: 2 },
      { day: 'Thu', cost: 1250, meetings: 5 },
      { day: 'Fri', cost: 50, meetings: 1 }
    ]
  };
  res.json(data);
});

// Export report
app.post('/api/reports/export', (req, res) => {
  res.json({ message: 'Report generated', downloadUrl: '/reports/weekly.csv' });
});

app.listen(PORT, () => {
  console.log('');
  console.log('=' .repeat(50));
  console.log('✅ BACKEND RUNNING');
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`🔗 Test: http://localhost:${PORT}/api/health`);
  console.log('=' .repeat(50));
  console.log('');
});
