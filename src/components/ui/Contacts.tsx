import {
  EMAIL_ADDRESS,
  PHONE_NUMBER,
  DISCORD_LINK,
  GITHUB_LINK,
  LINKEDIN_LINK,
  INSTAGRAM_LINK,
} from "@/constants/links";
import { Contact, Send, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const form = e.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const message = (form.elements.namedItem("message") as HTMLTextAreaElement).value;
    const subject = encodeURIComponent(`Portfolio message from ${name}`);
    const body = encodeURIComponent(`From: ${name} (${email})\n\n${message}`);
    window.location.href = `mailto:${EMAIL_ADDRESS}?subject=${subject}&body=${body}`;
    setIsSubmitting(false);
  };

  return (
    <section id="contact" className="py-16">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8 border-b pb-4">
          Contact <span className="text-primary">Me</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 bg-secondary/70 p-8 rounded-lg shadow-md gap-8">
          {/* Contact Info */}
          <div className="mb-8 md:mb-0">
            <h3 className="text-2xl font-semibold mb-4">Get in Touch</h3>
            <ul className="space-y-5 text-lg">
              <li className="flex items-center">
                <div className="p-3 rounded-full bg-primary/10 mr-4">
                  <Contact className="h-6 w-6 text-primary" />
                </div>
                <span>{EMAIL_ADDRESS}</span>
              </li>
              <li className="flex items-center">
                <div className="p-3 rounded-full bg-primary/10 mr-4">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <span>+1 {PHONE_NUMBER}</span>
              </li>
            </ul>

            <div className="mt-6 flex items-center justify-left">
              {socials.map((social) => (
                <div
                  className={cn(
                    "mr-4 items-center flex rounded-full p-3",
                    "dark:bg-white/50",
                    "hover:outline-none hover:ring-2 hover:ring-primary",
                    "hover:scale-[1.1] hover:bg-primary/10  transition-transform duration-300"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="email"
                name="email"
                placeholder="Your Email"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <textarea
                name="message"
                placeholder="Your Message"
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              ></textarea>
              <button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  "px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/80 transition-colors duration-300"
                )}
              >
                {isSubmitting ? "Sending..." : "Send Message"}
                <Send className="ml-2 h-5 w-5 inline-block" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
