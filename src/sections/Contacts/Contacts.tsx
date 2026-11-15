import { useState, type CSSProperties, type FormEvent } from "react";
import { Mail, Send } from "lucide-react";
import { EMAILJS } from "@/config/emailjs";
import { CONTACT } from "@/content/contact";
import { PROFILE } from "@/content/profile";
import { SOCIALS } from "@/content/socials";
import { SectionShell } from "@/components/SectionShell/SectionShell";
import { Button } from "@/components/Button/Button";
import "./Contacts.css";

/**
 * Two columns: where to find me on the left (both addresses, then a still row
 * of socials in their own colors), and the form on the right. Compact, they
 * stack in that order, with the addresses and a 2×2 of socials side by side.
 */
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
    <SectionShell id="contact">
      <div className="contact__grid">
        {/* Left — where to find me */}
        <div className="contact__where">
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

          <ul className="contact__socials">
            {SOCIALS.map((social) => (
              <li key={social.name}>
                <a
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  title={social.name}
                  className="contact__social"
                  style={
                    {
                      "--social-brand": social.brand,
                      "--social-ink": social.ink,
                    } as CSSProperties
                  }
                >
                  <span
                    className="contact__social-glyph"
                    style={{
                      maskImage: `url(${social.icon})`,
                      WebkitMaskImage: `url(${social.icon})`,
                    }}
                    aria-hidden="true"
                  />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Right — say something. The prompts sit inside the boxes; each
            field also carries an aria-label (see `CONTACT.fields`). */}
        <div>
          <h3 className="contact__title">{CONTACT.formTitle}</h3>
          <form onSubmit={handleSubmit} className="contact__form">
            <input
              type="text"
              name="name"
              placeholder={CONTACT.fields.name.placeholder}
              aria-label={CONTACT.fields.name.label}
              autoComplete="name"
              required
              className="field"
            />
            <input
              type="email"
              name="email"
              placeholder={CONTACT.fields.email.placeholder}
              aria-label={CONTACT.fields.email.label}
              autoComplete="email"
              required
              className="field"
            />
            <textarea
              name="message"
              placeholder={CONTACT.fields.message.placeholder}
              aria-label={CONTACT.fields.message.label}
              rows={5}
              required
              className="field field--area"
            />
            <Button
              type="submit"
              variant="light"
              disabled={isSubmitting}
              className="contact__submit"
            >
              {isSubmitting ? CONTACT.sending : CONTACT.submit}
              <Send className="contact__submit-icon" />
            </Button>
            {status === "success" && (
              <p className="contact__status contact__status--ok" role="status">
                {CONTACT.success}
              </p>
            )}
            {status === "error" && (
              <p className="contact__status contact__status--err" role="alert">
                {CONTACT.error}
              </p>
            )}
          </form>
        </div>
      </div>
    </SectionShell>
  );
};
