import { useState } from "react";
import { motion } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";

const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Please enter a valid email"),
  subject: z.string().min(3, "Subject is required"),
  message: z.string().min(10, "Message should be at least 10 characters long"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

const ContactPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await apiRequest("POST", "/api/contact", data);
      
      // Show feedback based on whether the email was sent successfully
      if (response.message.includes("notification email sent")) {
        toast({
          title: "Message sent successfully!",
          description: "Thank you for your message. I'll get back to you soon.",
        });
      } else {
        // Email was saved but not sent
        toast({
          title: "Message received!",
          description: "Your message was saved but there was an issue sending the email notification. I'll still review your message.",
          variant: "default",
        });
      }
      
      reset();
    } catch (error: any) {
      console.error("Contact form error:", error);
      toast({
        title: "Error sending message",
        description: error?.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-6">Get In Touch</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Have a project in mind or just want to connect? I'd love to hear from you.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <h3 className="text-2xl font-space font-semibold mb-6">
              Contact Information
            </h3>
            <ul className="space-y-4">
              <li className="flex items-center">
                <div className="bg-background/40 backdrop-blur-sm p-3 rounded-full mr-4">
                  <i className="ri-mail-line text-secondary text-xl"></i>
                </div>
                <a
                  href="mailto:alex@example.com"
                  className="text-muted-foreground hover:text-secondary transition-colors"
                >
                  alex@example.com
                </a>
              </li>
              <li className="flex items-center">
                <div className="bg-background/40 backdrop-blur-sm p-3 rounded-full mr-4">
                  <i className="ri-phone-line text-secondary text-xl"></i>
                </div>
                <a
                  href="tel:+15551234567"
                  className="text-muted-foreground hover:text-secondary transition-colors"
                >
                  +1 (555) 123-4567
                </a>
              </li>
              <li className="flex items-center">
                <div className="bg-background/40 backdrop-blur-sm p-3 rounded-full mr-4">
                  <i className="ri-map-pin-line text-secondary text-xl"></i>
                </div>
                <span className="text-muted-foreground">
                  San Francisco, CA
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-2xl font-space font-semibold mb-6">
              Connect With Me
            </h3>
            <div className="flex space-x-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-background/40 backdrop-blur-sm hover:bg-background/50 p-4 rounded-full text-muted-foreground hover:text-secondary transition-colors"
                aria-label="GitHub"
              >
                <i className="ri-github-fill text-xl"></i>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-background/40 backdrop-blur-sm hover:bg-background/50 p-4 rounded-full text-muted-foreground hover:text-secondary transition-colors"
                aria-label="LinkedIn"
              >
                <i className="ri-linkedin-box-fill text-xl"></i>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-background/40 backdrop-blur-sm hover:bg-background/50 p-4 rounded-full text-muted-foreground hover:text-secondary transition-colors"
                aria-label="Twitter"
              >
                <i className="ri-twitter-fill text-xl"></i>
              </a>
              <a
                href="https://codepen.io"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-background/40 backdrop-blur-sm hover:bg-background/50 p-4 rounded-full text-muted-foreground hover:text-secondary transition-colors"
                aria-label="CodePen"
              >
                <i className="ri-codepen-line text-xl"></i>
              </a>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-background/20 backdrop-blur-sm p-8 rounded-xl border border-border"
        >
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="name" className="block text-muted-foreground mb-2">
                Name
              </label>
              <input
                type="text"
                id="name"
                {...register("name")}
                className={`w-full p-3 bg-background/40 backdrop-blur-sm border ${
                  errors.name ? "border-destructive" : "border-border"
                } rounded-md text-foreground focus:border-secondary focus:outline-none transition-colors`}
                placeholder="Your name"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-muted-foreground mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                {...register("email")}
                className={`w-full p-3 bg-background/40 backdrop-blur-sm border ${
                  errors.email ? "border-destructive" : "border-border"
                } rounded-md text-foreground focus:border-secondary focus:outline-none transition-colors`}
                placeholder="Your email"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="subject" className="block text-muted-foreground mb-2">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                {...register("subject")}
                className={`w-full p-3 bg-background/40 backdrop-blur-sm border ${
                  errors.subject ? "border-destructive" : "border-border"
                } rounded-md text-foreground focus:border-secondary focus:outline-none transition-colors`}
                placeholder="Subject"
              />
              {errors.subject && (
                <p className="mt-1 text-xs text-destructive">{errors.subject.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="message" className="block text-muted-foreground mb-2">
                Message
              </label>
              <textarea
                id="message"
                {...register("message")}
                rows={5}
                className={`w-full p-3 bg-background/40 backdrop-blur-sm border ${
                  errors.message ? "border-destructive" : "border-border"
                } rounded-md text-foreground focus:border-secondary focus:outline-none transition-colors resize-none`}
                placeholder="Your message"
              ></textarea>
              {errors.message && (
                <p className="mt-1 text-xs text-destructive">{errors.message.message}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-medium rounded-md transition-colors flex items-center justify-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Sending...
                </span>
              ) : (
                <span className="flex items-center">
                  <i className="ri-send-plane-line mr-2"></i> Send Message
                </span>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default ContactPage;