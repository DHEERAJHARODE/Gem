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

const Navbar = () => {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [popup, setPopup] = useState(null);
  const [showList, setShowList] = useState(false);
  const [hideCount, setHideCount] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // 🔔 FETCH NOTIFICATIONS
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setNotifications(list);

      // show popup only for new unread
      const latestUnread = list.find(n => !n.read);
      if (latestUnread) {
        setPopup(latestUnread);
        setTimeout(() => setPopup(null), 5000);
        setHideCount(false); // new notification → show count again
      }
    });

    return () => unsub();
  }, [user]);

  // ❌ CLOSE ON OUTSIDE CLICK
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowList(false);
      }
    };

    const handleScroll = () => setShowList(false);

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // 🔔 BELL CLICK
  const handleBellClick = () => {
    setShowList(prev => !prev);
    setHideCount(true); // hide count on bell click
  };

  // 📌 CLICK NOTIFICATION
  const handleNotificationClick = async (n) => {
    if (!n.read) {
      await updateDoc(doc(db, "notifications", n.id), { read: true });
    }
    setPopup(null);
    setShowList(false);
    navigate(n.redirectTo);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <nav style={styles.nav}>
        <h3>RoomRent</h3>

        <div style={styles.links}>
          <Link to="/">Home</Link>

          {user && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }} ref={dropdownRef}>
              
              <Link to="/rooms">Rooms</Link>
              <Link to="/dashboard">Dashboard</Link>

              <span style={styles.bell} onClick={handleBellClick}>
                🔔
                {!hideCount && unreadCount > 0 && (
                  <span style={styles.count}>{unreadCount}</span>
                )}
              </span>

              {showList && (
                <div style={styles.dropdown}>
                  {notifications.length === 0 && (
                    <p style={{ padding: "10px" }}>No notifications</p>
                  )}

                  {notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      style={{
                        ...styles.item,
                        background: n.read ? "#f5f5f5" : "#e6f7ff",
                      }}
                    >
                      <p style={{ margin: 0 }}>{n.message}</p>
                      <small style={{ color: "#666" }}>
                        {timeAgo(n.createdAt)}
                      </small>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {!user ? (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          ) : (
            <>
              <button onClick={logout}>Logout</button>
            </>
          )}
        </div>
      </nav>

      {/* 🔔 POPUP */}
      {popup && (
        <div style={styles.popup} onClick={() => handleNotificationClick(popup)}>
          {popup.message}
        </div>
      )}
    </>
  );
};

// ⏱️ TIME AGO
const timeAgo = (timestamp) => {
  const seconds = Math.floor((Date.now() - timestamp.toDate()) / 1000);

  const units = [
    { s: 31536000, l: "year" },
    { s: 2592000, l: "month" },
    { s: 86400, l: "day" },
    { s: 3600, l: "hour" },
    { s: 60, l: "minute" },
  ];

  for (let u of units) {
    const v = Math.floor(seconds / u.s);
    if (v >= 1) return `${v} ${u.l}${v > 1 ? "s" : ""} ago`;
  }

  return "Just now";
};

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 20px",
    background: "#f5f5f5",
  },
  links: {
    display: "flex",
    gap: "15px",
    alignItems: "center",
  },
  bell: {
    cursor: "pointer",
    fontSize: "18px",
    position: "relative",
  },
  count: {
    background: "red",
    color: "#fff",
    borderRadius: "50%",
    padding: "2px 6px",
    fontSize: "12px",
    marginLeft: "4px",
  },
  dropdown: {
    position: "absolute",
    right: 0,
    top: "25px",
    width: "320px",
    background: "#fff",
    border: "1px solid #ccc",
    borderRadius: "6px",
    zIndex: 1000,
    maxHeight: "350px",
    overflowY: "auto",
  },
  item: {
    padding: "10px",
    cursor: "pointer",
    borderBottom: "1px solid #eee",
  },
  popup: {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    background: "#323232",
    color: "#fff",
    padding: "15px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    zIndex: 999,
  },
};

export default Navbar;