import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase/firebaseConfig";
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import "./Chat.css";

const Chat = () => {
  const { roomId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef();

  useEffect(() => {
    // 1. Index banne ke baad hi ye query chalegi
    const q = query(
      collection(db, "messages"),
      where("roomId", "==", roomId),
      orderBy("createdAt", "asc") 
    );

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(list);
    }, (error) => {
      // Agar yahan error aaye toh wahi index link par click karna hai
      console.error("Snapshot Error:", error);
    });

    return () => unsub();
  }, [roomId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await addDoc(collection(db, "messages"), {
        roomId,
        senderId: user.uid,
        senderEmail: user.email,
        text: newMessage,
        createdAt: serverTimestamp(),
      });
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h3>💬 Chat Support</h3>
      </div>

      <div className="messages-box">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message-wrapper ${msg.senderId === user.uid ? "own" : "other"}`}
          >
            <div className="message-bubble">
              <p className="msg-text">{msg.text}</p>
              <span className="msg-time">
                {msg.createdAt?.toDate() 
                  ? msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                  : "..."}
              </span>
            </div>
          </div>
        ))}
        <div ref={scrollRef}></div>
      </div>

      <form className="chat-input" onSubmit={handleSend}>
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Chat;