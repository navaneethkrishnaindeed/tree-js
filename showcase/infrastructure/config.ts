export const tvmazeBaseUrl = "https://api.tvmaze.com";

export const sampleVideoUrl =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

export const rateLimit = {
  maxRequests: 20,
  windowMs: 10_000,
} as const;

export const storageKeys = {
  session: "nf.session",
  myList: "nf.mylist",
} as const;
