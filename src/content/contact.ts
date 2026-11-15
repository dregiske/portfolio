/** The words around getting in touch: the CTA that leads to Contact, and the form. */
export const CONTACT = {
  /** The button that jumps to the Contact section (Hero, About). */
  cta: "Get in touch",
  formTitle: "Say Something!",
  /**
   * Each field's prompt (shown inside the box) and its accessible name — a
   * placeholder disappears once typing starts, so it can't be the only label.
   */
  fields: {
    name: { placeholder: "Your Name", label: "Your name" },
    email: { placeholder: "Your Email", label: "Your email" },
    message: { placeholder: "Your Message", label: "Your message" },
  },
  submit: "Send Message",
  sending: "Sending...",
  success: "Message sent! I'll get back to you soon.",
  error: "Something went wrong. Please try again or email me directly.",
} as const;
