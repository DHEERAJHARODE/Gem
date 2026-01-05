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

  // 1. Notification Auto-Read Logic (New Feature)
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

  // 2. Fetch Requests Logic (Old Working Logic merged with New UI)
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
        
        const roomData = roomSnap.data();
        const seekerData = seekerSnap.data();

        list.push({
          id: d.id,
          ...data,
          roomTitle: roomData?.title || "Room",
          roomImage: roomData?.image || "",
          roomLocation: roomData?.location || "",
          roomRent: roomData?.rent || "",
          seekerName: seekerData?.name || "Seeker",
          seekerPhoto: seekerData?.profileImage || "https://www.w3schools.com/howto/img_avatar.png",
        });
      }
      setRequests(list);
      setLoading(false);
    });
    return () => unsub();
  }, [user?.uid]);

  // 3. Accept Logic (From Old Working Code)
  const accept = async (b) => {
    try {
      await updateDoc(doc(db, "bookings", b.id), { status: "accepted" });
      await updateDoc(doc(db, "rooms", b.roomId), { status: "booked" });

      await addDoc(collection(db, "notifications"), {
        userId: b.seekerId,
        message: `🎉 Booking accepted for "${b.roomTitle}"`,
        redirectTo: `/room/${b.roomId}`,
        read: false,
        createdAt: serverTimestamp(),
      });

      // Reject all other pending requests for this specific room
      const q = query(
        collection(db, "bookings"),
        where("roomId", "==", b.roomId),
        where("status", "==", "pending")
      );

      const snap = await getDocs(q);
      const batch = writeBatch(db);
      snap.forEach((d) => {
        if (d.id !== b.id) {
          batch.update(d.ref, { status: "rejected" });
        }
      });
      await batch.commit();
    } catch (error) {
      console.error("Accept error:", error);
    }
  };

  // 4. Reject Logic (From Old Working Code)
  const reject = async (b) => {
    try {
      await updateDoc(doc(db, "bookings", b.id), { status: "rejected" });

      await addDoc(collection(db, "notifications"), {
        userId: b.seekerId,
        message: `❌ Booking rejected for "${b.roomTitle}"`,
        redirectTo: `/room/${b.roomId}`,
        read: false,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Reject error:", error);
    }
  };

  if (loading) return <p className="loading">Loading booking requests...</p>;

  return (
    <div className="booking-page">
      <h2>Booking Requests</h2>
      <p className="subtitle">Manage incoming booking requests</p>
      
      {requests.length === 0 ? (
        <div className="empty">No booking requests yet 📭</div>
      ) : (
        <div className="booking-list">
          {requests.map((r) => (
            <div className="booking-card" key={r.id}>
              {r.roomImage && <img src={r.roomImage} className="booking-room-image" alt="room" />}
              <div className="booking-info">
                <h4>{r.roomTitle}</h4>
                <p className="location">{r.roomLocation}</p>
                <p className="rent">₹{r.roomRent} / month</p>
                <div className="seeker">
                  <img src={r.seekerPhoto} alt="seeker" />
                  <span>{r.seekerName}</span>
                </div>
                <span className={`status ${r.status}`}>{r.status}</span>
                
                {/* Chat Button for Accepted Requests */}
                {r.status === "accepted" && (
                  <button 
                    className="accept" 
                    onClick={() => navigate(`/chat/${r.roomId}`)} 
                    style={{marginTop: '10px', background: '#10b981', display: 'block'}}
                  >
                    💬 Chat Now
                  </button>
                )}
              </div>
              
              {/* Action Buttons for Pending Requests */}
              {r.status === "pending" && (
                <div className="actions">
                  <button className="accept" onClick={() => accept(r)}>Accept</button>
                  <button className="reject" onClick={() => reject(r)}>Reject</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingRequests;