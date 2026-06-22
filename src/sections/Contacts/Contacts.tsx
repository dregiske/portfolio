import {
  EMAIL_ADDRESS,
  DISCORD_LINK,
  GITHUB_LINK,
  LINKEDIN_LINK,
  INSTAGRAM_LINK,
  SOCIALS_ICON_LINK,
} from "@/constants/links";
import { Mail, Send } from "lucide-react";
import { useState } from "react";
import emailjs from "@emailjs/browser";
import { type Tone } from "@/constants/tones";
import { Section } from "@/components/Section/Section";
import { SectionHeader } from "@/components/SectionHeader/SectionHeader";
import { Card } from "@/components/Card/Card";
import { IconCircle } from "@/components/IconCircle/IconCircle";
import { Tag } from "@/components/Tag/Tag";
import { Button } from "@/components/Button/Button";
import "./Contacts.css";

const socials: { name: string; url: string; src: string; tone: Tone }[] = [
  { name: "Discord", url: DISCORD_LINK, src: "discord.svg", tone: "sky" },
  { name: "GitHub", url: GITHUB_LINK, src: "github.svg", tone: "clay" },
  { name: "LinkedIn", url: LINKEDIN_LINK, src: "linkedin.svg", tone: "mint" },
  {
    name: "Instagram",
    url: INSTAGRAM_LINK,
    src: "instagram.svg",
    tone: "butter",
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
    <Section id="contact">
      <SectionHeader
        index="04"
        eyebrow="Say Hello"
        title="Contact"
        accent="me"
        tone="lilac"
      />

      <Card variant="tinted" tone="lilac" className="contact__panel">
        {/* Contact Info */}
        <div>
          <h3 className="contact__heading">Get in touch</h3>
          <Tag
            as="a"
            tone="lilac"
            href={`mailto:${EMAIL_ADDRESS}`}
            className="contact__email"
          >
            <Mail className="contact__email-glyph" />
            {EMAIL_ADDRESS}
          </Tag>

          <div className="contact__socials">
            {socials.map((social) => (
              <IconCircle
                as="a"
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.name}
                bg={social.tone}
                className="contact__social"
              >
                <img
                  src={`${SOCIALS_ICON_LINK}${social.src}`}
                  alt={social.name}
                  className="contact__social-img"
                />
              </IconCircle>
            ))}
          </div>
        </div>

        {/* Contact Form */}
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
      </Card>
    </Section>
  );
};
