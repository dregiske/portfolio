import type { Project } from "./types";

export const PROJECTS: Project[] = [
  {
    name: "The Fray News",
    description:
      "A web application that provides personalized news recommendations. Using KNN machine learning algorithms and user preferences through interactions and topic filtering, this web app personalizes your feed to match what each user likes.",
    link: "https://www.thefraynews.com",
    tools: [
      "React",
      "FastAPI",
      "scikit-learn",
      "Machine Learning",
      "Nginx",
      "Python",
      "TypeScript",
      "JWT",
      "Axios",
      "NewsAPI",
    ],
    image: { src: "/projects/thefraynews.jpg", width: 750, height: 373 },
  },
  {
    name: "Cash Out Poker Bank",
    description:
      "A automated home game poker banking app. Made to make home games enjoyable by servicing settlement calculations and denomination distrubutions. Also provides stats overtime and between friends!",
    link: "https://cashoutpoker.net",
    tools: [
      "Data Anaylsis",
      "Python",
      "TypeScript",
      "PostgreSQL",
      "TailwindCSS",
      "React",
      "JWT",
      "FastAPI",
      "Swift",
    ],
    image: { src: "/projects/cashoutlogo.jpg", width: 750, height: 348 },
  },
  {
    name: "My Portfolio",
    description:
      "My fun and innovative portfolio, with interactive components, animated rendering, and theming. This website is meant to showcase my projects, skills, and myself as a programmer!",
    link: "https://andregiske.com",
    tools: [
      "TypeScript",
      "TailwindCSS",
      "UX/UI",
      "Digital Design",
      "Interactivity",
    ],
    image: { src: "/projects/code.jpg", width: 750, height: 403 },
  },
  {
    name: "Hemma",
    description:
      "A international social media platform that utilizes the widget space! Hemma users upload images of 'home' and compete for a spot on the leaderboard. Winners get to be featured as one of the most voted pictures of the week!",
    link: "https://hemmalive.com",
    tools: [
      "Swift",
      "Python",
      "FastAPI",
      "PostgreSQL",
      "iOS",
      "SwiftUI",
      "CDN",
      "Sentry",
    ],
    image: { src: "/projects/hemma.jpg", width: 750, height: 389 },
  },
];
