import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db, messaging } from "../firebase/firebaseConfig";
import { getToken } from "firebase/messaging";
import { doc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔔 Save FCM Token
  const saveFcmToken = async (user) => {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;

      const token = await getToken(messaging, {
        vapidKey:
          "BFRmxxb7F7Ysi6B4RgbXFlzib5Hytpl8Ky_hyUovI9ys-ZMv5kEaA8I4_s-jh4ikMxQgXPwjZKiFo2JlsD1bYtM",
      });

      if (!token) return;

      await updateDoc(doc(db, "users", user.uid), {
        fcmToken: token,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("FCM error:", error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      await saveFcmToken(user);

      alert("Login successful ✅");
      navigate("/dashboard");
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-card" onSubmit={handleLogin}>
        <h2>Welcome back</h2>
        <p className="subtitle">Login to continue your journey</p>

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

        <p className="register-text">
          New here?{" "}
          <span onClick={() => navigate("/register")}>
            Create an account
          </span>
        </p>
      </form>
    </div>
  );
};

export default Login;