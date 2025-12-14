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
  const lastPopupId = useRef(null); // 🔒 prevent duplicate popup

  // 🔔 REAL-TIME NOTIFICATIONS
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

      // 🔔 show popup only for NEW unread notification
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

  // ❌ close dropdown on outside click
  useEffect(() => {
    const close = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowList(false);
      }
    };

    document.addEventListener("mousedown", close);
    window.addEventListener("scroll", () => setShowList(false));

    return () => {
      document.removeEventListener("mousedown", close);
      window.removeEventListener("scroll", () => setShowList(false));
    };
  }, []);

  const handleBellClick = () => {
    setShowList((prev) => !prev);
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
      <nav style={styles.nav}>
        <h3>RoomRent</h3>

        <div style={styles.links}>
          <Link to="/">Home</Link>

          {user && (
            <div ref={dropdownRef} style={{ position: "relative" }}>
              <Link to="/rooms">Rooms</Link>
              <Link to="/dashboard"> Dashboard</Link>

              <span style={styles.bell} onClick={handleBellClick}>
                🔔
                {!hideCount && unreadCount > 0 && (
                  <span style={styles.count}>{unreadCount}</span>
                )}
              </span>

              {showList && (
                <div style={styles.dropdown}>
                  {notifications.length === 0 && (
                    <p style={{ padding: 10 }}>No notifications</p>
                  )}

                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      style={{
                        ...styles.item,
                        background: n.read ? "#f5f5f5" : "#e6f7ff",
                      }}
                    >
                      <p style={{ margin: 0 }}>{n.message}</p>
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
            <button onClick={logout}>Logout</button>
          )}
        </div>
      </nav>

      {popup && (
        <div
          style={styles.popup}
          onClick={() => handleNotificationClick(popup)}
        >
          {popup.message}
        </div>
      )}
    </>
  );
};

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 20px",
    background: "#f5f5f5",
  },
  links: { display: "flex", gap: 15, alignItems: "center" },
  bell: { cursor: "pointer", position: "relative" },
  count: {
    background: "red",
    color: "#fff",
    borderRadius: "50%",
    padding: "2px 6px",
    fontSize: 12,
  },
  dropdown: {
    position: "absolute",
    right: 0,
    top: 25,
    width: 300,
    background: "#fff",
    border: "1px solid #ccc",
    zIndex: 1000,
  },
  item: { padding: 10, cursor: "pointer" },
  popup: {
    position: "fixed",
    bottom: 20,
    right: 20,
    background: "#323232",
    color: "#fff",
    padding: 15,
    borderRadius: 8,
    cursor: "pointer",
  },
};

export default Navbar;
