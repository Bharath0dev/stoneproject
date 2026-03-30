import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import ProfilePageWrapper from "./pages/ProfilePage";
import ProfilePage from "./pages/ProfilePage";

// ✅ Protected Route component (ADD HERE)
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/" />;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />

      {/* ✅ Wrap HomePage with ProtectedRoute */}
      <Route
        path="/home"
        element={
          // <ProtectedRoute>
            <HomePage />
          // </ProtectedRoute>
        }
      />
      <Route path="/profile" element={<ProfilePage />} />
    </Routes>
  );
}

export default App;