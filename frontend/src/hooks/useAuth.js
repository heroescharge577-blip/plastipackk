// frontend/src/hooks/useAuth.js

import { useEffect, useState } from "react";
import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function useAuth() {
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${API_URL}/api/auth/me`, {
        withCredentials: true,
      })

      .then((res) => {
        if (res.data.authenticated) {
          setUser(res.data.user);
        }
      })

      .catch((err) => {
        console.error("Error auth:", err);
      })

      .finally(() => {
        setLoading(false);
      });
  }, []);

  return {
    user,
    loading,
  };
}