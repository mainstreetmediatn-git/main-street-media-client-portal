export const sharedTimeline = {
  Today: [
    "Website optimized",
    "New schema deployed",
    "Citation created",
    "Google Business Profile updated",
    "AI Visibility Scan completed"
  ],
  Yesterday: [
    "Review responses posted",
    "Technical SEO scan",
    "Competitor comparison updated",
    "Weekly summary drafted"
  ]
};

export const visibilityChannels = [
  { label: "Google", score: 98, tone: "good" },
  { label: "Bing", score: 82, tone: "good" },
  { label: "Apple Maps", score: 91, tone: "good" },
  { label: "Facebook", score: 69, tone: "warn" },
  { label: "Yelp", score: 57, tone: "warn" },
  { label: "Nextdoor", score: 43, tone: "risk" },
  { label: "Yellow Pages", score: 35, tone: "risk" },
  { label: "BBB", score: 88, tone: "good" }
] as const;

export const scoutPrompts = [
  "Why did my ranking change?",
  "How many leads came from Google?",
  "Show me this month&apos;s improvements.",
  "What should we improve next?"
];

