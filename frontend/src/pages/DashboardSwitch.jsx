import { useEffect, useState } from "react";
import LargeDashboard from "./Dashboard";
import SmallDashboard from "./SmallDashboard";

export default function DashboardSwitch() {
  const [isMobile, setIsMobile] = useState(null);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 1025px)");

    const update = () => setIsMobile(media.matches);

    update(); // set initial value

    media.addEventListener("change", update);

    return () => media.removeEventListener("change", update);
  }, []);

  // prevent flicker before detection
  if (isMobile === null) return null;

  return isMobile ? <SmallDashboard /> : <LargeDashboard />;
}
