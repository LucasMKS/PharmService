import { useEffect } from "react";
import { useRouter } from "next/router";

const BlockMobile = () => {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userAgent = navigator.userAgent || navigator.vendor;

      const isMobile =
        /android|iphone|ipad|ipod|blackberry|opera mini|iemobile|wpdesktop/i.test(
          userAgent
        );
      if (isMobile) {
        router.push("/mobile");
      }
    }
  }, []);

  return null;
};

export default BlockMobile;
