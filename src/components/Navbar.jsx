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

  // ===== Fetch profile =====
  useEffect(() => {
    if (!user?.uid) return;
    const fetchProfile = async () => {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) setProfile(snap.data());
    };
    fetchProfile();
  }, [user?.uid]);

  // ===== Unread messages =====
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

  // ===== Notifications =====
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

  // ===== Close dropdown =====
  useEffect(() => {
    const close = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <>
      {/* ================= NAVBAR ================= */}
      <nav className="navbar">
        <div className="nav-container">
          <h3 className="logo" onClick={() => navigate("/")}>
            Stay Safe<span className="logo-dot">.</span>
          </h3>

          {/* ===== DESKTOP LINKS (ONLY WHEN LOGGED IN) ===== */}
          <div className="nav-links desktop">
            {user && (
              <>
                <Link to="/" className="hover-underline">Home</Link>
                <Link to="/rooms" className="hover-underline">Rooms</Link>

                {profile?.role === "owner" ? (
                  <Link to="/booking-requests" className="hover-underline">
                    Requests
                    {unreadNotifCount > 0 && (
                      <span className="link-badge">{unreadNotifCount}</span>
                    )}
                  </Link>
                ) : (
                  <Link to="/my-requests" className="hover-underline">
                    My Requests
                    {unreadNotifCount > 0 && (
                      <span className="link-badge">{unreadNotifCount}</span>
                    )}
                  </Link>
                )}

                <Link to="/dashboard" className="hover-underline">
                  Dashboard
                </Link>
              </>
            )}
          </div>

          {/* ===== RIGHT ACTIONS ===== */}
          <div className="nav-actions">
            {user ? (
              <div className="desktop-actions desktop">
                <Link to="/inbox" className="nav-icon-link">
                  <FiMessageSquare size={22} />
                  {unreadUsersCount > 0 && (
                    <span className="icon-badge">{unreadUsersCount}</span>
                  )}
                </Link>

                <div ref={dropdownRef}>
                  <img
                    src={
                      profile?.profileImage ||
                      "https://www.w3schools.com/howto/img_avatar.png"
                    }
                    alt="profile"
                    className="nav-avatar"
                    onClick={() =>
                      setShowProfileMenu(!showProfileMenu)
                    }
                  />

                  {showProfileMenu && (
                    <div className="profile-menu">
                      <div className="menu-header">
                        <p className="user-name">
                          {profile?.name || "User"}
                        </p>
                        <p className="user-role">{profile?.role}</p>
                      </div>

                      <div
                        className="menu-item"
                        onClick={() => navigate("/profile")}
                      >
                        <FiUser /> My Profile
                      </div>
                      <div
                        className="menu-item"
                        onClick={() => navigate("/feedback")}
                      >
                        <FiMessageCircle /> Feedback
                      </div>
                      <div
                        className="menu-item"
                        onClick={() => navigate("/contact")}
                      >
                        <FiPhoneCall /> Contact
                      </div>
                      <div
                        className="menu-item"
                        onClick={() => navigate("/help")}
                      >
                        <FiHelpCircle /> Help
                      </div>

                      <hr className="menu-divider" />
                      <div
                        className="menu-item logout-text"
                        onClick={logout}
                      >
                        <FiLogOut /> Logout
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="auth-btns desktop">
                <Link to="/login" className="login-link">
                  Login
                </Link>
                <Link to="/register" className="reg-btn">
                  Register
                </Link>
              </div>
            )}

            {/* ===== MOBILE MENU BUTTON ===== */}
            <div
              className="mobile-menu-btn"
              onClick={() => setMobileOpen(true)}
            >
              <FiMenu size={26} />
            </div>
          </div>
        </div>
      </nav>

      {/* ================= MOBILE SIDEBAR ================= */}
      <div
        className={`sidebar-overlay ${mobileOpen ? "active" : ""}`}
        onClick={() => setMobileOpen(false)}
      />

      <div className={`sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <FiX
            size={28}
            className="close-btn"
            onClick={() => setMobileOpen(false)}
          />
        </div>

        {user && (
          <>
            <div className="sidebar-profile">
              <img
                src={
                  profile?.profileImage ||
                  "https://www.w3schools.com/howto/img_avatar.png"
                }
                alt="profile"
              />
              <div>
                <p className="sidebar-user-name">
                  {profile?.name || "User"}
                </p>
                <span className="sidebar-user-role">
                  {profile?.role}
                </span>
              </div>
            </div>

            <div className="sidebar-links">
              <Link to="/" onClick={() => setMobileOpen(false)}>
                <FiHome /> Home
              </Link>
              <Link to="/rooms" onClick={() => setMobileOpen(false)}>
                <FiGrid /> Rooms
              </Link>

              {profile?.role === "owner" ? (
                <Link
                  to="/booking-requests"
                  onClick={() => setMobileOpen(false)}
                >
                  <FiMail /> Requests
                </Link>
              ) : (
                <Link
                  to="/my-requests"
                  onClick={() => setMobileOpen(false)}
                >
                  <FiMail /> My Requests
                </Link>
              )}

              <Link to="/inbox" onClick={() => setMobileOpen(false)}>
                <FiMessageSquare /> Messages
              </Link>

              <button className="sidebar-logout" onClick={logout}>
                <FiLogOut /> Logout
              </button>
            </div>
          </>
        )}

        {!user && (
          <div className="sidebar-auth-grid">
            <Link
              to="/login"
              className="side-login"
              onClick={() => setMobileOpen(false)}
            >
              Login
            </Link>
            <Link
              to="/register"
              className="side-reg"
              onClick={() => setMobileOpen(false)}
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

export default Navbar;
