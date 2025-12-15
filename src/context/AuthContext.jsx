import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signOut,
  signInWithPopup,
} from "firebase/auth";
import { auth, googleProvider, db } from "../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const logout = async () => {
    await signOut(auth);
  };

  // ✅ GOOGLE SIGN IN
  const signInWithGoogle = async (navigate) => {
    const result = await signInWithPopup(auth, googleProvider);

    const user = result.user;
    const isNewUser = result._tokenResponse?.isNewUser;

    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);

    if (isNewUser || !snap.exists()) {
      navigate("/choose-role"); // 👈 NEW GOOGLE USER
    } else {
      navigate("/dashboard"); // 👈 EXISTING USER
    }
  };

  return (
    <AuthContext.Provider value={{ user, logout, signInWithGoogle }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
