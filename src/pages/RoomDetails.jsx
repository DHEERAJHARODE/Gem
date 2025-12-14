import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase/firebaseConfig";
import {
  doc,
  getDoc,
  addDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

const RoomDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [room, setRoom] = useState(null);
  const [requested, setRequested] = useState(false);

  useEffect(() => {
    const fetchRoom = async () => {
      const snap = await getDoc(doc(db, "rooms", id));
      if (snap.exists()) {
        setRoom({ id: snap.id, ...snap.data() });
      }
    };
    fetchRoom();
  }, [id]);

  useEffect(() => {
    if (!user) return;

    const checkRequest = async () => {
      const q = query(
        collection(db, "bookings"),
        where("roomId", "==", id),
        where("seekerId", "==", user.uid)
      );
      const snap = await getDocs(q);
      if (!snap.empty) setRequested(true);
    };

    checkRequest();
  }, [user, id]);

  const handleBooking = async () => {
    if (!user) return alert("Login first");

    // booking create
    await addDoc(collection(db, "bookings"), {
      roomId: id,
      ownerId: room.ownerId,
      seekerId: user.uid,
      status: "pending",
      createdAt: serverTimestamp(),
    });

    // 🔔 notify owner (REAL APP STYLE)
    await addDoc(collection(db, "notifications"), {
      userId: room.ownerId,
      message: `📩 New booking request for "${room.title}"`,
      redirectTo: "/booking-requests",
      read: false,
      createdAt: serverTimestamp(),
    });

    setRequested(true);
    alert("Booking request sent");
  };

  if (!room) return <p>Loading...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>{room.title}</h2>
      <p>₹ {room.rent}</p>
      <p>{room.location}</p>

      {room.status === "booked" && <p>❌ Room already booked</p>}

      {user?.uid !== room.ownerId && room.status !== "booked" && (
        <button disabled={requested} onClick={handleBooking}>
          {requested ? "Request Sent" : "Request Booking"}
        </button>
      )}
    </div>
  );
};

export default RoomDetails;
