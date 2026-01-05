import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";
import {
  collection, query, where, onSnapshot, doc, updateDoc, getDoc,
  addDoc, getDocs, serverTimestamp, writeBatch
} from "firebase/firestore";
import "./BookingRequests.css";

const BookingRequests = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Notification Auto-Read Logic
  useEffect(() => {
    const markAsRead = async () => {
      if (!user?.uid) return;
      const q = query(
        collection(db, "notifications"),
        where("userId", "==", user.uid),
        where("read", "==", false)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        const batch = writeBatch(db);
        snap.forEach((d) => batch.update(d.ref, { read: true }));
        await batch.commit();
      }
    };
    markAsRead();
  }, [user?.uid]);

  // 2. Fetch Requests Logic (Existing logic)
  useEffect(() => {
    if (!user?.uid) return;
    const q = query(collection(db, "bookings"), where("ownerId", "==", user.uid));
    const unsub = onSnapshot(q, async (snap) => {
      const list = [];
      for (let d of snap.docs) {
        const data = d.data();
        const [roomSnap, seekerSnap] = await Promise.all([
          getDoc(doc(db, "rooms", data.roomId)),
          getDoc(doc(db, "users", data.seekerId))
        ]);
        list.push({
          id: d.id,
          ...data,
          roomTitle: roomSnap.data()?.title || "Room",
          roomImage: roomSnap.data()?.image || "",
          roomRent: roomSnap.data()?.rent || "",
          seekerName: seekerSnap.data()?.name || "Seeker",
          seekerPhoto: seekerSnap.data()?.profileImage || "https://www.w3schools.com/howto/img_avatar.png",
        });
      }
      setRequests(list);
      setLoading(false);
    });
    return () => unsub();
  }, [user?.uid]);

  // Accept/Reject functions remain the same...
  const accept = async (b) => { /* logic */ };
  const reject = async (b) => { /* logic */ };

  if (loading) return <p className="loading">Loading booking requests...</p>;

  return (
    <div className="booking-page">
      <h2>Booking Requests</h2>
      <div className="booking-list">
        {requests.map((r) => (
          <div className="booking-card" key={r.id}>
            {r.roomImage && <img src={r.roomImage} className="booking-room-image" alt="room" />}
            <div className="booking-info">
              <h4>{r.roomTitle}</h4>
              <p className="rent">₹{r.roomRent} / month</p>
              <div className="seeker">
                <img src={r.seekerPhoto} alt="seeker" />
                <span>{r.seekerName}</span>
              </div>
              <span className={`status ${r.status}`}>{r.status}</span>
              {r.status === "accepted" && (
                <button className="accept" onClick={() => navigate(`/chat/${r.roomId}`)} style={{marginTop: '10px', background: '#10b981'}}>
                  💬 Chat Now
                </button>
              )}
            </div>
            {r.status === "pending" && (
              <div className="actions">
                <button className="accept" onClick={() => accept(r)}>Accept</button>
                <button className="reject" onClick={() => reject(r)}>Reject</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookingRequests;