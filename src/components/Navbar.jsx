import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useRef, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { FiMenu, FiX } from "react-icons/fi";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [popup, setPopup] = useState(null);
  const [showList, setShowList] = useState(false);
  const [hideCount, setHideCount] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const lastPopupId = useRef(null);

  // 🔔 Real-time notifications
  useEffect(() => {
    if (!user?.uid) {
      setNotifications([]);
      setPopup(null);
      return;
    }

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      setNotifications(list);

      const latestUnread = list.find(
        (n) => !n.read && n.id !== lastPopupId.current
      );

      if (latestUnread) {
        lastPopupId.current = latestUnread.id;
        setPopup(latestUnread);
        setHideCount(false);
        setTimeout(() => setPopup(null), 5000);
      }
    });

    return () => unsub();
  }, [user?.uid]);

  // ❌ Close dropdown on outside click
  useEffect(() => {
    const close = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowList(false);
      }
    };

    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const handleBellClick = () => {
    setShowList((p) => !p);
    setHideCount(true);
  };

  const handleNotificationClick = async (n) => {
    if (!n.read) {
      await updateDoc(doc(db, "notifications", n.id), { read: true });
    }
    setPopup(null);
    setShowList(false);
    navigate(n.redirectTo);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      <nav className="navbar">
        <h3 className="logo">Stay Safe</h3>

        {/* Desktop */}
        <div className="nav-links desktop">
          <Link to="/">Home</Link>

          {user && (
            <>
              <Link to="/rooms">Rooms</Link>
              <Link to="/dashboard">Dashboard</Link>

              <div ref={dropdownRef} className="notification">
                <span className="bell" onClick={handleBellClick}>
                  🔔
                  {!hideCount && unreadCount > 0 && (
                    <span className="badge">{unreadCount}</span>
                  )}
                </span>

                {showList && (
                  <div className="dropdown">
                    {notifications.length === 0 && (
                      <p className="empty">No notifications</p>
                    )}

                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`item ${n.read ? "" : "unread"}`}
                        onClick={() => handleNotificationClick(n)}
                      >
                        {n.message}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {!user ? (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          ) : (
            <button
              className="logout"
              onClick={async () => {
                await logout();
                navigate("/login");
              }}
            >
              Logout
            </button>
          )}
        </div>

        {/* 🍔 Mobile Icon */}
        <div className="mobile-menu" onClick={() => setMobileOpen(true)}>
          <FiMenu size={24} />
        </div>
      </nav>

      {/* 🌑 Overlay */}
      {mobileOpen && (
        <div className="overlay" onClick={() => setMobileOpen(false)} />
      )}

      {/* 📱 Sidebar */}
      <div className={`sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="close" onClick={() => setMobileOpen(false)}>
          <FiX size={22} />
        </div>

        <Link onClick={() => setMobileOpen(false)} to="/">
          Home
        </Link>

        {user && (
          <>
            <Link onClick={() => setMobileOpen(false)} to="/rooms">
              Rooms
            </Link>
            <Link onClick={() => setMobileOpen(false)} to="/dashboard">
              Dashboard
            </Link>
            <Link
              onClick={() => setMobileOpen(false)}
              to="/booking-requests"
            >
              Booking Requests
            </Link>
          </>
        )}

        {!user ? (
          <>
            <Link onClick={() => setMobileOpen(false)} to="/login">
              Login
            </Link>
            <Link onClick={() => setMobileOpen(false)} to="/register">
              Register
            </Link>
          </>
        ) : (
          <button
            className="logout"
            onClick={async () => {
              await logout();
              setMobileOpen(false);
              navigate("/login");
            }}
          >
            Logout
          </button>
        )}
      </div>

      {/* 🔔 Popup */}
      {popup && (
        <div className="popup" onClick={() => handleNotificationClick(popup)}>
          {popup.message}
        </div>
      )}
    </>
  );
};

export default Navbar;
