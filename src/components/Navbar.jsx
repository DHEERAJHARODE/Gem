import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
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
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.uid) {
      setNotifications([]);
      return;
    }

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setNotifications(
        snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      );
    });

    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  const unread = notifications.filter((n) => !n.read).length;

  const openNotification = async (n) => {
    await updateDoc(doc(db, "notifications", n.id), { read: true });
    navigate(n.redirectTo);
  };

  return (
    <nav style={{ padding: 10, display: "flex", gap: 15 }}>
      <Link to="/">Home</Link>

      {user && (
        <>
          <Link to="/rooms">Rooms</Link>
          <Link to="/dashboard">Dashboard</Link>

          <span>
            🔔 {unread > 0 && <b>({unread})</b>}
          </span>

          <div>
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => openNotification(n)}
                style={{
                  cursor: "pointer",
                  background: n.read ? "#eee" : "#cceeff",
                  marginTop: 5,
                  padding: 5,
                }}
              >
                {n.message}
              </div>
            ))}
          </div>

          <button onClick={logout}>Logout</button>
        </>
      )}

      {!user && (
        <>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </>
      )}
    </nav>
  );
};

export default Navbar;
