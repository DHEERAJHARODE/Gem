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
  Timestamp,
} from "firebase/firestore";

const BookingRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "bookings"),
      where("ownerId", "==", user.uid)
    );

    const unsub = onSnapshot(q, async (snapshot) => {
      const list = [];

      for (let d of snapshot.docs) {
        const data = d.data();
        const roomSnap = await getDoc(doc(db, "rooms", data.roomId));

        list.push({
          id: d.id,
          ...data,
          roomTitle: roomSnap.exists()
            ? roomSnap.data().title
            : "Unknown Room",
        });
      }

      setRequests(list);
    });

    return () => unsub();
  }, [user]);

  const handleAccept = async (booking) => {
  if (booking.notificationSent) return; // 🔒 SAFETY

  // 1️⃣ Accept booking
  await updateDoc(doc(db, "bookings", booking.id), {
    status: "accepted",
    notificationSent: true,
  });

  // 2️⃣ Mark room booked
  await updateDoc(doc(db, "rooms", booking.roomId), {
    status: "booked",
  });

  // 3️⃣ Notify accepted seeker (ONLY ONCE)
  await addDoc(collection(db, "notifications"), {
    userId: booking.seekerId,
    message: `🎉 Your booking for "${booking.roomTitle}" was accepted`,
    redirectTo: `/room/${booking.roomId}`,
    read: false,
    createdAt: Timestamp.now(),
  });

  // 4️⃣ Reject others WITHOUT notifications
  const q = query(
    collection(db, "bookings"),
    where("roomId", "==", booking.roomId),
    where("status", "==", "pending")
  );

  const snap = await getDocs(q);

  snap.forEach(async (d) => {
    await updateDoc(doc(db, "bookings", d.id), {
      status: "rejected",
      notificationSent: true,
    });
  });

  alert("Booking accepted!");
};


  const handleReject = async (booking) => {
  if (booking.notificationSent) return; // 🔒 SAFETY

  await updateDoc(doc(db, "bookings", booking.id), {
    status: "rejected",
    notificationSent: true,
  });

  await addDoc(collection(db, "notifications"), {
    userId: booking.seekerId,
    message: `❌ Your booking for "${booking.roomTitle}" was rejected`,
    redirectTo: `/room/${booking.roomId}`,
    read: false,
    createdAt: Timestamp.now(),
  });
};


  return (
    <div style={{ padding: "20px" }}>
      <h2>Booking Requests</h2>

      {requests.map((req) => (
        <div key={req.id} style={styles.card}>
          <h3>{req.roomTitle}</h3>
          <p><b>Seeker:</b> {req.seekerId}</p>
          <p><b>Status:</b> {req.status}</p>

          {req.status === "pending" && (
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => handleAccept(req)}>✔ Accept</button>
              <button
                onClick={() => handleReject(req)}
                style={{ background: "red", color: "#fff" }}
              >
                ✖ Reject
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const styles = {
  card: {
    background: "#fff",
    padding: "15px",
    margin: "10px 0",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },
};

export default BookingRequests;