import { useEffect } from "react";
import AppRoutes from "./routes/AppRoutes";
import Navbar from "./components/Navbar";
import { getFcmToken } from "./firebase/getFcmToken";
import "./App.css";
import NotificationListener from "./components/NotificationListener";

function App() {
  useEffect(() => {
    // Abhi test ke liye static user id
    // Login system hone par yahan user.uid pass karna
    getFcmToken("test-user-123");
  }, []);

  return (
    <>
      <NotificationListener />
      <Navbar />
      <AppRoutes />
    </>
  );
}

export default App;