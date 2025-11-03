// src/utils/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children,requiredRole }) => {
  const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("role");   // store role after login

  // if (!token) {
  //   return <Navigate to="/login" replace />;
  // }
  // if (requiredRole && userRole !== requiredRole) {
  //   return <Navigate to="/" />; // redirect if role not matched
  // }

  return children;
};

export default ProtectedRoute;
