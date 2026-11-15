import type { Social } from "./types";

/**
 * Each in its app's own colors. GitHub's mark is black on white, inverted
 * from its usual light-theme use, so it stands out on the dark page.
 */
export const SOCIALS: Social[] = [
  {
    name: "GitHub",
    url: "https://github.com/dregiske",
    icon: "/socials/github.svg",
    brand: "#f0f6fc",
    ink: "#0d1117",
  },
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/in/andre-giske-8a8030315/",
    icon: "/socials/linkedin.svg",
    brand: "#0a66c2",
    ink: "#ffffff",
  },
  {
    name: "Discord",
    url: "https://discord.com/users/drev.2",
    icon: "/socials/discord.svg",
    brand: "#5865f2",
    ink: "#ffffff",
  },
  {
    name: "Instagram",
    url: "https://www.instagram.com/dre.giske",
    icon: "/socials/instagram.svg",
    brand:
      "radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285aeb 90%)",
    ink: "#ffffff",
  },
];
