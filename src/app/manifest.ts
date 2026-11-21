import type { MetadataRoute } from "next";
import { SITE_NAME } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} `,
    short_name: "UoS Assistant",
    description: "Student-built assistant for University of Swat questions.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#059669",
    icons: [
      { src: "/images/university-of-swat-logo.jpg", sizes: "any", type: "image/jpeg" },
    ],
  };
}
