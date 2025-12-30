import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/firebaseConfig";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  getDoc,
  addDoc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import "./BookingRequests.css";

const BookingRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, "bookings"),
      where("ownerId", "==", user.uid)
    );

    const unsub = onSnapshot(q, async (snap) => {
      const list = [];

      for (let d of snap.docs) {
        const data = d.data();

        const roomSnap = await getDoc(doc(db, "rooms", data.roomId));
        const roomData = roomSnap.data();

        const seekerSnap = await getDoc(doc(db, "users", data.seekerId));
        const seekerData = seekerSnap.data();

        list.push({
          id: d.id,
          ...data,

          roomTitle: roomData?.title || "Room",
          roomImage: roomData?.image || "",
          roomLocation: roomData?.location || "",
          roomRent: roomData?.rent || "",

          seekerName: seekerData?.name || "Seeker",
          seekerPhoto:
            seekerData?.profileImage ||
            "https://www.w3schools.com/howto/img_avatar.png",
        });
      }

      setRequests(list);
      setLoading(false);
    });

    return () => unsub();
  }, [user?.uid]);

  const accept = async (b) => {
    await updateDoc(doc(db, "bookings", b.id), { status: "accepted" });
    await updateDoc(doc(db, "rooms", b.roomId), { status: "booked" });

    await addDoc(collection(db, "notifications"), {
      userId: b.seekerId,
      message: `🎉 Booking accepted for "${b.roomTitle}"`,
      redirectTo: `/room/${b.roomId}`,
      read: false,
      createdAt: serverTimestamp(),
    });

    const q = query(
      collection(db, "bookings"),
      where("roomId", "==", b.roomId),
      where("status", "==", "pending")
    );

    const snap = await getDocs(q);
    snap.forEach((d) =>
      updateDoc(doc(db, "bookings", d.id), { status: "rejected" })
    );
  };

  const reject = async (b) => {
    await updateDoc(doc(db, "bookings", b.id), { status: "rejected" });

    await addDoc(collection(db, "notifications"), {
      userId: b.seekerId,
      message: `❌ Booking rejected`,
      redirectTo: `/room/${b.roomId}`,
      read: false,
      createdAt: serverTimestamp(),
    });
  };

  if (loading) {
    return <p className="loading">Loading booking requests...</p>;
  }

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
              {/* ROOM IMAGE */}
              {r.roomImage && (
                <img
                  src={r.roomImage}
                  alt={r.roomTitle}
                  className="booking-room-image"
                />
              )}

              <div className="booking-info">
                <h4>{r.roomTitle}</h4>

                <p className="location">{r.roomLocation}</p>
                <p className="rent">₹{r.roomRent} / month</p>

                {/* SEEKER INFO */}
                <div className="seeker">
                  <img src={r.seekerPhoto} alt={r.seekerName} />
                  <span>{r.seekerName}</span>
                </div>

                <span className={`status ${r.status}`}>{r.status}</span>
              </div>

              {r.status === "pending" && (
                <div className="actions">
                  <button className="accept" onClick={() => accept(r)}>
                    Accept
                  </button>
                  <button className="reject" onClick={() => reject(r)}>
                    Reject
                  </button>
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
