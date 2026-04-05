"use client"
import { LandingPage } from "@/components/LandingPage";
import { Footer } from "@/components/layout/Footer";
import { useEffect } from "react";

export default function Home() {

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");

    if (accessToken && refreshToken) {
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      // Xóa token khỏi URL
      window.history.replaceState({}, "", "/");
      // Reload để AuthProvider đọc lại localStorage + fetch profile
      window.location.reload();
    }
  }, []);

  return (
    <>
      <LandingPage />
      <Footer />
    </>
  );
}
