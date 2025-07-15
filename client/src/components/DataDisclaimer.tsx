import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { trackEvent } from '@/lib/analytics';

const DATA_DISCLAIMER_KEY = 'data_disclaimer_acknowledged';

export default function DataDisclaimer() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user has already acknowledged the disclaimer
    const hasAcknowledged = localStorage.getItem(DATA_DISCLAIMER_KEY);
    if (!hasAcknowledged) {
      setIsOpen(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(DATA_DISCLAIMER_KEY, 'true');
    setIsOpen(false);
    trackEvent('data_disclaimer_acknowledged', {
      timestamp: new Date().toISOString()
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[500px] bg-white border-gray-200">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Data Collection Notice
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Information about how your data is used to improve this product
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <p className="text-gray-700 leading-relaxed">
            As a Product Manager, I'm always looking for ways to improve this product. While I don't know who you are and don't collect personal details, I do use product analytics (via PostHog) to see how the site is used, and I review chatbot conversations (via LangSmith) to enhance the experience.
          </p>
          
          <p className="text-gray-700 leading-relaxed">
            Additionally, when you use the contact form or interact with the chatbot, those messages are stored to help me respond and improve the service. Performance metrics and usage patterns are also collected to optimize the user experience.
          </p>
          
          <p className="text-gray-700 leading-relaxed">
            All data collected is used solely for product improvement. Your information is never sold or shared with third parties, and your privacy is important to me.
          </p>
          
          <p className="text-gray-700 leading-relaxed">
            By continuing to use this site, you acknowledge this data collection.
          </p>
          
          <p className="text-gray-600 text-sm mt-4 italic">
            -Nick
          </p>
        </div>
        
        <div className="flex justify-end">
          <Button 
            onClick={handleDismiss}
            className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Dismiss
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}