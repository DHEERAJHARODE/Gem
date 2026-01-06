import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useRef, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import {
  FiMenu,
  FiX,
  FiMessageSquare,
  FiUser,
  FiMessageCircle,
  FiPhoneCall,
  FiHelpCircle,
  FiLogOut,
  FiHome,
  FiGrid,
  FiMail,
  FiPlusSquare, // Add Room ke liye icon
} from "react-icons/fi";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [unreadUsersCount, setUnreadUsersCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!user?.uid) return;
    const fetchProfile = async () => {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) setProfile(snap.data());
    };
    fetchProfile();
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid) return;
    const q = query(
      collection(db, "messages"),
      where("receiverId", "==", user.uid),
      where("seen", "==", false)
    );
    const unsub = onSnapshot(q, (snap) => {
      const senders = snap.docs.map((d) => d.data().senderId);
      setUnreadUsersCount([...new Set(senders)].length);
    });
    return () => unsub();
  }, [user?.uid]);

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

  useEffect(() => {
    const close = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <>
      <nav className="navbar">
        <div className="nav-container">
          <h3 className="logo" onClick={() => navigate("/")}>
            Stay Safe<span className="logo-dot">.</span>
          </h3>

          <div className="nav-links desktop">
            {user && (
              <>
                <NavLink to="/" className="hover-underline" end>Home</NavLink>
                <NavLink to="/rooms" className="hover-underline">Rooms</NavLink>

                {profile?.role === "owner" ? (
                  <NavLink to="/booking-requests" className="hover-underline">
                    Requests
                    {unreadNotifCount > 0 && <span className="link-badge">{unreadNotifCount}</span>}
                  </NavLink>
                ) : (
                  <NavLink to="/my-requests" className="hover-underline">
                    My Requests
                    {unreadNotifCount > 0 && <span className="link-badge">{unreadNotifCount}</span>}
                  </NavLink>
                )}

                <NavLink to="/dashboard" className="hover-underline">Dashboard</NavLink>
              </>
            )}
          </div>

          <div className="nav-actions">
            {user ? (
              <div className="desktop-actions desktop">
                <NavLink to="/inbox" className="nav-icon-link">
                  <FiMessageSquare size={22} />
                  {unreadUsersCount > 0 && <span className="icon-badge">{unreadUsersCount}</span>}
                </NavLink>

                <div ref={dropdownRef} className="avatar-wrapper">
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
                      <div className="menu-item" onClick={() => { navigate("/profile"); setShowProfileMenu(false); }}>
                        <FiUser /> My Profile
                      </div>
                      <div className="menu-item" onClick={() => { navigate("/feedback"); setShowProfileMenu(false); }}>
                        <FiMessageCircle /> Feedback
                      </div>
                      <div className="menu-item" onClick={() => { navigate("/contact"); setShowProfileMenu(false); }}>
                        <FiPhoneCall /> Contact
                      </div>
                      <div className="menu-item" onClick={() => { navigate("/help"); setShowProfileMenu(false); }}>
                        <FiHelpCircle /> Help
                      </div>
                      <hr className="menu-divider" />
                      <div className="menu-item logout-text" onClick={logout}>
                        <FiLogOut /> Logout
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="auth-btns desktop">
                <NavLink to="/login" className="login-link">Login</NavLink>
                <NavLink to="/register" className="reg-btn">Register</NavLink>
              </div>
            )}

            <div className="mobile-menu-btn" onClick={() => setMobileOpen(true)}>
              <FiMenu size={26} />
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <div className={`sidebar-overlay ${mobileOpen ? "active" : ""}`} onClick={() => setMobileOpen(false)} />

      <div className={`sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <FiX size={28} className="close-btn" onClick={() => setMobileOpen(false)} />
        </div>

        {user ? (
          <>
            <div className="sidebar-profile" onClick={() => { navigate("/profile"); setMobileOpen(false); }}>
              <img src={profile?.profileImage || "https://www.w3schools.com/howto/img_avatar.png"} alt="profile" />
              <div>
                <p className="sidebar-user-name">{profile?.name || "User"}</p>
                <span className="sidebar-user-role">{profile?.role}</span>
              </div>
            </div>

            <div className="sidebar-links">
              <NavLink to="/" onClick={() => setMobileOpen(false)} end><FiHome /> Home</NavLink>
              <NavLink to="/rooms" onClick={() => setMobileOpen(false)}><FiGrid /> Rooms</NavLink>
              
              <NavLink to="/dashboard" onClick={() => setMobileOpen(false)}><FiGrid /> Dashboard</NavLink>

              {profile?.role === "owner" ? (
                <>
                  <NavLink to="/add-room" onClick={() => setMobileOpen(false)}><FiPlusSquare /> Add Room</NavLink>
                  <NavLink to="/booking-requests" onClick={() => setMobileOpen(false)}><FiMail /> Requests</NavLink>
                </>
              ) : (
                <NavLink to="/my-requests" onClick={() => setMobileOpen(false)}><FiMail /> My Requests</NavLink>
              )}
              
              <NavLink to="/inbox" onClick={() => setMobileOpen(false)}><FiMessageSquare /> Messages</NavLink>
              <button className="sidebar-logout" onClick={logout}><FiLogOut /> Logout</button>
            </div>
          </>
        ) : (
          <div className="sidebar-auth-grid">
            <NavLink to="/login" className="side-login" onClick={() => setMobileOpen(false)}>Login</NavLink>
            <NavLink to="/register" className="side-reg" onClick={() => setMobileOpen(false)}>Register</NavLink>
          </div>
        )}
      </div>
    </>
  );
};

export default Navbar;