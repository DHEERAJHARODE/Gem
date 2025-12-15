import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "../firebase/firebaseConfig";
import { collection, onSnapshot } from "firebase/firestore";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);

  // Fetch featured rooms
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "rooms"), (snapshot) => {
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setRooms(list.slice(0, 6)); // top 6 featured rooms
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="home">
      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <h1>Find rooms you’ll <span>love</span> to stay in</h1>
          <p>Trusted room rentals for students, professionals & families. Verified owners. Safe stays.</p>
          <div className="hero-buttons">
            <button onClick={() => navigate("/rooms")}>🔍 Find a Room</button>
            <button className="secondary" onClick={() => navigate("/register")}>🏠 List Your Room</button>
          </div>
        </div>
      </section>

      {/* FEATURED ROOMS */}
      <section className="featured-rooms">
        <h2>Featured Rooms</h2>
        <div className="rooms-carousel">
          {rooms.map((room) => (
            <div className="room-card" key={room.id} onClick={() => navigate(`/room/${room.id}`)}>
              {room.image ? <img src={room.image} alt={room.title} /> : <div className="placeholder">Room Image</div>}
              <div className="room-info">
                <h3>{room.title}</h3>
                <p>📍 {room.location}</p>
                <span className="price">₹{room.rent}/month</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TRUSTED BY / REVIEWS */}
      <section className="reviews">
        <h2>Trusted by thousands of happy clients</h2>
        <div className="reviews-cards">
          <div className="review-card">
            <p>"Found a perfect room near my college. Smooth process!"</p>
            <span>- Ankit</span>
          </div>
          <div className="review-card">
            <p>"Verified owners and safe booking made my move stress-free."</p>
            <span>- Priya</span>
          </div>
          <div className="review-card">
            <p>"Highly recommend for working professionals. Reliable listings."</p>
            <span>- Rohit</span>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how">
        <h2>How it works</h2>
        <div className="steps">
          <div className="step">
            <span>1</span>
            <h4>Search Room</h4>
            <p>Browse rooms that fit your needs & budget</p>
          </div>
          <div className="step">
            <span>2</span>
            <h4>Book & Connect</h4>
            <p>Send booking request & talk to owner</p>
          </div>
          <div className="step">
            <span>3</span>
            <h4>Move In</h4>
            <p>Safe stay with verified listings</p>
          </div>
        </div>
      </section>

      {/* OWNER CTA */}
      <section className="owner-cta">
        <h2>Have a room to rent?</h2>
        <p>List your room and start earning today</p>
        <button onClick={() => navigate("/register")}>Become an Owner</button>
      </section>
    </div>
  );
};

export default Home;
