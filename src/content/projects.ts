import type { Project } from "./types";

export const PROJECTS: Project[] = [
  {
    name: "The Fray News",
    summary: "A news feed that learns what you want to read.",
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
    featured: true,
  },
  {
    name: "Cash Out Poker Bank",
    summary: "Settles up home poker games so nobody has to.",
    description:
      "An automated home game poker banking app. Made to make home games enjoyable by servicing settlement calculations and denomination distributions. Also provides stats over time and between friends!",
    link: "https://cashoutpoker.net",
    tools: [
      "FastAPI",
      "React",
      "PostgreSQL",
      "Swift",
      "Python",
      "TypeScript",
      "TailwindCSS",
      "JWT",
      "Data Analysis",
    ],
    image: { src: "/projects/cashoutlogo.jpg", width: 750, height: 348 },
  },
  {
    name: "My Portfolio",
    summary: "This site: interactive, animated, innovative.",
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
    summary: "A social photo leaderboard that lives in your widgets.",
    description:
      "An international social media platform that utilizes the widget space! Hemma users upload images of 'home' and compete for a spot on the leaderboard. Winners get to be featured as one of the most voted pictures of the week!",
    link: "https://hemmalive.com",
    tools: [
      "Swift",
      "SwiftUI",
      "FastAPI",
      "PostgreSQL",
      "iOS",
      "Python",
      "CDN",
      "Sentry",
    ],
    image: { src: "/projects/hemma.jpg", width: 750, height: 389 },
  },
];
