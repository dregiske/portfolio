import {
  EMAIL_ADDRESS,
  DISCORD_LINK,
  GITHUB_LINK,
  LINKEDIN_LINK,
  INSTAGRAM_LINK,
} from "@/constants/links";
import { Contact, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { SECTION_CARD, SECTION_HEADING, ICON_CIRCLE } from "@/constants/theme";
import emailjs from "@emailjs/browser";

const socials = [
  {
    name: "Discord",
    url: DISCORD_LINK,
    icon: <img src="/discord.svg" alt="Discord" className="h-10 w-10" />,
  },
  {
    name: "GitHub",
    url: GITHUB_LINK,
    icon: <img src="/github.svg" alt="GitHub" className="h-10 w-10" />,
  },
  {
    name: "LinkedIn",
    url: LINKEDIN_LINK,
    icon: <img src="/linkedin.svg" alt="LinkedIn" className="h-10 w-10" />,
  },
  {
    name: "Instagram",
    url: INSTAGRAM_LINK,
    icon: <img src="/instagram.svg" alt="Instagram" className="h-10 w-10" />,
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
    <section id="contact" className="py-16">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className={SECTION_HEADING}>
          Contact <span className="text-primary">Me</span>
        </h2>

        <div className={`grid grid-cols-1 md:grid-cols-2 ${SECTION_CARD} gap-8`}>
          {/* Contact Info */}
          <div className="mb-8 md:mb-0">
            <h3 className="text-2xl font-semibold mb-4">Get in Touch</h3>
            <ul className="space-y-5 text-lg">
              <li className="flex items-center">
                <div className={`${ICON_CIRCLE} mr-4`}>
                  <Contact className="h-6 w-6 text-primary" />
                </div>
                <span>{EMAIL_ADDRESS}</span>
              </li>
            </ul>

            <div className="mt-6 flex items-center justify-left">
              {socials.map((social) => (
                <div
                  className={cn(
                    "mr-4 items-center flex rounded-full p-3",
                    "dark:bg-neutral-200",
                    "hover:outline-none hover:ring-2 hover:ring-primary",
                    "hover:scale-[1.1] hover:bg-orange-50 dark:hover:bg-orange-100 transition-transform duration-300"
                  )}
                  key={social.name}
                >
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center"
                  >
                    {social.icon}
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="email"
                name="email"
                placeholder="Your Email"
                className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <textarea
                name="message"
                placeholder="Your Message"
                rows={4}
                className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              ></textarea>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-primary text-white rounded-md hover:opacity-90 transition-opacity duration-300"
              >
                {isSubmitting ? "Sending..." : "Send Message"}
                <Send className="ml-2 h-5 w-5 inline-block" />
              </button>
              {status === "success" && (
                <p className="text-sm text-green-600 dark:text-green-400">
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
      </div>
    </section>
  );
};
