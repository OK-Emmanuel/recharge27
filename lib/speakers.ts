// Speaker catalogue. Every page reads from this file, so confirming a speaker means editing
// one entry: set `placeholder: false`, replace the name, role, bio, background and (optionally)
// add a `photo` path under /public. No component or route changes are needed. If you change a
// slug, keep it URL-safe and unique.
export interface Speaker {
  slug: string
  name: string
  role: string
  placeholder: boolean
  photo?: string
  track: string
  sessionTitle: string
  sessionFocus: string
  bio: string[]
  background: string[]
  expect: string[]
}

const tbc = "Speaker to be announced"
const bioNote =
  "The speaker for this session will be announced shortly. Their full biography will appear here once confirmed."

export const speakers: readonly Speaker[] = [
  {
    slug: "speaker-01",
    name: tbc,
    role: "Wealth & investment practitioner",
    placeholder: true,
    track: "Financial Intelligence",
    sessionTitle: "Financial Intelligence & Wealth Investment",
    sessionFocus: "Understanding money. Building assets. Securing the future.",
    bio: [bioNote, "We are inviting a practitioner with a long record of structuring, growing and protecting wealth across the Nigerian and global economies."],
    background: ["Verified career highlights will be listed here", "Notable investments, roles and recognitions", "Published work and public speaking"],
    expect: [
      "How to build wealth through deliberate financial decisions",
      "Investing in shares, property, funds and other productive assets",
      "Structuring finances for long-term growth, tax efficiency and retirement",
    ],
  },
  {
    slug: "speaker-02",
    name: tbc,
    role: "Protection & longevity specialist",
    placeholder: true,
    track: "Health & Protection",
    sessionTitle: "Health, Protection & Longevity",
    sessionFocus: "Protecting your life. Preserving your health. Extending your capacity.",
    bio: [bioNote, "This session pairs financial protection with preventive health, because wealth is only useful to those with the health to enjoy it."],
    background: ["Verified career highlights will be listed here", "Clinical, advisory or insurance credentials", "Community and public-health contributions"],
    expect: [
      "How life insurance protects dependants and family interests",
      "Preventive living: nutrition, routine checks and recognising warning signs",
      "Sustaining physical and mental capacity as you grow older",
    ],
  },
  {
    slug: "speaker-03",
    name: tbc,
    role: "Etiquette & executive conduct coach",
    placeholder: true,
    track: "Influence & Conduct",
    sessionTitle: "The Culture of Influence, Etiquette & Elite Conduct",
    sessionFocus: "The royal art of conduct, communication, relationships and access.",
    bio: [bioNote, "We are inviting a voice with deep experience of protocol, executive presence and the social intelligence of influential rooms."],
    background: ["Verified career highlights will be listed here", "Protocol, hospitality or diplomatic experience", "Coaching and advisory engagements"],
    expect: [
      "Executive presence, dining etiquette and personal comportment",
      "Communicating with authority without intimidation",
      "Building relationships with influential people, with discretion and integrity",
    ],
  },
  {
    slug: "speaker-04",
    name: tbc,
    role: "Brand strategist",
    placeholder: true,
    track: "Brand & Authority",
    sessionTitle: "Building an Authoritative Brand in the Age of AI",
    sessionFocus: "Credible, recognisable and influential brands in an AI-driven market.",
    bio: [bioNote, "This session is led by a practising brand builder and includes a hands-on brand assessment for participants."],
    background: ["Verified career highlights will be listed here", "Brands built, launched or repositioned", "Agency, product and community ventures"],
    expect: [
      "How AI is changing visibility, content creation and positioning",
      "How not to brand: the mistakes that quietly erode credibility",
      "A practical assessment of your own brand, with recommendations",
    ],
  },
  {
    slug: "speaker-05",
    name: tbc,
    role: "Serial entrepreneur",
    placeholder: true,
    track: "Business Perspectives",
    sessionTitle: "Business Motivation & Wealth-Building Perspectives",
    sessionFocus: "Real numbers, real stories, and what is possible when ideas become execution.",
    bio: [bioNote, "A results-driven conversation grounded in actual figures and lived experience, not a generic motivational talk."],
    background: ["Verified career highlights will be listed here", "Ventures founded, led, sold or scaled", "Platforms and portfolio businesses"],
    expect: [
      "The practical realities behind entrepreneurship and portfolio building",
      "Lessons from successes, setbacks, decisions and exits",
      "Fresh energy and perspective between the more technical sessions",
    ],
  },
  {
    slug: "speaker-06",
    name: tbc,
    role: "Executive & strategy adviser",
    placeholder: true,
    track: "Power & Strategy",
    sessionTitle: "Business Politics & Navigating Power Dynamics",
    sessionFocus: "Reading the room, the stakes and the people behind every decision.",
    bio: [bioNote, "We are inviting a senior operator who has navigated boardrooms, partnerships and competing interests at close range."],
    background: ["Verified career highlights will be listed here", "Executive and board-level roles", "Negotiations, partnerships and turnarounds"],
    expect: [
      "How power and influence actually move inside organisations",
      "Making strategic decisions under pressure and competing interests",
      "Protecting your reputation while advancing your position",
    ],
  },
  {
    slug: "speaker-07",
    name: tbc,
    role: "Independent talent & freelance leader",
    placeholder: true,
    track: "Independent Work",
    sessionTitle: "How to Win as a Freelancer",
    sessionFocus: "Turning skill into a premium, resilient independent business.",
    bio: [bioNote, "This session is for skilled professionals who want to price, position and grow independent work with confidence."],
    background: ["Verified career highlights will be listed here", "Freelance and platform building experience", "Clients served and revenue milestones"],
    expect: [
      "Positioning and pricing your work for premium clients",
      "Winning and keeping international and local clients",
      "Turning a solo practice into a durable business",
    ],
  },
  {
    slug: "speaker-08",
    name: tbc,
    role: "Growth & scale-up operator",
    placeholder: true,
    track: "Scale & Strategy",
    sessionTitle: "Strategy for Your First ₦100 Million in Business",
    sessionFocus: "A practical route from first revenue to your first hundred million.",
    bio: [bioNote, "We are inviting an operator who has taken a business through the milestones that most founders only plan for."],
    background: ["Verified career highlights will be listed here", "Businesses scaled past major revenue milestones", "Advisory and investment experience"],
    expect: [
      "The milestones, margins and decisions that matter on the way to ₦100 million",
      "Where growth stalls, and how to restructure to keep it moving",
      "A clear plan you can test the week after the event",
    ],
  },
]

export const findSpeaker = (slug: string) => speakers.find((speaker) => speaker.slug === slug)

export const speakerNumber = (speaker: Speaker) => String(speakers.indexOf(speaker) + 1).padStart(2, "0")

export const initials = (speaker: Speaker) =>
  speaker.placeholder
    ? speakerNumber(speaker)
    : speaker.name
        .split(/\s+/)
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
