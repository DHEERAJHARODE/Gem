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
import "./RoomDetails.css";

const RoomDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [room, setRoom] = useState(null);
  const [requested, setRequested] = useState(false);
  const [profile, setProfile] = useState(null);
  const [profileIncomplete, setProfileIncomplete] = useState(false);

  // Fetch room details
  useEffect(() => {
    getDoc(doc(db, "rooms", id)).then((snap) => {
      if (snap.exists()) setRoom({ id: snap.id, ...snap.data() });
    });
  }, [id]);

  // Fetch seeker profile
  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        const data = snap.data();
        setProfile(data);

        // Check if profile is incomplete
        if (
          !data.name ||
          !data.phone ||
          !data.gender ||
          !data.profileImage
        ) {
          setProfileIncomplete(true);
        }
      } else {
        // User doc does not exist
        setProfileIncomplete(true);
      }
    };

    fetchProfile();
  }, [user]);

  // Check if user already requested booking
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "bookings"),
      where("roomId", "==", id),
      where("seekerId", "==", user.uid)
    );

    getDocs(q).then((snap) => {
      if (!snap.empty) setRequested(true);
    });
  }, [user, id]);

  const handleBooking = async () => {
    if (profileIncomplete) {
      alert("Please complete your profile to request booking.");
      window.location.href = "/profile";
      return;
    }

    await addDoc(collection(db, "bookings"), {
      roomId: id,
      ownerId: room.ownerId,
      seekerId: user.uid,
      status: "pending",
      createdAt: serverTimestamp(),
    });

    await addDoc(collection(db, "notifications"), {
      userId: room.ownerId,
      message: `📩 Booking request for "${room.title}"`,
      redirectTo: "/booking-requests",
      read: false,
      createdAt: serverTimestamp(),
    });

    setRequested(true);
  };

  if (!room) return null;

  return (
    <div className="room-details-page">
      {/* HERO IMAGE */}
      <div
        className="room-hero"
        style={{
          backgroundImage: room.image ? `url(${room.image})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {!room.image && <span>Room Image</span>}
      </div>

      <div className="room-details">
        <div className="room-main">
          <h1>{room.title}</h1>
          <p className="location">📍 {room.location}</p>

          <div className="features">
            <span>✅ Verified Owner</span>
            <span>🔒 Safe Stay</span>
            <span>🏠 Real Listing</span>
          </div>

          <p className="description">
            Comfortable room available for rent with all basic amenities.
            Ideal for students and working professionals.
          </p>
        </div>

        {/* BOOKING CARD */}
        <div className="booking-card">
          <h3>₹ {room.rent} <span>/ month</span></h3>

          {room.status === "booked" && (
            <p className="booked">❌ Room already booked</p>
          )}

          {user?.uid !== room.ownerId && room.status !== "booked" && (
            <>
              <button
                disabled={requested || profileIncomplete}
                onClick={handleBooking}
              >
                {requested ? "Request Sent" : "Request Booking"}
              </button>

              {profileIncomplete && (
                <p className="login-note">
                  ⚠️ Please complete your profile to request booking.{" "}
                  <a href="/profile" style={{ color: "#4f46e5" }}>Go to Profile</a>
                </p>
              )}
            </>
          )}

          {!user && (
            <p className="login-note">
              Please login to request booking
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomDetails;
