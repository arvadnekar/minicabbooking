import { Send } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import { sendContact } from "@/app/action/SendContact";

export default function ContactForm(){
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
      const [isSubmitting, setIsSubmitting] = useState(false);
    
      const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
      };
    
      const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        // Simulate form submission
        // Prepare FormData object for the server action
    const form = new FormData();
    form.append('name', formData.name);
    form.append('email', formData.email);
    form.append('subject', formData.subject);
    form.append('message', formData.message);

    const response = await sendContact(form);

if (response.success) {
  toast.success("Message sent!", {
    description: "Thank you for your message. I'll get back to you soon.",
  });
  setFormData({ name: "", email: "", subject: "", message: "" });
} else {
  const errorMessages = response.errors
    ? Object.values(response.errors).flat().join(", ")
    : "Something went wrong. Please try again.";

  toast.error("Failed to send message.", {
    description: errorMessages,
  });

  console.error("❌ Form submission errors:", response.errors);
}


    setIsSubmitting(false);
  };
    return (
        <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Input
                  name="name"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="bg-muted/50"
                />
              </div>
              <div>
                <Input
                  name="email"
                  type="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="bg-muted/50"
                />
              </div>
              <div>
                <Input
                  name="subject"
                  placeholder="Subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="bg-muted/50"
                />
              </div>
              <div>
                <Textarea
                  name="message"
                  placeholder="Your Message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="min-h-[150px] bg-muted/50"
                />
              </div>
              <Button
                type="submit" 
                className="w-full rounded-full" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    Sending...
                  </span>
                ) : (
                  <span className="flex items-center">
                    Send Message <Send className="ml-2 h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>
    )
}