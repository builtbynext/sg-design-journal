import { Project } from "./types";

export const mockProjects: Project[] = [
  {
    id: "1",
    title: "Palette Drop",
    category: "TOOL",
    description:
      "A browser extension that extracts color palettes from any webpage with a single click. Built out of frustration with manually picking hex codes during design reviews.\n\nIt detects dominant colors, groups near-duplicates, and exports to Figma, CSS variables, or a JSON token file. What started as a weekend hack became something three studios now use daily.",
    cover_image_url: "https://picsum.photos/id/26",
    author_name: "Maya Okonkwo",
    project_url: "https://example.com",
    status: "approved",
    created_at: "2024-11-01T00:00:00Z",
  },
  {
    id: "2",
    title: "Readwise CLI",
    category: "APP",
    description:
      "A terminal-first interface for your Readwise library. Pipe highlights into your notes, grep your saved quotes, and get a random book passage every time you open a new shell.\n\nBuilt because switching to a browser just to find a quote broke flow. Now it's part of my daily shell config.",
    cover_image_url: "https://picsum.photos/id/48",
    author_name: "Tom Bekele",
    project_url: "https://github.com",
    status: "approved",
    created_at: "2024-10-15T00:00:00Z",
  },
  {
    id: "3",
    title: "Fog of War SG",
    category: "MAPS",
    description:
      "A map of Singapore that reveals neighborhoods as you walk through them — fog of war style, like an RTS game. Powered by the browser's Geolocation API and a simple canvas renderer.\n\nThe idea came from wanting to have a reason to explore every corner of the island. It worked: I've now visited parts of Jurong I'd never otherwise have seen.",
    cover_image_url: "https://picsum.photos/id/67",
    author_name: "Priya Nair",
    status: "approved",
    created_at: "2024-09-20T00:00:00Z",
  },
  {
    id: "4",
    title: "Microcopy Studio",
    category: "DESIGN",
    description:
      "A collection of 200+ UI text patterns — button labels, empty states, error messages, tooltips — organized by context and tone. Each entry includes a do/don't pair and a rationale.\n\nStarted as a personal reference doc, grew into something colleagues kept asking to borrow.",
    cover_image_url: "https://picsum.photos/id/103",
    author_name: "Sven Larsson",
    project_url: "https://example.com",
    status: "approved",
    created_at: "2024-08-30T00:00:00Z",
  },
  {
    id: "5",
    title: "Slowmail",
    category: "APP",
    description:
      "An email client that introduces a 24-hour delay on all outgoing messages. A forced pause before anything gets sent.\n\nBuilt after sending one too many emails I immediately regretted. The delay has killed four arguments and saved at least two working relationships.",
    cover_image_url: "https://picsum.photos/id/180",
    author_name: "Isla Chen",
    project_url: "https://example.com",
    status: "approved",
    created_at: "2024-08-10T00:00:00Z",
  },
  {
    id: "6",
    title: "Type Mirror",
    category: "DESIGN",
    description:
      "Paste any text and see it rendered in 40 different typefaces side by side. Useful for type selection when you know the copy but not the font.\n\nMost font preview tools show the alphabet. This one shows your actual content — which is the only test that matters.",
    cover_image_url: "https://picsum.photos/id/225",
    author_name: "Ryo Tanaka",
    project_url: "https://example.com",
    status: "approved",
    created_at: "2024-07-22T00:00:00Z",
  },
  {
    id: "7",
    title: "Habit Stack",
    category: "APP",
    description:
      "A habit tracker with no streaks, no gamification, and no notifications. Just a simple log and a yearly calendar heatmap.\n\nBuilt because every other habit app was trying to manipulate behavior through anxiety. This one just records what you did.",
    cover_image_url: "https://picsum.photos/id/314",
    author_name: "Amara Diallo",
    status: "approved",
    created_at: "2024-06-14T00:00:00Z",
  },
  {
    id: "8",
    title: "Contract Clarity",
    category: "TOOL",
    description:
      "Paste a freelance contract and get a plain-English summary of the clauses that actually matter: kill fees, IP ownership, revision limits, and payment terms.\n\nNot legal advice — but it's helped junior designers spot unfair IP grabs before signing.",
    cover_image_url: "https://picsum.photos/id/431",
    author_name: "James Obi",
    project_url: "https://example.com",
    status: "approved",
    created_at: "2024-05-03T00:00:00Z",
  },
];
