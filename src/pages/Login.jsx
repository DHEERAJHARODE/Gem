import { useState } from "react";
import {
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth, db, messaging } from "../firebase/firebaseConfig";
import { getToken } from "firebase/messaging";
import { doc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const { signInWithGoogle } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const saveFcmToken = async (user) => {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;

      const token = await getToken(messaging, {
        vapidKey: "6GPW7QAQmoesUfwzwe4Lq_pnd5W8P65uc3O_QVdQwbI",
      });

      if (!token) return;

      await updateDoc(doc(db, "users", user.uid), {
        fcmToken: token,
        updatedAt: new Date(),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      // 🚨 BLOCK UNVERIFIED USERS
      if (!res.user.emailVerified) {
        await signOut(auth);
        alert(
          "Please verify your email first. Check inbox or spam."
        );
        setLoading(false);
        return;
      }

      // ✅ VERIFIED USER
      await saveFcmToken(res.user);
      navigate("/dashboard");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-card" onSubmit={handleLogin}>
        <h2>Welcome Back</h2>
        <p className="subtitle">Login to access your account</p>

        <button
          type="button"
          className="google-btn"
          onClick={() => signInWithGoogle(navigate)}
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="google"
          />
          Continue with Google
        </button>

        <div className="divider">
          <span>or</span>
        </div>

        <input
          type="email"
          placeholder="Email address"
          required
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          required
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p
          className="forgot-text"
          onClick={() => navigate("/forgot-password")}
        >
          Forgot Password?
        </p>

        <p className="register-text">
          Don't have an account?{" "}
          <span onClick={() => navigate("/register")}>
            Register
          </span>
        </p>
      </form>
    </div>
  );
};

export default Login;
