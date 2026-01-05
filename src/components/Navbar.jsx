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
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { FiMenu, FiX, FiMessageSquare, FiBell } from "react-icons/fi";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadMsgs, setUnreadMsgs] = useState(0);
  const [showList, setShowList] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Fetch profile
  useEffect(() => {
    if (!user?.uid) return;
    const fetchProfile = async () => {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) setProfile(snap.data());
    };
    fetchProfile();
  }, [user?.uid]);

  // Notifications
  useEffect(() => {
    if (!user?.uid) return;
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setNotifications(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [user?.uid]);

  // Unread messages
  useEffect(() => {
    if (!user?.uid) return;
    const q = query(
      collection(db, "messages"),
      where("receiverId", "==", user.uid),
      where("seen", "==", false)
    );
    const unsub = onSnapshot(q, (snap) => {
      const senders = snap.docs.map((d) => d.data().senderId);
      setUnreadMsgs([...new Set(senders)].length);
    });
    return () => unsub();
  }, [user?.uid]);

  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      {/* ================= NAVBAR ================= */}
      <nav className="navbar">
        <h3 className="logo" onClick={() => navigate("/")}>
          Stay Safe
        </h3>

        <div className="nav-right">
          {/* Desktop Links */}
          <div className="nav-links desktop">
            <Link to="/">Home</Link>
            {user && <Link to="/rooms">Rooms</Link>}
            {user && <Link to="/dashboard">Dashboard</Link>}
          </div>

          {/* Desktop Icons */}
          {user && (
            <div className="nav-icons desktop">
              <Link to="/inbox" className="nav-icon-wrapper">
                <FiMessageSquare size={22} />
                {unreadMsgs > 0 && (
                  <span className="icon-badge">{unreadMsgs}</span>
                )}
              </Link>

              <div className="notification-container" ref={dropdownRef}>
                <div
                  className="nav-icon-wrapper"
                  onClick={() => setShowList(!showList)}
                >
                  <FiBell size={22} />
                  {unreadNotifCount > 0 && (
                    <span className="icon-badge">{unreadNotifCount}</span>
                  )}
                </div>

                {showList && (
                  <div className="notif-dropdown">
                    {notifications.length === 0 ? (
                      <p className="empty">No notifications</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`notif-item ${
                            !n.read ? "unread" : ""
                          }`}
                          onClick={async () => {
                            if (!n.read) {
                              await updateDoc(
                                doc(db, "notifications", n.id),
                                { read: true }
                              );
                            }
                            setShowList(false);
                            navigate(n.redirectTo);
                          }}
                        >
                          {n.message}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              <img
                src={
                  profile?.profileImage ||
                  "https://www.w3schools.com/howto/img_avatar.png"
                }
                alt="profile"
                className="nav-avatar"
                onClick={() => navigate("/profile")}
              />
            </div>
          )}

          {!user && (
            <div className="auth-btns desktop">
              <Link to="/login">Login</Link>
              <Link to="/register" className="reg-btn">
                Register
              </Link>
            </div>
          )}

          {/* Mobile Hamburger */}
          <div className="mobile-menu-btn" onClick={() => setMobileOpen(true)}>
            <FiMenu size={26} />
          </div>
        </div>
      </nav>

      {/* ================= SIDEBAR ================= */}
      <div
        className={`sidebar-overlay ${mobileOpen ? "active" : ""}`}
        onClick={() => setMobileOpen(false)}
      />

      <div className={`sidebar ${mobileOpen ? "open" : ""}`}>
        {/* Close Button ONLY */}
        <div className="sidebar-header">
          <FiX
            size={28}
            className="close-btn"
            onClick={() => setMobileOpen(false)}
          />
        </div>

        {user && (
          <div
            className="sidebar-user"
            onClick={() => {
              navigate("/profile");
              setMobileOpen(false);
            }}
          >
            <img
              src={
                profile?.profileImage ||
                "https://www.w3schools.com/howto/img_avatar.png"
              }
              alt="user"
            />
            <div>
              <p>{profile?.name || "User"}</p>
            </div>
          </div>
        )}

        <div className="sidebar-links">
          <Link to="/" onClick={() => setMobileOpen(false)}>
            Home
          </Link>

          {user ? (
            <>
              <Link to="/rooms" onClick={() => setMobileOpen(false)}>
                Rooms
              </Link>
              <Link to="/dashboard" onClick={() => setMobileOpen(false)}>
                Dashboard
              </Link>
              <Link to="/inbox" onClick={() => setMobileOpen(false)}>
                Messages ({unreadMsgs})
              </Link>
              <button
                className="sidebar-logout"
                onClick={async () => {
                  await logout();
                  setMobileOpen(false);
                  navigate("/login");
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMobileOpen(false)}>
                Login
              </Link>
              <Link to="/register" onClick={() => setMobileOpen(false)}>
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;
