import { useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const { username } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const storedUsername = localStorage.getItem("username");

  useEffect(() => {
    if (!storedUsername) {
      navigate("/", { replace: true });
    } else if (username !== storedUsername) {
      const correctedPath = location.pathname.replace(
        `/user/${username}`,
        `/user/${storedUsername}`
      );
      navigate(correctedPath, { replace: true });
    }
  }, [username, storedUsername, location, navigate]);

  return children;
}
