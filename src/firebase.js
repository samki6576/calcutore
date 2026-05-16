import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit, Timestamp, deleteDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCAkOhsLbfAGzNF2wBlLMnHGuD17yf8nIc",
  authDomain: "vitalsign-ai.firebaseapp.com",
  projectId: "vitalsign-ai",
  storageBucket: "vitalsign-ai.firebasestorage.app",
  messagingSenderId: "702846984966",
  appId: "1:702846984966:web:3493e1fd0fd88aeee73487"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const addMeeting = async (meetingData) => {
  try {
    const totalCost = meetingData.attendees * meetingData.durationHours * meetingData.hourlyRate;
    const docRef = await addDoc(collection(db, "meetings"), {
      name: meetingData.name,
      attendees: Number(meetingData.attendees),
      durationHours: Number(meetingData.durationHours),
      hourlyRate: Number(meetingData.hourlyRate),
      date: meetingData.date,
      totalCost: totalCost,
      createdAt: Timestamp.now()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Add meeting error:", error);
    return { success: false, error: error.message };
  }
};

export const getMeetings = async () => {
  try {
    const q = query(collection(db, "meetings"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const meetings = [];
    querySnapshot.forEach((doc) => {
      meetings.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: meetings };
  } catch (error) {
    console.error("Get meetings error:", error);
    return { success: false, error: error.message, data: [] };
  }
};

export const deleteMeeting = async (meetingId) => {
  try {
    await deleteDoc(doc(db, "meetings", meetingId));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getMeetingStats = async () => {
  try {
    const result = await getMeetings();
    if (!result.success) return result;
    
    const meetings = result.data;
    const totalCost = meetings.reduce((sum, m) => sum + (m.totalCost || 0), 0);
    const totalMeetings = meetings.length;
    const avgCostPerMeeting = totalMeetings > 0 ? totalCost / totalMeetings : 0;
    
    const trend = {};
    meetings.forEach(m => {
      const date = m.date;
      if (!trend[date]) trend[date] = { cost: 0, count: 0 };
      trend[date].cost += m.totalCost || 0;
      trend[date].count++;
    });
    
    const costTrend = Object.entries(trend).map(([date, data]) => ({
      date, cost: data.cost, meetings: data.count
    })).slice(-7);
    
    return {
      success: true,
      data: { totalCost, totalMeetings, avgCostPerMeeting, costTrend }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const saveSuggestion = async (meeting) => {
  try {
    await addDoc(collection(db, "savings"), {
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
    const querySnapshot = await getDocs(collection(db, "savings"));
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
