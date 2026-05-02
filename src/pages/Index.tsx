import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useRole } from "@/context/RoleContext";

const Index = () => {
  const { role, ready } = useRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (!ready) return;
    navigate(role ? "/timeline" : "/welcome", { replace: true });
  }, [ready, role, navigate]);

  return null;
};

export default Index;
