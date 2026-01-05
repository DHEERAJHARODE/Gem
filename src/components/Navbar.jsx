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
import { FiMenu, FiX, FiMessageSquare, FiUser, FiMessageCircle, FiPhoneCall, FiHelpCircle, FiLogOut } from "react-icons/fi";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [unreadUsersCount, setUnreadUsersCount] = useState(0);
  const [notifications, setNotifications] = useState([]); // Notifications state wapas add ki
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef(null);

  /* ================= FETCH PROFILE ================= */
  useEffect(() => {
    if (!user?.uid) return;
    const fetchProfile = async () => {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) setProfile(snap.data());
    };
    fetchProfile();
  }, [user?.uid]);

  /* ================= MESSAGES LISTENER ================= */
  useEffect(() => {
    if (!user?.uid) return;
    const q = query(collection(db, "messages"), where("receiverId", "==", user.uid), where("seen", "==", false));
    const unsub = onSnapshot(q, (snap) => {
      const senders = snap.docs.map(d => d.data().senderId);
      setUnreadUsersCount([...new Set(senders)].length);
    });
    return () => unsub();
  }, [user?.uid]);

  /* ================= NOTIFICATIONS LISTENER ================= */
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

  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  // Dropdown close logic
  useEffect(() => {
    const close = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowProfileMenu(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <>
      <nav className="navbar">
        <h3 className="logo" onClick={() => navigate("/")}>Stay Safe</h3>

        <div className="nav-right">
          <div className="nav-links desktop">
            <Link to="/">Home</Link>
            {user && (
              <>
                <Link to="/rooms">Rooms</Link>
                
                {/* Notification count applied to these specific links */}
                {profile?.role === "owner" ? (
                  <Link to="/booking-requests" className="nav-badge-link">
                    Booking Requests
                    {unreadNotifCount > 0 && <span className="link-badge">{unreadNotifCount}</span>}
                  </Link>
                ) : (
                  <Link to="/my-requests" className="nav-badge-link">
                    My Requests
                    {unreadNotifCount > 0 && <span className="link-badge">{unreadNotifCount}</span>}
                  </Link>
                )}
                
                <Link to="/dashboard">Dashboard</Link>
              </>
            )}
          </div>

          <div className="nav-actions desktop">
            {user ? (
              <>
                <Link to="/inbox" className="nav-icon-link">
                  <FiMessageSquare size={22} />
                  {unreadUsersCount > 0 && <span className="icon-badge">{unreadUsersCount}</span>}
                </Link>

                <div className="profile-dropdown-container" ref={dropdownRef}>
                  <img
                    src={profile?.profileImage || "https://www.w3schools.com/howto/img_avatar.png"}
                    alt="profile"
                    className="nav-avatar"
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                  />
                  {showProfileMenu && (
                    <div className="profile-menu">
                      <div className="menu-header">
                        <p className="user-name">{profile?.name || "User"}</p>
                        <p className="user-role">{profile?.role}</p>
                      </div>
                      <div className="menu-item" onClick={() => {navigate("/profile"); setShowProfileMenu(false);}}><FiUser /> My Profile</div>
                      <div className="menu-item" onClick={() => {navigate("/feedback"); setShowProfileMenu(false);}}><FiMessageCircle /> Feedback</div>
                      <div className="menu-item" onClick={() => {navigate("/contact"); setShowProfileMenu(false);}}><FiPhoneCall /> Contact</div>
                      <div className="menu-item" onClick={() => {navigate("/help"); setShowProfileMenu(false);}}><FiHelpCircle /> Help</div>
                      <hr />
                      <div className="menu-item logout-text" onClick={logout}><FiLogOut /> Logout</div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="auth-btns">
                <Link to="/login" className="login-link">Login</Link>
                <Link to="/register" className="reg-btn">Register</Link>
              </div>
            )}
          </div>

          <div className="mobile-menu-btn" onClick={() => setMobileOpen(true)}>
            <FiMenu size={28} />
          </div>
        </div>
      </nav>

      {/* ========== SIDEBAR (RIGHT SIDE) ========== */}
      <div className={`sidebar-overlay ${mobileOpen ? "active" : ""}`} onClick={() => setMobileOpen(false)} />
      
      <div className={`sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <FiX size={28} className="close-btn" onClick={() => setMobileOpen(false)} style={{marginLeft: 'auto'}} />
        </div>
        {user && (
          <div className="sidebar-profile" onClick={() => {setMobileOpen(false); navigate("/profile");}}>
            <img src={profile?.profileImage || "https://www.w3schools.com/howto/img_avatar.png"} alt="profile" />
            <p>{profile?.name || "User"}</p>
          </div>
        )}
        <div className="sidebar-links">
          <Link to="/" onClick={() => setMobileOpen(false)}>Home</Link>
          {user ? (
            <>
              <Link to="/rooms" onClick={() => setMobileOpen(false)}>Rooms</Link>
              {profile?.role === "owner" ? (
                <Link to="/booking-requests" onClick={() => setMobileOpen(false)}>
                  Booking Requests {unreadNotifCount > 0 && `(${unreadNotifCount})`}
                </Link>
              ) : (
                <Link to="/my-requests" onClick={() => setMobileOpen(false)}>
                  My Requests {unreadNotifCount > 0 && `(${unreadNotifCount})`}
                </Link>
              )}
              <Link to="/dashboard" onClick={() => setMobileOpen(false)}>Dashboard</Link>
              <Link to="/inbox" onClick={() => setMobileOpen(false)}>Messages ({unreadUsersCount})</Link>
              <button className="sidebar-logout" onClick={logout}>Logout</button>
            </>
          ) : (
            <Link to="/login" onClick={() => setMobileOpen(false)}>Login</Link>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;