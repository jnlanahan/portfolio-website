const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-8 bg-white border-t border-gray-200">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center">
          <p className="text-gray-600 text-sm" style={{ 
            fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif',
            fontSize: '14px'
          }}>
            © {currentYear} Nick Lanahan. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
