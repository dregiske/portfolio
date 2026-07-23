import {
  EMAIL_ADDRESS,
  DISCORD_LINK,
  GITHUB_LINK,
  LINKEDIN_LINK,
  INSTAGRAM_LINK,
} from "@/constants/links";
import { Mail, Send } from "lucide-react";
import { useState } from "react";
import emailjs from "@emailjs/browser";
import { SectionShell } from "@/components/SectionShell/SectionShell";
import { Button } from "@/components/Button/Button";
import { ContactConstellation, type Social } from "./ContactConstellation";
import "./Contacts.css";

const socials: Social[] = [
  { name: "Discord", url: DISCORD_LINK, src: "discord.svg", tone: "sky" },
  { name: "GitHub", url: GITHUB_LINK, src: "github.svg", tone: "frost" },
  { name: "LinkedIn", url: LINKEDIN_LINK, src: "linkedin.svg", tone: "ice" },
  {
    name: "Instagram",
    url: INSTAGRAM_LINK,
    src: "instagram.svg",
    tone: "cobalt",
  },
];

export const Contacts = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus("idle");

    try {
      await emailjs.sendForm(
        "service_udsep0o",
        "template_od2bcn2",
        e.currentTarget,
        { publicKey: "QlLGbagw5YQ4qecXH" },
      );
      setStatus("success");
      (e.target as HTMLFormElement).reset();
    } catch {
      setStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SectionShell
      id="contact"
      num="05"
      eyebrow="CONTACT"
      title="Contact"
      className="overflow-hidden"
    >
      <div className="contact__grid">
        {/* Left — where to find me */}
        <div>
          <a href={`mailto:${EMAIL_ADDRESS}`} className="contact__email">
            <Mail className="contact__email-glyph" />
            {EMAIL_ADDRESS}
          </a>

          <ContactConstellation socials={socials} />
        </div>

        {/* Right — say something */}
        <div>
          <h2 className="contact__title">Say Something!</h2>
          <form onSubmit={handleSubmit} className="contact__form">
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              className="field"
            />
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              className="field"
            />
            <textarea
              name="message"
              placeholder="Your Message"
              rows={5}
              className="field field--area"
            ></textarea>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="contact__submit"
            >
              {isSubmitting ? "Sending..." : "Send Message"}
              <Send className="contact__submit-icon" />
            </Button>
            {status === "success" && (
              <p className="contact__status contact__status--ok">
                Message sent! I'll get back to you soon.
              </p>
            )}
            {status === "error" && (
              <p className="contact__status contact__status--err">
                Something went wrong. Please try again or email me directly.
              </p>
            )}
          </form>
        </div>
      </div>
    </SectionShell>
  );
};
