import { useState } from "react";
import { motion } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { trackEvent } from "@/lib/analytics";

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
      // Track form submission attempt
      trackEvent('contact_form_submitted', {
        has_subject: !!data.subject.trim()
      });
      
      const response = await apiRequest("/api/contact", "POST", data);
      
      // Show feedback based on whether the email was sent successfully
      if (response && typeof response === 'object' && 'message' in response) {
        const message = response.message as string;
        
        if (message.includes("notification email sent")) {
          toast({
            title: "Message sent successfully!",
            description: "Thank you for your message. I'll get back to you soon.",
          });
          
          // Track successful form submission with email notification
          trackEvent('contact_form_success', { email_sent: true });
        } else {
          // Email was saved but not sent
          toast({
            title: "Message received!",
            description: "Your message was saved but there was an issue sending the email notification. I'll still review your message.",
            variant: "default",
          });
          
          // Track successful form submission without email notification
          trackEvent('contact_form_success', { email_sent: false });
        }
      } else {
        // Generic success message if we can't determine email status
        toast({
          title: "Message submitted!",
          description: "Thank you for your message. I'll review it soon.",
        });
        
        // Track generic success
        trackEvent('contact_form_success', { email_status: 'unknown' });
      }
      
      reset();
    } catch (error: any) {
      console.error("Contact form error:", error);
      toast({
        title: "Error sending message",
        description: error?.message || "Please try again later.",
        variant: "destructive",
      });
      
      // Track form submission error
      trackEvent('contact_form_error', { 
        error_message: error?.message || 'Unknown error'
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
        <h1 className="text-gray-900 mb-6" style={{ 
          fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif',
          fontWeight: '700',
          fontSize: 'clamp(32px, 5vw, 48px)',
          lineHeight: '1.2'
        }}>Get In Touch</h1>
        <p className="text-gray-600 max-w-3xl mx-auto mb-4" style={{ 
          fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif',
          fontSize: '17px',
          lineHeight: '1.5'
        }}>
          Have a project in mind or just want to connect? I'd love to hear from you.
        </p>
        <div className="text-center space-y-2">
          <p className="text-gray-700" style={{ 
            fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif',
            fontSize: '16px'
          }}>
            <a href="mailto:jnlanahan@gmail.com" className="hover:text-blue-600 transition-colors">
              jnlanahan@gmail.com
            </a>
          </p>
          <p className="text-gray-700" style={{ 
            fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif',
            fontSize: '16px'
          }}>
            <a href="tel:+16145551234" className="hover:text-blue-600 transition-colors">
              (614) 555-1234
            </a>
          </p>
        </div>
      </motion.div>

      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200"
        >
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="name" className="block text-gray-700 mb-2 font-medium" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                Name
              </label>
              <input
                type="text"
                id="name"
                {...register("name")}
                className={`w-full p-4 bg-gray-50 border ${
                  errors.name ? "border-red-500" : "border-gray-200"
                } rounded-lg text-gray-900 focus:border-blue-600 focus:outline-none transition-colors`}
                placeholder="Your name"
                style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-gray-700 mb-2 font-medium" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                Email
              </label>
              <input
                type="email"
                id="email"
                {...register("email")}
                className={`w-full p-4 bg-gray-50 border ${
                  errors.email ? "border-red-500" : "border-gray-200"
                } rounded-lg text-gray-900 focus:border-blue-600 focus:outline-none transition-colors`}
                placeholder="Your email"
                style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="subject" className="block text-gray-700 mb-2 font-medium" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                Subject
              </label>
              <input
                type="text"
                id="subject"
                {...register("subject")}
                className={`w-full p-4 bg-gray-50 border ${
                  errors.subject ? "border-red-500" : "border-gray-200"
                } rounded-lg text-gray-900 focus:border-blue-600 focus:outline-none transition-colors`}
                placeholder="Subject"
                style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}
              />
              {errors.subject && (
                <p className="mt-1 text-xs text-red-500">{errors.subject.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="message" className="block text-gray-700 mb-2 font-medium" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                Message
              </label>
              <textarea
                id="message"
                {...register("message")}
                rows={5}
                className={`w-full p-4 bg-gray-50 border ${
                  errors.message ? "border-red-500" : "border-gray-200"
                } rounded-lg text-gray-900 focus:border-blue-600 focus:outline-none transition-colors resize-none`}
                placeholder="Your message"
                style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}
              ></textarea>
              {errors.message && (
                <p className="mt-1 text-xs text-red-500">{errors.message.message}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center"
              disabled={isSubmitting}
              style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}
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