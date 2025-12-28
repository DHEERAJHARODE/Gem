import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import "./RoomsList.css";

const RoomsList = () => {
  const [rooms, setRooms] = useState([]);
  const [searchLocation, setSearchLocation] = useState("");
  const [priceSort, setPriceSort] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("");

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "rooms"), (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRooms(list);
    });

    return () => unsubscribe();
  }, []);

  const isAvailableNow = (room) => {
    if (room.availableNow) return true;
    if (!room.availableFrom) return false;
    return new Date(room.availableFrom) <= new Date();
  };

  const filteredRooms = rooms
    .filter((room) =>
      room.location.toLowerCase().includes(searchLocation.toLowerCase())
    )
    .filter((room) => {
      if (availabilityFilter === "now") return isAvailableNow(room);
      if (availabilityFilter === "next") return !isAvailableNow(room);
      return true;
    })
    .sort((a, b) => {
      if (priceSort === "low") return a.rent - b.rent;
      if (priceSort === "high") return b.rent - a.rent;
      return 0;
    });

  return (
    <div className="rooms-page">
      <h2>Available Rooms</h2>
      <p className="subtitle">Find your perfect stay with ease</p>

      {/* FILTER BAR */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search location..."
          value={searchLocation}
          onChange={(e) => setSearchLocation(e.target.value)}
        />

        <select onChange={(e) => setPriceSort(e.target.value)}>
          <option value="">Sort by price</option>
          <option value="low">Low → High</option>
          <option value="high">High → Low</option>
        </select>

        <select onChange={(e) => setAvailabilityFilter(e.target.value)}>
          <option value="">Availability</option>
          <option value="now">Available Now</option>
          <option value="next">Available Later</option>
        </select>
      </div>

      {filteredRooms.length === 0 && (
        <div className="empty-state">
          <p>No rooms found 🏠</p>
        </div>
      )}

      <div className="rooms-grid">
        {filteredRooms.map((room) => {
          const availableNow = isAvailableNow(room);

          return (
            <Link to={`/room/${room.id}`} className="room-link" key={room.id}>
              <div className="room-card">
                {/* BADGE OUTSIDE IMAGE */}
                <span
                  className={`availability-badge ${
                    availableNow ? "now" : "later"
                  }`}
                >
                  {availableNow ? "Available Now" : `From ${room.availableFrom}`}
                </span>

                <div className="room-image">
                  {room.image ? (
                    <img src={room.image} alt={room.title} />
                  ) : (
                    <div className="no-image">Room</div>
                  )}
                </div>

                <div className="room-info">
                  <h3>{room.title}</h3>
                  <p className="location">📍 {room.location}</p>

                  <div className="room-footer">
                    <span className="price">₹{room.rent}/month</span>
                    <span className="view">View →</span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default RoomsList;
