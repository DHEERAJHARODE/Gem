import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useRef, useState } from "react";
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { FiMenu, FiX, FiMessageSquare } from "react-icons/fi";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadMsgs, setUnreadMsgs] = useState(0); // Naya state
  const [showList, setShowList] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!user?.uid) return;
    const fetchProfile = async () => {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) setProfile(snap.data());
    };
    fetchProfile();
  }, [user?.uid]);

  // 🔔 NOTIFICATIONS Listener
  useEffect(() => {
    if (!user?.uid) return;
    const q = query(collection(db, "notifications"), where("userId", "==", user.uid), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [user?.uid]);

  // 💬 UNREAD MESSAGES Listener
  useEffect(() => {
    if (!user?.uid) return;
    const q = query(
      collection(db, "messages"),
      where("receiverId", "==", user.uid),
      where("seen", "==", false)
    );
    const unsub = onSnapshot(q, (snap) => {
      setUnreadMsgs(snap.size); // Unseen messages ka count
    });
    return () => unsub();
  }, [user?.uid]);

  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      <nav className="navbar">
        <h3 className="logo" onClick={() => navigate("/")}>Stay Safe</h3>

        <div className="nav-links desktop">
          <Link to="/">Home</Link>
          {user ? (
            <>
              <Link to="/rooms">Rooms</Link>
              <Link to="/dashboard">Dashboard</Link>

              {/* 💬 Messages with Red Badge */}
              <Link to="/inbox" className="nav-icon-link" style={{position: 'relative'}}>
                <FiMessageSquare size={22} />
                {unreadMsgs > 0 && <span className="msg-badge">{unreadMsgs}</span>}
              </Link>

              {/* 🔔 Notifications */}
              <div ref={dropdownRef} className="notification">
                <span className="bell" onClick={() => setShowList(!showList)}>
                  🔔 {unreadNotifCount > 0 && <span className="badge">{unreadNotifCount}</span>}
                </span>
                {showList && (
                  <div className="dropdown">
                    {notifications.length === 0 && <p className="empty">No notifications</p>}
                    {notifications.map((n) => (
                      <div key={n.id} className={`item ${n.read ? "" : "unread"}`} 
                        onClick={async () => {
                          if (!n.read) await updateDoc(doc(db, "notifications", n.id), { read: true });
                          setShowList(false);
                          navigate(n.redirectTo);
                        }}>
                        {n.message}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <img src={profile?.profileImage || "https://www.w3schools.com/howto/img_avatar.png"} alt="profile" className="nav-avatar" onClick={() => navigate("/profile")} />
              <button className="logout" onClick={async () => { await logout(); navigate("/login"); }}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
        <div className="mobile-menu" onClick={() => setMobileOpen(true)}><FiMenu size={24} /></div>
      </nav>
    </>
  );
};

export default Navbar;