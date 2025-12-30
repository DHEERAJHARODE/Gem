import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/firebaseConfig";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";
import { Link } from "react-router-dom";
import "./MyRequests.css";

const MyRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, "bookings"),
      where("seekerId", "==", user.uid)
    );

    const unsub = onSnapshot(q, async (snap) => {
      const list = [];

      for (let d of snap.docs) {
        const data = d.data();
        const roomSnap = await getDoc(doc(db, "rooms", data.roomId));
        const roomData = roomSnap.data();

        list.push({
          id: d.id,
          ...data,
          roomTitle: roomData?.title || "Room",
          roomImage: roomData?.image || "",
          roomLocation: roomData?.location || "",
          roomRent: roomData?.rent || "",
        });
      }

      setRequests(list);
      setLoading(false);
    });

    return () => unsub();
  }, [user?.uid]);

  if (loading) {
    return <p className="loading">Loading your booking requests...</p>;
  }

  return (
    <div className="my-requests-page">
      <h2>My Booking Requests</h2>

      {requests.length === 0 ? (
        <p className="empty">No booking requests yet 📭</p>
      ) : (
        <div className="requests-list">
          {requests.map((r) => (
            <div className="request-card" key={r.id}>
              {r.roomImage && (
                <img
                  src={r.roomImage}
                  alt={r.roomTitle}
                  className="request-room-image"
                />
              )}

              <div className="request-info">
                <h4>{r.roomTitle}</h4>

                {r.roomLocation && (
                  <p className="location">{r.roomLocation}</p>
                )}

                {r.roomRent && (
                  <p className="rent">₹{r.roomRent} / month</p>
                )}

                <span className={`status ${r.status}`}>
                  {r.status}
                </span>

                {/* ✅ IF ACCEPTED → SHOW CHAT & VISIT BUTTONS */}
                {r.status === "accepted" && (
                  <div className="request-actions">
                    <Link to={`/chat/${r.roomId}`} className="chat-btn">
                      Chat
                    </Link>
                    <Link to={`/visit/${r.roomId}`} className="visit-btn">
                      Visit Property
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRequests;
