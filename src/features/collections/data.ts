import type { Collection } from "@/types";

export const collections: Collection[] = [
  {
    id: "google-through-time",
    title: "Google Through Time",
    description: "How Google's homepage evolved from a simple search box to the complex portal it is today.",
    websites: ["google.com"],
  },
  {
    id: "rise-of-social-media",
    title: "The Rise of Social Media",
    description: "The evolution of social platforms from early experiments to global phenomena.",
    websites: ["facebook.com", "twitter.com", "myspace.com"],
  },
  {
    id: "early-internet",
    title: "Early Internet",
    description: "The web before the dot-com boom — when pages were simple and the future was unwritten.",
    websites: ["yahoo.com", "amazon.com", "ebay.com"],
  },
  {
    id: "browser-wars",
    title: "Browser Wars",
    description: "The battle for the web: from Netscape's dominance to Internet Explorer's reign and the rise of Chrome.",
    websites: ["netscape.com", "mozilla.org", "opera.com"],
  },
  {
    id: "ecommerce-evolution",
    title: "E-Commerce Evolution",
    description: "How online shopping transformed from novelty to necessity.",
    websites: ["amazon.com", "ebay.com", "etsy.com"],
  },
  {
    id: "news-portals",
    title: "News Portals",
    description: "The evolution of online news from text-heavy pages to multimedia experiences.",
    websites: ["cnn.com", "bbc.com", "nytimes.com"],
  },
];

export function getCollection(id: string): Collection | undefined {
  return collections.find((c) => c.id === id);
}
