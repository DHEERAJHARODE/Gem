import { useEffect, useState } from "react";
import { db } from "../firebase/firebaseConfig";
import { collection, query, where, onSnapshot, getDoc, doc, orderBy, limit, getDocs } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Inbox.css";

const Inbox = () => {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const qSeeker = query(collection(db, "bookings"), where("status", "==", "accepted"), where("seekerId", "==", user.uid));
    const qOwner = query(collection(db, "bookings"), where("status", "==", "accepted"), where("ownerId", "==", user.uid));

    const processDocs = async (snap) => {
      const list = [];
      for (let d of snap.docs) {
        const data = d.data();
        const otherUserId = data.ownerId === user.uid ? data.seekerId : data.ownerId;
        
        const [userSnap, roomSnap] = await Promise.all([
          getDoc(doc(db, "users", otherUserId)),
          getDoc(doc(db, "rooms", data.roomId))
        ]);

        // Specific Room ke unseen messages count
        const unreadQ = query(
          collection(db, "messages"),
          where("roomId", "==", data.roomId),
          where("receiverId", "==", user.uid),
          where("seen", "==", false)
        );
        const unreadSnap = await getDocs(unreadQ);

        const msgQ = query(collection(db, "messages"), where("roomId", "==", data.roomId), orderBy("createdAt", "desc"), limit(1));
        const msgSnap = await getDocs(msgQ);

        list.push({
          id: d.id,
          roomId: data.roomId,
          roomTitle: roomSnap.data()?.title || "Room Chat",
          userName: userSnap.data()?.name || "User",
          userPhoto: userSnap.data()?.profileImage || "https://www.w3schools.com/howto/img_avatar.png",
          lastMessage: msgSnap.docs[0]?.data()?.text || "No messages yet...",
          unreadMessages: unreadSnap.size // Individual message count
        });
      }
      return list;
    };

    const unsubSeeker = onSnapshot(qSeeker, async (snap) => {
      const res = await processDocs(snap);
      setChats(prev => {
        const combined = [...prev, ...res];
        return Array.from(new Map(combined.map(item => [item.roomId, item])).values());
      });
      setLoading(false);
    });

    const unsubOwner = onSnapshot(qOwner, async (snap) => {
      const res = await processDocs(snap);
      setChats(prev => {
        const combined = [...prev, ...res];
        return Array.from(new Map(combined.map(item => [item.roomId, item])).values());
      });
      setLoading(false);
    });

    return () => { unsubSeeker(); unsubOwner(); };
  }, [user]);

  if (loading) return <div className="loading">Loading your inbox...</div>;

  return (
    <div className="inbox-page">
      <div className="inbox-header"><h2>Messages</h2></div>
      <div className="chat-list">
        {chats.map((chat) => (
          <div key={chat.id} className="chat-card" onClick={() => navigate(`/chat/${chat.roomId}`)}>
            <img src={chat.userPhoto} alt="user" className="chat-avatar" />
            <div className="chat-details">
              <div className="chat-row">
                <h4>{chat.userName}</h4>
                {/* Specific Room Count */}
                {chat.unreadMessages > 0 && <span className="unread-msg-count">{chat.unreadMessages}</span>}
              </div>
              <p className="last-msg">{chat.lastMessage}</p>
              <span className="room-tag">{chat.roomTitle}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Inbox;