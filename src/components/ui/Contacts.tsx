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

const socials = [
  { name: "Discord", url: DISCORD_LINK, src: "/discord.svg" },
  { name: "GitHub", url: GITHUB_LINK, src: "/github.svg" },
  { name: "LinkedIn", url: LINKEDIN_LINK, src: "/linkedin.svg" },
  { name: "Instagram", url: INSTAGRAM_LINK, src: "/instagram.svg" },
];

const inputClass =
  "w-full px-4.5 py-3.5 rounded-xl border border-ink/15 bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors";

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
        { publicKey: "QlLGbagw5YQ4qecXH" }
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
    <section id="contact" className="py-24 px-6 relative">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-12">
          <div className="font-mono text-xs uppercase tracking-[0.2em] text-d-plum mb-2.5">
            04 — Say Hello
          </div>
          <h2 className="font-serif font-normal text-5xl md:text-6xl leading-none text-foreground">
            Contact <span className="italic text-d-plum">me</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[0.9fr_1.1fr] gap-12 bg-c-lilac rounded-2xl p-10 md:p-12">
          {/* Contact Info */}
          <div>
            <h3 className="font-serif font-normal text-3xl mb-7 text-foreground">
              Get in touch
            </h3>
            <a
              href={`mailto:${EMAIL_ADDRESS}`}
              className="inline-flex items-center gap-3.5 mb-8 group"
            >
              <span className="flex-none w-11 h-11 rounded-full bg-card flex items-center justify-center">
                <Mail className="h-5 w-5 text-primary" />
              </span>
              <span className="text-foreground group-hover:text-primary transition-colors">
                {EMAIL_ADDRESS}
              </span>
            </a>

            <div className="flex gap-3.5">
              {socials.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className="w-11 h-11 rounded-full bg-card flex items-center justify-center hover:ring-2 hover:ring-primary hover:scale-110 transition-transform duration-300"
                >
                  <img src={social.src} alt={social.name} className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              className={inputClass}
            />
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              className={inputClass}
            />
            <textarea
              name="message"
              placeholder="Your Message"
              rows={5}
              className={`${inputClass} resize-y`}
            ></textarea>
            <button
              type="submit"
              disabled={isSubmitting}
              className="self-start font-mono text-xs uppercase tracking-widest px-7 py-3.5 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {isSubmitting ? "Sending..." : "Send Message →"}
              <Send className="ml-2 h-4 w-4 inline-block" />
            </button>
            {status === "success" && (
              <p className="text-sm text-d-teal">
                Message sent! I'll get back to you soon.
              </p>
            )}
            {status === "error" && (
              <p className="text-sm text-destructive">
                Something went wrong. Please try again or email me directly.
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
};
