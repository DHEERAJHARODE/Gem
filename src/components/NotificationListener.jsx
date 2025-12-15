import { useEffect, useRef } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../context/AuthContext";

const NotificationListener = () => {
  const { user } = useAuth();
  const audioRef = useRef(null);

  useEffect(() => {
    if (!user?.uid) return;

    audioRef.current = new Audio("/notification.mp3");

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      where("read", "==", false)
    );

    const unsub = onSnapshot(q, (snap) => {
      snap.docChanges().forEach((change) => {
        if (change.type === "added") {
          audioRef.current.play().catch(() => {});
        }
      });
    });

    return () => unsub();
  }, [user]);

  return null;
};

export default NotificationListener;
