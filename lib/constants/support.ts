// Customer Service content and vocabulary (frontend-rebuild.md C18). The FAQ answers quote the
// same constants the store runs on, so a rule change updates the help text with it.
import { formatPrice } from "@/lib/pricing/money";
import { FAST_FEE_CENTS, FREE_SHIPPING_THRESHOLD_CENTS, STANDARD_FEE_CENTS } from "@/lib/pricing/shipping";
import { FAST_DAYS, STANDARD_DAYS } from "@/lib/pricing/delivery";
import { SHIP_AFTER_MS } from "@/lib/constants/orders";

// Must match supportTopicEnum and supportStatusEnum in lib/db/schema.ts.
export const SUPPORT_TOPICS = [
  { id: "order", label: "An order" },
  { id: "delivery", label: "Delivery" },
  { id: "return", label: "Returns and refunds" },
  { id: "payment", label: "Payments" },
  { id: "account", label: "My account" },
  { id: "other", label: "Something else" },
] as const;
export type SupportTopic = (typeof SUPPORT_TOPICS)[number]["id"];
export const SUPPORT_TOPIC_IDS = SUPPORT_TOPICS.map((t) => t.id) as [SupportTopic, ...SupportTopic[]];

export const SUPPORT_STATUS = { open: "open", closed: "closed" } as const;
export type SupportStatus = (typeof SUPPORT_STATUS)[keyof typeof SUPPORT_STATUS];

export const SUPPORT_LIMITS = { subjectMax: 120, messageMin: 10, messageMax: 2000 } as const;

export const SUPPORT_ERRORS = {
  subjectRequired: "Add a short subject",
  subjectTooLong: `Keep the subject under ${SUPPORT_LIMITS.subjectMax} characters`,
  messageTooShort: `Tell us a little more (at least ${SUPPORT_LIMITS.messageMin} characters)`,
  messageTooLong: `Keep the message under ${SUPPORT_LIMITS.messageMax} characters`,
  topicRequired: "Choose what this is about",
  orderNotFound: "That order isn't on your account",
} as const;

const SHIP_MINUTES = SHIP_AFTER_MS / 60000;

export type FaqEntry = { id: string; topic: SupportTopic; question: string; answer: string };

export const FAQ: FaqEntry[] = [
  {
    id: "track",
    topic: "order",
    question: "Where is my order?",
    answer:
      "Open Your Orders and choose \"View order details\". The timeline shows where the order is (Ordered, Shipped, Out for delivery or Delivered) with the expected date for each step.",
  },
  {
    id: "cancel",
    topic: "order",
    question: "Can I cancel an order?",
    answer: `Yes, for ${SHIP_MINUTES} minutes after you place it, until it ships. Open the order and choose "Cancel order". The full amount goes straight back to your card.`,
  },
  {
    id: "change-address",
    topic: "order",
    question: "Can I change the delivery address on an order?",
    answer:
      "Not once it is placed. If the order hasn't shipped yet, cancel it and order again with the right address. You can manage saved addresses under Your account > Addresses.",
  },
  {
    id: "shipping-cost",
    topic: "delivery",
    question: "How much does shipping cost?",
    answer: `Standard delivery is free on orders of ${formatPrice(FREE_SHIPPING_THRESHOLD_CENTS)} or more, and ${formatPrice(STANDARD_FEE_CENTS)} below that. Fast delivery is ${formatPrice(FAST_FEE_CENTS)} on any order. The cart shows how far you are from free shipping.`,
  },
  {
    id: "delivery-time",
    topic: "delivery",
    question: "How long does delivery take?",
    answer: `Standard delivery arrives ${STANDARD_DAYS} days after you order and fast delivery ${FAST_DAYS} days after. Checkout shows the exact date for each option before you pay.`,
  },
  {
    id: "return",
    topic: "return",
    question: "How do I return an item?",
    answer:
      "Send us a request below with the topic \"Returns and refunds\" and pick the order. You can return new, unopened items within 30 days of delivery.",
  },
  {
    id: "refund-time",
    topic: "return",
    question: "When will I get my refund?",
    answer: "Refunds for cancelled orders are issued right away to the card you paid with. Your bank may take a few days to show it.",
  },
  {
    id: "payment-methods",
    topic: "payment",
    question: "Which payment methods can I use?",
    answer:
      "Credit and debit cards, processed securely by Stripe. Tick \"Save this card\" at checkout to pay faster next time. This demo store runs in Stripe test mode, so use the test card 4242 4242 4242 4242.",
  },
  {
    id: "tax",
    topic: "payment",
    question: "How is tax worked out?",
    answer: "Tax is estimated from the state of your delivery address and shown in the order summary before you pay.",
  },
  {
    id: "remove-card",
    topic: "payment",
    question: "How do I remove a saved card?",
    answer: "Go to Your account > Payment methods and choose \"Remove\". The card is also removed from our payment provider.",
  },
  {
    id: "password",
    topic: "account",
    question: "How do I change my password or email?",
    answer: "Go to Your account > Profile & security. Changing your password needs your current one.",
  },
  {
    id: "why-sign-in",
    topic: "account",
    question: "Why do I need an account to browse?",
    answer:
      "Signing in first means checkout is quick when you're ready to buy, and your cart, wishlist and recently viewed items follow you everywhere.",
  },
];
