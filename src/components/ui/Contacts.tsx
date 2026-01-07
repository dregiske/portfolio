"use client";

import {
  EMAIL_ADDRESS,
  PHONE_NUMBER,
  DISCORD_LINK,
  GITHUB_LINK,
  LINKEDIN_LINK,
} from "@/constants/links";
import { Contact, Phone } from "lucide-react";

const socials = [
  {
    name: "Discord",
    url: DISCORD_LINK,
    icon: <img src="/discord.svg" alt="Discord" className="h-5 w-5" />,
  },
  {
    name: "GitHub",
    url: GITHUB_LINK,
    icon: <img src="/github.svg" alt="GitHub" className="h-5 w-5" />,
  },
  {
    name: "LinkedIn",
    url: LINKEDIN_LINK,
    icon: <img src="/linkedin.svg" alt="LinkedIn" className="h-5 w-5" />,
  },
];

export const Contacts = () => {
  return (
    <section id="contact" className="py-16">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8 border-b pb-4">
          Contact <span className="text-primary">Me</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 bg-secondary/70 p-8 rounded-lg shadow-md gap-8">
          {/* Contact Info */}
          <div className="mb-8 md:mb-0">
            <h3 className="text-xl font-semibold mb-4">Get in Touch</h3>
            <ul className="space-y-2">
              <li className="flex items-center">
                <Contact className="mr-2" />
                <span>{EMAIL_ADDRESS}</span>
              </li>
              <li className="flex items-center">
                <Phone className="mr-2" />
                <span>+1 {PHONE_NUMBER}</span>
              </li>
            </ul>

            <div className="mt-6">
              {socials.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center mr-4 mb-2 text-gray-700 hover:text-primary transition-colors duration-300"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <form className="space-y-4">
              <input
                type="text"
                placeholder="Your Name"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="email"
                placeholder="Your Email"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <textarea
                placeholder="Your Message"
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              ></textarea>
              <button
                type="submit"
                className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors duration-300"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
