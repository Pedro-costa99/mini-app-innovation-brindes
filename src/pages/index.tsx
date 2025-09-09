import { useEffect } from "react";
import { useRouter } from "next/router";
import { getToken } from "@/utils/authStorage";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (getToken()) {
      router.replace("/produtos");
    } else {
      router.replace("/login");
    }
  }, [router]);

  return null;
}
