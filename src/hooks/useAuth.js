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

    if (token && name && roles) {
      setUser({ name, roles: JSON.parse(roles) });
    } else {
      router.push("/auth");
    }
  }, [router]);

  //   const token = "dasdasdasdasdasdas";
  //   const name = "teste";
  //   const roles = "CLIENTE";
  //   if (token && name && roles) {
  //     setUser({ name, roles });
  //   } else {
  //     router.push("/auth");
  //   }
  // }, [router]);

  const logout = () => {
    Cookies.remove("token");
    Cookies.remove("name");
    Cookies.remove("roles");
    setUser(null);
    router.push("/auth");
  };

  return { user, logout };
};
