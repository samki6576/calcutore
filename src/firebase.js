import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit, Timestamp, deleteDoc, doc } from 'firebase/firestore';

// Read configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const MEETINGS_COLLECTION = 'meetings';
const SAVINGS_COLLECTION = 'savings';

export const addMeeting = async (meetingData) => {
  try {
    const totalCost = meetingData.attendees * meetingData.durationHours * meetingData.hourlyRate;
    const docRef = await addDoc(collection(db, MEETINGS_COLLECTION), {
      ...meetingData,
      totalCost: totalCost,
      createdAt: Timestamp.now()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getMeetings = async () => {
  try {
    const q = query(collection(db, MEETINGS_COLLECTION), orderBy('createdAt', 'desc'), limit(50));
    const querySnapshot = await getDocs(q);
    const meetings = [];
    querySnapshot.forEach((doc) => {
      meetings.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: meetings };
  } catch (error) {
    return { success: false, error: error.message, data: [] };
  }
};

export const deleteMeeting = async (meetingId) => {
  try {
    await deleteDoc(doc(db, MEETINGS_COLLECTION, meetingId));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getMeetingStats = async () => {
  try {
    const meetings = await getMeetings();
    if (!meetings.success) return { success: false, error: meetings.error };
    
    const totalCost = meetings.data.reduce((sum, m) => sum + (m.totalCost || 0), 0);
    const totalMeetings = meetings.data.length;
    const avgCostPerMeeting = totalMeetings > 0 ? totalCost / totalMeetings : 0;
    
    const trend = {};
    meetings.data.forEach(m => {
      const date = m.date;
      if (!trend[date]) trend[date] = { cost: 0, count: 0 };
      trend[date].cost += m.totalCost || 0;
      trend[date].count++;
    });
    
    const costTrend = Object.entries(trend).map(([date, data]) => ({
      date, cost: data.cost, meetings: data.count
    })).slice(-7);
    
    return { success: true, data: { totalCost, totalMeetings, avgCostPerMeeting, costTrend } };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const saveSuggestion = async (meeting) => {
  try {
    await addDoc(collection(db, SAVINGS_COLLECTION), {
      meetingId: meeting.id,
      meetingName: meeting.name,
      amount: meeting.totalCost,
      suggestedAt: Timestamp.now()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getTotalSavings = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, SAVINGS_COLLECTION));
    let total = 0;
    querySnapshot.forEach((doc) => {
      total += doc.data().amount || 0;
    });
    return { success: true, total };
  } catch (error) {
    return { success: false, error: error.message, total: 0 };
  }
};

export default db;
