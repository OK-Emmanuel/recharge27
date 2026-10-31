export type Answers = Record<string, string | string[]>

export type Question = {
  id: string
  label: string
  type: "text" | "single" | "multi" | "pillars"
  options?: readonly string[]
  hint?: string
  when?: { field: string; value: string }
}

export type Stage = {
  title: string
  shortTitle: string
  intro: string
  groups: Question[][]
}

export const pillars = [
  { name: "Wealth", description: "Investments, business, assets." },
  { name: "Health", description: "Wellbeing, resilience, longevity." },
  { name: "Purpose", description: "Direction, clarity, meaning." },
  { name: "Power", description: "Influence, leadership, leverage." },
] as const

export const facilitators = [
  { name: "Adeola Akinrinmade", background: " 25+ years of executive leadership and financial management experience" },
  { name: "Uke Enun", background: "The Founder of GoNomad.", website: "https://gonomadhq.com", glimpse: "https://youtu.be/VAi33vWQokI" },
  { name: "Israel Otoijamun", background: "The Founder of Xcrow.", website: "https://xcrow.co", glimpse: "https://www.linkedin.com/in/otoijamun/" },
  { name: "Marcel Okeke", background: "Former Chief Economist, Zenith Bank. 30+ years of experience.", glimpse: "https://share.google/aimode/Douso0fpDteJL8v5n"},
  { name: "Dr & Mrs Kolawole Bola", background: "Classified Profiles. Over 25 years of experience in sustainable wealth." },
  { name: "Taiwo Faruq", background: "Professional associations: Crescend, Taifaq Pixel, Uprix.", glimpse: "https://uprix.vercel.app/" },
  { name: "Olushola Olaleye", background: "Professional identity: TheOlushola.", glimpse: "https://www.youtube.com/@the_olushola" },
] as const

export const facilitatorOptions = [
  "Strong yes!",
  "Open to them",
  "Not familiar enough to decide.",
  "Don't bring them",
] as const

export const stages: Stage[] = [
  {
    title: "Your Wealth Lab experience",
    shortTitle: "Looking back",
    intro: "A quick look back first. Honest feedback helps us most.",
    groups: [
      [
        { id: "previous_experience_standout", label: "What stood out most to you about your previous Wealth Lab experience?", type: "text" },
        { id: "positive_feedback_valuable_aspects", label: "Which aspects of the previous edition did you find most valuable?", type: "multi", options: [
          "The facilitators and their insights.", "Practical knowledge and actionable strategies.", "Networking and meaningful connections.",
          "Exposure to new perspectives.", "The programme structure.", "The overall atmosphere and environment.",
          "Hospitality and guest experience.", "Personal reflection and transformation.", "Other.",
        ] },
      ],
      [
        { id: "improvement_areas", label: "What didn't go as well as you expected?", type: "multi", hint: "Honest feedback is welcome, even the uncomfortable kind.", options: [
          "Transportation and accessibility.", "Distance or location.", "Accommodation and hotel arrangements.", "Venue comfort and facilities.",
          "Programme timing and scheduling.", "Programme structure and flow.", "Session duration.", "Content relevance.",
          "Facilitator delivery.", "Networking opportunities.", "Hospitality and refreshments.", "Communication before the event.", "Other.",
        ] },
        { id: "improvement_experience_details", label: "Would you like to tell us more about your experience?", type: "text" },
        { id: "transportation_logistical_difficulties", label: "Did you encounter any logistical difficulties before or during the event?", type: "single", options: ["Yes.", "No.", "A few minor inconveniences."] },
        { id: "transportation_logistical_details", label: "What happened, and what could we have done differently?", type: "text", when: { field: "transportation_logistical_difficulties", value: "Yes." } },
        { id: "transportation_minor_details", label: "What were the minor inconveniences?", type: "text", when: { field: "transportation_logistical_difficulties", value: "A few minor inconveniences." } },
      ],
      [
        { id: "positive_feedback_retain", label: "What is one thing you would definitely want us to retain in the next edition?", type: "text" },
        { id: "improvement_priority", label: "What is one thing you would strongly recommend we improve?", type: "text" },
      ],
    ],
  },
  {
    title: "What matters to you?",
    shortTitle: "Your priorities",
    intro: "Which areas deserve more attention next time?",
    groups: [
      [
        { id: "pillar_interests", label: "Which of these four pillars would you most like us to explore more deeply?", type: "pillars", options: pillars.map((pillar) => pillar.name) },
        { id: "pillar_priority", label: "Which one is your biggest priority right now?", type: "single", options: pillars.map((pillar) => pillar.name) },
      ],
      [
        { id: "pillar_subjects", label: "What specific subjects, challenges, or questions would you love to have addressed?", type: "text" },
        ...pillars.map((pillar): Question => ({
          id: `${pillar.name.toLowerCase()}_priorities`,
          label: `What would you especially like to explore in ${pillar.name}?`,
          hint: pillar.description,
          type: "text",
          when: { field: "pillar_interests", value: pillar.name },
        })),
        { id: "programme_value", label: "What would make the next edition genuinely valuable to you?", type: "multi", options: [
          "Practical frameworks I can implement immediately.", "Access to experienced people and their insights.",
          "Real-world case studies and lessons.", "Strategic conversations and deeper thinking.", "Meaningful relationships and networking.",
          "Personal transformation and accountability.", "Business, investment, and wealth opportunities.", "A combination of these.",
        ] },
        { id: "current_challenge", label: "Is there a particular challenge you're currently navigating that you would appreciate guidance on?", type: "text", hint: "Share only what you're comfortable with." },
      ],
    ],
  },
  {
    title: "The experience you want",
    shortTitle: "The experience",
    intro: "Every detail matters, from arrival to departure.",
    groups: [
      [
        { id: "experience_expectations", label: "What would make the next Wealth Lab experience exceptional for you?", type: "multi", options: [
          "A more thoughtfully selected venue.", "Easier transportation and accessibility.", "Better accommodation arrangements.",
          "More comfortable seating and facilities.", "Improved hospitality.", "A more engaging programme.", "More intimate and interactive sessions.",
          "Better time management.", "More networking and connection opportunities.", "Smaller curated conversations.",
          "Practical workshops and implementation sessions.", "Greater access to facilitators.", "More personalised experiences.", "Other.",
        ] },
        { id: "venue_preference", label: "What type of venue would you prefer?", type: "single", options: [
          "Premium hotel or conference facility.", "Private luxury venue.", "Intimate executive retreat environment.",
          "Nature-inspired or resort environment.", "No particular preference, provided the experience is exceptional.",
        ] },
      ],
      [
        { id: "venue_accessibility_importance", label: "How important is the location and accessibility of the venue?", type: "single", options: [
          "Extremely important.", "Very important.", "Moderately important.", "Not a major concern.",
        ] },
        { id: "accommodation_attendance_influence", label: "Would accommodation arrangements influence your attendance?", type: "single", options: [
          "Yes, significantly.", "Yes, depending on the location.", "No, I would make my own arrangements.", "I would appreciate recommended accommodation options.",
        ] },
        { id: "programme_format", label: "What would you prefer regarding the programme?", type: "single", options: [
          "A more intensive, full-day experience.", "A two-day immersive experience.", "A multi-day retreat.",
          "Shorter, highly focused sessions.", "A combination of structured sessions and informal experiences.", "Open to the best-curated format.",
        ] },
      ],
      [
        { id: "hospitality_transportation_logistics_suggestions", label: "What would you like us to do differently regarding hospitality, transportation, venue, scheduling, or general event logistics?", type: "text" },
        { id: "accessibility_considerations", label: "Are there any personal or accessibility considerations we should take into account when planning?", type: "text", hint: "Practical needs only, such as step-free access. No medical details." },
      ],
    ],
  },
  {
    title: "The people and perspectives",
    shortTitle: "People & perspectives",
    intro: "We curate based on experience and results, not visibility. No one below is confirmed yet.",
    groups: [
      [],
      [],
      [
        { id: "facilitator_particular_interests", label: "Are there particular individuals whose perspectives you'd especially appreciate?", type: "text" },
        { id: "desired_expertise", label: "What kind of facilitators would you like to encounter?", type: "multi", options: [
          "Experienced entrepreneurs.", "Investors and wealth strategists.", "Financial and economic experts.", "Business builders and operators.",
          "Experienced corporate executives.", "Health and performance experts.", "Leadership and influence practitioners.",
          "Purpose and personal development practitioners.", "People with demonstrable results and practical experience.", "Other.",
        ] },
        { id: "facilitator_evaluation_priorities", label: "What matters most to you when evaluating a facilitator?", type: "multi", options: [
          "Demonstrable experience.", "Practical results.", "Depth of knowledge.", "Ability to simplify complex concepts.",
          "Real-world implementation.", "Unique perspectives.", "Relevant professional track record.",
        ] },
      ],
      [
        { id: "facilitator_suggestions", label: "Is there someone whose experience or perspective you would love to see at Wealth Lab?", type: "text" },
        { id: "desired_subjects", label: "What subjects would you rather have explored, regardless of who facilitates them?", type: "text" },
      ],
    ],
  },
  {
    title: "Your next edition",
    shortTitle: "What's next",
    intro: "A few quick questions to help us plan.",
    groups: [
      [
        { id: "attendance_likelihood", label: "Are you considering attending the next Wealth Lab edition?", type: "single", options: [
          "Definitely. I'm looking forward to it.", "Very likely.", "Interested, but I need more details.",
          "It depends on the date, location, and programme.", "Not certain yet.", "Unlikely to attend this time.",
        ] },
        { id: "attendance_decision_factors", label: "What would most influence your decision to attend?", type: "multi", options: [
          "Programme relevance.", "Facilitator quality.", "Venue and location.", "Date and schedule.", "Ticket pricing.",
          "Overall experience.", "Networking opportunities.", "Accommodation and logistics.", "Recommendations from the community.", "Other.",
        ] },
      ],
      [
        { id: "ticket_preference", label: "Which type of access would you most likely consider?", type: "single", hint: "Research categories, not confirmed offers.", options: [
          "Standard experience.", "Premium/VIP experience.", "Private or intimate access experience.",
          "Enhanced access with additional privileges.", "I would decide based on the actual offering.", "Not sure yet.",
        ] },
        { id: "pricing_expectations", label: "What would you consider a worthwhile investment for an experience of this nature?", type: "text", hint: "No prices set yet. Share a range if you like." },
        { id: "premium_expectations", label: "What additional privileges or benefits would make a premium ticket worthwhile?", type: "multi", options: [
          "Priority access.", "Exclusive networking.", "Private conversations with facilitators.", "Special seating arrangements.",
          "Curated small-group experiences.", "Accommodation benefits.", "Transportation support.", "Post-event resources.",
          "Continued community engagement.", "Other.",
        ] },
        { id: "attendance_commitment_details", label: "What would you need to know or see before committing to attendance?", type: "text" },
      ],
    ],
  },
  {
    title: "One last thing",
    shortTitle: "Final thoughts",
    intro: "Anything we haven't asked?",
    groups: [
      [
        { id: "additional_change", label: "If you could change one thing about Wealth Lab, what would it be?", type: "text" },
        { id: "additional_new_experience", label: "If you could introduce one new experience, what would it be?", type: "text" },
      ],
      [
        { id: "additional_team_understanding", label: "Is there anything you wish the organising team understood about your experience or expectations?", type: "text" },
        { id: "additional_suggestions", label: "Any additional suggestions, concerns, or ideas?", type: "text" },
      ],
      [],
    ],
  },
]

export function isVisible(question: Question, answers: Answers) {
  if (!question.when) return true
  const answer = answers[question.when.field]
  return Array.isArray(answer) ? answer.includes(question.when.value) : answer === question.when.value
}

export const DRAFT_KEY = "wealthlab-feedback-draft-v1"
export const FEEDBACK_ENDPOINT = "/api/feedback"

export function feedbackPayload(answers: Answers, mode: "anonymous" | "identified", name: string, email: string) {
  const payload: Answers = {
    anonymity_preference: mode,
    submitted_at: new Date().toISOString(),
    previous_attendee_confirmation: "Confirmed",
    feedback_exercise: "Your Voice. Your Interests. Your Wealth Lab Experience.",
  }
  for (const question of stages.flatMap((stage) => stage.groups.flat())) {
    if (!isVisible(question, answers)) continue
    const answer = answers[question.id]
    if (Array.isArray(answer) ? answer.length > 0 : typeof answer === "string" && answer.trim()) {
      payload[question.id] = answer
    }
    const other = answers[`${question.id}_other`]
    if (question.options?.includes("Other.") && Array.isArray(answer) && answer.includes("Other.") && typeof other === "string" && other.trim()) {
      payload[`${question.id}_other`] = other
    }
  }
  facilitators.forEach((_, index) => {
    const id = `facilitator_interest_${index + 1}`
    const answer = answers[id]
    if (Array.isArray(answer) && answer.length > 0) payload[`${id}_${facilitators[index].name.replaceAll(" ", "_").toLowerCase()}`] = answer
  })
  if (mode === "identified") {
    payload.full_name = name.trim()
    if (email.trim()) payload.email = email.trim()
  }
  return payload
}

export function parseDraft(raw: string): Answers {
  const draft: unknown = JSON.parse(raw)
  if (!draft || typeof draft !== "object" || !("version" in draft) || draft.version !== 1 || !("answers" in draft)) {
    throw new Error("Invalid draft")
  }
  const answers = draft.answers
  if (!answers || typeof answers !== "object" || Array.isArray(answers)) throw new Error("Invalid answers")
  const validFields = new Map<string, { type: Question["type"]; options?: readonly string[] }>()
  stages.flatMap((stage) => stage.groups.flat()).forEach((question) => {
    validFields.set(question.id, question)
    if (question.options?.includes("Other.")) validFields.set(`${question.id}_other`, { type: "text" })
  })
  facilitators.forEach((_, index) => validFields.set(`facilitator_interest_${index + 1}`, { type: "multi", options: facilitatorOptions }))
  const result: Answers = {}
  for (const [key, value] of Object.entries(answers)) {
    if (!validFields.has(key)) continue
    const field = validFields.get(key)
    if (!field) continue
    if (typeof value === "string" && value.length <= 4000 && (field.type === "text" || (field.type === "single" && (value === "" || field.options?.includes(value))))) result[key] = value
    else if (Array.isArray(value) && (field.type === "multi" || field.type === "pillars") && value.every((item: unknown) => typeof item === "string" && field.options?.includes(item))) result[key] = value
    else throw new Error("Invalid answer")
  }
  return result
}

export type Progress = {
  mode: "anonymous" | "identified" | null
  name: string
  email: string
  stageIndex: number
  groupIndex: number
}

// Reads the position and sharing details saved next to the answers; anything invalid falls back to a fresh start.
export function parseProgress(raw: string): Progress {
  const fresh: Progress = { mode: null, name: "", email: "", stageIndex: 0, groupIndex: 0 }
  try {
    const saved: unknown = JSON.parse(raw)
    const progress = saved && typeof saved === "object" && "progress" in saved ? saved.progress : null
    if (!progress || typeof progress !== "object") return fresh
    const { mode, name, email, stageIndex, groupIndex } = progress as Record<string, unknown>
    const stage = Number.isInteger(stageIndex) ? stages[stageIndex as number] : undefined
    const stageOk = stage !== undefined
    const groupOk = stageOk && Number.isInteger(groupIndex) && (groupIndex as number) >= 0 && (groupIndex as number) < stage.groups.length
    return {
      mode: mode === "anonymous" || mode === "identified" ? mode : null,
      name: typeof name === "string" ? name.slice(0, 200) : "",
      email: typeof email === "string" ? email.slice(0, 254) : "",
      stageIndex: stageOk ? (stageIndex as number) : 0,
      groupIndex: groupOk ? (groupIndex as number) : 0,
    }
  } catch {
    return fresh
  }
}

export type FeedbackSubmission = {
  mode: "anonymous" | "identified"
  fullName: string | null
  email: string | null
  answers: Answers
}

// Validates an untrusted request body against the question definitions; unknown keys are dropped.
export function sanitizeFeedback(body: unknown): FeedbackSubmission | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null
  const input = body as Record<string, unknown>
  const mode = input.anonymity_preference
  if (mode !== "anonymous" && mode !== "identified") return null
  if (input.previous_attendee_confirmation !== "Confirmed") return null

  const fields = new Map<string, { type: Question["type"]; options?: readonly string[] }>()
  for (const question of stages.flatMap((stage) => stage.groups.flat())) {
    fields.set(question.id, question)
    if (question.options?.includes("Other.")) fields.set(`${question.id}_other`, { type: "text" })
  }
  facilitators.forEach((facilitator, index) => {
    fields.set(`facilitator_interest_${index + 1}_${facilitator.name.replaceAll(" ", "_").toLowerCase()}`, { type: "multi", options: facilitatorOptions })
  })

  const answers: Answers = {}
  for (const [key, value] of Object.entries(input)) {
    const field = fields.get(key)
    if (!field) continue
    if (typeof value === "string" && value.length <= 4000 && (field.type === "text" || (field.type === "single" && field.options?.includes(value)))) {
      if (value.trim()) answers[key] = value
    } else if (Array.isArray(value) && value.length <= 30 && (field.type === "multi" || field.type === "pillars") && value.every((item) => typeof item === "string" && field.options?.includes(item))) {
      if (value.length > 0) answers[key] = value
    } else {
      return null
    }
  }

  if (mode === "anonymous") return { mode, fullName: null, email: null, answers }
  const fullName = typeof input.full_name === "string" ? input.full_name.trim() : ""
  if (!fullName || fullName.length > 200) return null
  const email = typeof input.email === "string" ? input.email.trim() : ""
  if (email && (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) return null
  return { mode, fullName, email: email || null, answers }
}
