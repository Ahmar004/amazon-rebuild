// Review length limits, shared by the form (client) and lib/validation/review.ts (server).
export const REVIEW_LIMITS = { titleMax: 120, bodyMin: 10, bodyMax: 5000 } as const;
