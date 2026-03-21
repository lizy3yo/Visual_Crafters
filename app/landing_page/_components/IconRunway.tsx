"use client";

import { Box, Image, Globe, Smartphone, PenTool, Layers } from "lucide-react";
import styles from "../landing-page.module.css";

const ICONS = [Box, Image, Globe, Smartphone, PenTool, Layers];

// Repeat enough times to guarantee full viewport coverage at any screen width
const REPEATED = [...ICONS, ...ICONS, ...ICONS, ...ICONS];

export default function IconRunway() {
  return (
    <div className={`${styles.runway} w-full overflow-hidden`}>
      {/* Two identical tracks side-by-side; when the first scrolls fully off-screen
          the second is already in place — creating a seamless infinite loop */}
      <div className={styles.runwayTrack}>
        {REPEATED.map((Icon, i) => (
          <div key={`a-${i}`} className={`${styles.runwayItem} flex items-center justify-center text-[#1f4db8]`}>
            <Icon size={28} />
          </div>
        ))}
        {REPEATED.map((Icon, i) => (
          <div key={`b-${i}`} className={`${styles.runwayItem} flex items-center justify-center text-[#1f4db8]`}>
            <Icon size={28} />
          </div>
        ))}
      </div>
    </div>
  );
}
