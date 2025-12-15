import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";
import "./Register.css";

const Register = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("room-seeker");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        role,
        createdAt: new Date(),
      });

      alert("Registration successful 🎉");
      navigate("/login");
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <form className="register-card" onSubmit={handleRegister}>
        <h2>Create your account</h2>
        <p className="subtitle">
          Join trusted room owners & seekers across India
        </p>

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

        <div className="role-section">
          <p className="role-title">I am here to</p>

          <div className="role-options">
            <div
              className={`role-card ${
                role === "room-seeker" ? "active" : ""
              }`}
              onClick={() => setRole("room-seeker")}
            >
              🧳
              <h4>Find a Room</h4>
              <span>Book safe & verified rooms</span>
            </div>

            <div
              className={`role-card ${role === "owner" ? "active" : ""}`}
              onClick={() => setRole("owner")}
            >
              🏠
              <h4>List My Room</h4>
              <span>Earn by renting your space</span>
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Get Started"}
        </button>

        <p className="login-text">
          Already have an account?{" "}
          <span onClick={() => navigate("/login")}>Login</span>
        </p>
      </form>
    </div>
  );
};

export default Register;