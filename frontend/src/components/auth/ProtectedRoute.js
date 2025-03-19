import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect } from "react";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();

  useEffect(() => {

    
    if (!user) {
      navigate("/admin-login", { replace: true }); // Redirect if not logged in
    } else if (!allowedRoles.includes(user.role)) {
      navigate("/", { replace: true }); // Redirect if unauthorized
    }
  }, [user, allowedRoles, navigate]);

  if (!user || !allowedRoles.includes(user?.role)) {
    return null; // Prevent rendering while navigating
  }

  return children;
};

export default ProtectedRoute;
