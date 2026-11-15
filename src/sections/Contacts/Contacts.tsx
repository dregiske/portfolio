import { useState, type FormEvent } from "react";
import { Mail, Send } from "lucide-react";
import { EMAILJS } from "@/config/emailjs";
import { PROFILE } from "@/content/profile";
import { SOCIALS } from "@/content/socials";
import { SectionShell } from "@/components/SectionShell/SectionShell";
import { Button } from "@/components/Button/Button";
import { Constellation } from "@/components/Constellation/Constellation";
import "./Contacts.css";

/**
 * The socials' homes in the field's 1000×400 virtual space: spread evenly
 * between the side margins, zigzagging above and below the midline so the
 * links read as a chain.
 */
const FIELD = { vw: 1000, vh: 400, margin: 160, zigzag: 70 };

export const Contacts = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setIsSubmitting(true);
    setStatus("idle");

    try {
      // Fetched on send rather than up front: most visitors never submit, so
      // it has no business competing with the first paint.
      const { default: emailjs } = await import("@emailjs/browser");
      await emailjs.sendForm(EMAILJS.serviceId, EMAILJS.templateId, form, {
        publicKey: EMAILJS.publicKey,
      });
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SectionShell id="contact" className="overflow-hidden">
      <div className="contact__grid">
        {/* Left — where to find me */}
        <div>
          <div className="contact__emails">
            <a href={`mailto:${PROFILE.email}`} className="contact__email">
              <Mail className="contact__email-glyph" />
              {PROFILE.email}
            </a>
            <span className="contact__or">or</span>
            <a href={`mailto:${PROFILE.emailAlt}`} className="contact__email">
              <Mail className="contact__email-glyph" />
              {PROFILE.emailAlt}
            </a>
          </div>

          <Constellation
            className="contact__constellation"
            items={SOCIALS}
            toneOf={(social) => social.tone}
            vw={FIELD.vw}
            vh={FIELD.vh}
            // Free to roam the whole Contact section — which fills the screen
            // while you're on it — rather than a margin around the field.
            roam="section"
            floatAmp={16}
            hoverScale={1.1}
            layout={(_box, setHome) => {
              const n = SOCIALS.length;
              const span = FIELD.vw - 2 * FIELD.margin;
              SOCIALS.forEach((_, i) => {
                const hx = n > 1 ? FIELD.margin + (span * i) / (n - 1) : FIELD.vw / 2;
                const hy = FIELD.vh / 2 + (i % 2 === 0 ? -1 : 1) * FIELD.zigzag;
                setHome(i, hx, hy);
              });
            }}
            renderNode={(social, node) => (
              <a
                key={social.name}
                {...node}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.name}
                className={`${node.className} contact__node`}
              >
                <img
                  src={social.icon}
                  alt={social.name}
                  className="contact__social-img"
                  width={28}
                  height={28}
                  loading="lazy"
                  decoding="async"
                />
              </a>
            )}
          />
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
