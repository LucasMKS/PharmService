import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("token");
    const name = Cookies.get("name");
    const roles = Cookies.get("roles");
    const pharmacyId = Cookies.get("idPharmacy");
    const userId = Cookies.get("userId");

    if (token && name && roles) {
      if (pharmacyId) {
        setUser({ name, roles, pharmacyId, userId });
      } else {
        setUser({ name, roles, userId });
      }
    } else {
      router.push("/auth");
    }
  }, [router]);

  const logout = () => {
    Cookies.remove("token");
    Cookies.remove("name");
    Cookies.remove("roles");
    Cookies.remove("pharmacyId");
    Cookies.remove("userId");
    setUser(null);
    router.push("/auth");
  };

  return { user, logout };
};
