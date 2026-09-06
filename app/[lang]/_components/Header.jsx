"use client";
import { usePathname } from "next/navigation";
import LandingHeader from "@/features/navigation/landing/LandingHeader";
import HomeHeader from "@/features/navigation/home/HomeHeader";

const Header = ({ cityData }) => {
  const pathname = usePathname();
  return pathname.endsWith("/landing") ? (
    <LandingHeader />
  ) : (
    <HomeHeader cityData={cityData} />
  );
};

export default Header;
