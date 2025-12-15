import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import AddRoom from "../pages/AddRoom";
import MyRooms from "../pages/MyRooms";
import EditRoom from "../pages/EditRoom";
import RoomsList from "../pages/RoomsList";
import RoomDetails from "../pages/RoomDetails";
import BookingRequests from "../pages/BookingRequests";
import ChooseRole from "../pages/ChooseRole";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute"; // optional: redirect logged-in users

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/add-room"
        element={
          <ProtectedRoute>
            <AddRoom />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-rooms"
        element={
          <ProtectedRoute>
            <MyRooms />
          </ProtectedRoute>
        }
      />
      <Route
        path="/edit-room/:id"
        element={
          <ProtectedRoute>
            <EditRoom />
          </ProtectedRoute>
        }
      />
      <Route
        path="/booking-requests"
        element={
          <ProtectedRoute>
            <BookingRequests />
          </ProtectedRoute>
        }
      />

      {/* Public accessible rooms */}
      <Route path="/rooms" element={<RoomsList />} />
      <Route path="/room/:id" element={<RoomDetails />} />
      <Route path="/choose-role" element={<ChooseRole />} />
    </Routes>
  );
};

export default AppRoutes;