import { useEffect, useState } from "react";
import LargeDashboard from "./Dashboard";
import SmallDashboard from "./SmallDashboard";

export default function DashboardSwitch() {
  const [isMobile, setIsMobile] = useState(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 1025);
    checkMobile(); // set initial value
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // prevent flicker before detection
  if (isMobile === null) return null;

  return isMobile ? <SmallDashboard /> : <LargeDashboard />;
}
