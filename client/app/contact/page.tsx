"use client";

import { useState } from "react";
import { Mail, User, MessageSquare } from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", form);
    setSubmitted(true);
    setForm({ name: "", email: "", message: "" });
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <div className="w-full max-w-lg bg-card border border-border shadow-lg rounded-xl p-8">
        <h1 className="text-3xl font-bold mb-4 text-center">Contact Us</h1>
        <p className="text-center text-muted-foreground mb-6">
          Have a question or want to work together? Send us a message below.
        </p>

        {submitted && (
          <p className="mb-4 text-green-600 text-center font-medium">
            ✅ Your message has been sent!
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <div className="relative">
            <User className="absolute left-3 top-3 text-muted-foreground" size={20} />
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background border-input focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Email Field */}
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-muted-foreground" size={20} />
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background border-input focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Message Field */}
          <div className="relative">
            <MessageSquare className="absolute left-3 top-3 text-muted-foreground" size={20} />
            <textarea
              name="message"
              placeholder="Your Message"
              value={form.message}
              onChange={handleChange}
              required
              rows={5}
              className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background border-input focus:outline-none focus:ring-2 focus:ring-primary"
            ></textarea>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
}
