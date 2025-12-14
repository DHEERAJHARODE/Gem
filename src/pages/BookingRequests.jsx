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
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

const BookingRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);

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

        list.push({
          id: d.id,
          ...data,
          roomTitle: roomSnap.exists() ? roomSnap.data().title : "",
        });
      }

      setRequests(list);
    });

    return () => unsub();
  }, [user?.uid]);

  const acceptBooking = async (req) => {
    await updateDoc(doc(db, "bookings", req.id), { status: "accepted" });
    await updateDoc(doc(db, "rooms", req.roomId), { status: "booked" });

    // 🔔 notify accepted seeker
    await addDoc(collection(db, "notifications"), {
      userId: req.seekerId,
      message: `🎉 Your booking for "${req.roomTitle}" was accepted`,
      redirectTo: `/room/${req.roomId}`,
      read: false,
      createdAt: serverTimestamp(),
    });

    // reject others
    const q = query(
      collection(db, "bookings"),
      where("roomId", "==", req.roomId),
      where("status", "==", "pending")
    );

    const snap = await getDocs(q);
    snap.forEach(async (d) => {
      await updateDoc(doc(db, "bookings", d.id), { status: "rejected" });

      await addDoc(collection(db, "notifications"), {
        userId: d.data().seekerId,
        message: `❌ Room already booked`,
        redirectTo: `/room/${req.roomId}`,
        read: false,
        createdAt: serverTimestamp(),
      });
    });
  };

  const rejectBooking = async (req) => {
    await updateDoc(doc(db, "bookings", req.id), { status: "rejected" });

    await addDoc(collection(db, "notifications"), {
      userId: req.seekerId,
      message: `❌ Your booking for "${req.roomTitle}" was rejected`,
      redirectTo: `/room/${req.roomId}`,
      read: false,
      createdAt: serverTimestamp(),
    });
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Booking Requests</h2>

      {requests.map((r) => (
        <div key={r.id} style={{ border: "1px solid #ccc", padding: 10 }}>
          <h4>{r.roomTitle}</h4>
          <p>Status: {r.status}</p>

          {r.status === "pending" && (
            <>
              <button onClick={() => acceptBooking(r)}>Accept</button>
              <button onClick={() => rejectBooking(r)}>Reject</button>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default BookingRequests;
