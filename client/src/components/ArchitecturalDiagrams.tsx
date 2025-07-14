import React from 'react';

export const SystemArchitectureDiagram = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-slate-200">
      <h3 className="text-xl font-semibold mb-4">Complete System Architecture</h3>
      <svg width="1000" height="800" viewBox="0 0 1000 800" className="w-full h-auto">
        {/* Background */}
        <rect width="1000" height="800" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" rx="8"/>
        
        {/* Infrastructure Layer */}
        <rect x="20" y="20" width="960" height="120" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1" rx="4"/>
        <text x="30" y="40" fontSize="16" fontWeight="bold" fill="#475569">Infrastructure Layer</text>
        
        {/* Replit Server */}
        <rect x="50" y="50" width="120" height="70" fill="#0ea5e9" stroke="#0284c7" strokeWidth="2" rx="8"/>
        <text x="110" y="80" fill="white" textAnchor="middle" fontSize="14" fontWeight="bold">Replit Server</text>
        <text x="110" y="100" fill="white" textAnchor="middle" fontSize="12">Node.js + Express</text>
        
        {/* Vite Dev Server */}
        <rect x="200" y="50" width="120" height="70" fill="#646cff" stroke="#535bf2" strokeWidth="2" rx="8"/>
        <text x="260" y="80" fill="white" textAnchor="middle" fontSize="14" fontWeight="bold">Vite Server</text>
        <text x="260" y="100" fill="white" textAnchor="middle" fontSize="12">React Frontend</text>
        
        {/* OpenAI API */}
        <rect x="350" y="50" width="120" height="70" fill="#10a37f" stroke="#0d9488" strokeWidth="2" rx="8"/>
        <text x="410" y="80" fill="white" textAnchor="middle" fontSize="14" fontWeight="bold">OpenAI API</text>
        <text x="410" y="100" fill="white" textAnchor="middle" fontSize="12">GPT-4 + Embeddings</text>
        
        {/* LangSmith Cloud */}
        <rect x="500" y="50" width="120" height="70" fill="#ef4444" stroke="#dc2626" strokeWidth="2" rx="8"/>
        <text x="560" y="80" fill="white" textAnchor="middle" fontSize="14" fontWeight="bold">LangSmith</text>
        <text x="560" y="100" fill="white" textAnchor="middle" fontSize="12">Cloud Service</text>
        
        {/* SendGrid */}
        <rect x="650" y="50" width="120" height="70" fill="#1976d2" stroke="#1565c0" strokeWidth="2" rx="8"/>
        <text x="710" y="80" fill="white" textAnchor="middle" fontSize="14" fontWeight="bold">SendGrid</text>
        <text x="710" y="100" fill="white" textAnchor="middle" fontSize="12">Email Service</text>
        
        {/* PostHog */}
        <rect x="800" y="50" width="120" height="70" fill="#ff6b35" stroke="#e55a2b" strokeWidth="2" rx="8"/>
        <text x="860" y="80" fill="white" textAnchor="middle" fontSize="14" fontWeight="bold">PostHog</text>
        <text x="860" y="100" fill="white" textAnchor="middle" fontSize="12">Analytics</text>
        
        {/* Application Layer */}
        <rect x="20" y="160" width="960" height="140" fill="#fef7f0" stroke="#fed7aa" strokeWidth="1" rx="4"/>
        <text x="30" y="180" fontSize="16" fontWeight="bold" fill="#ea580c">Application Layer</text>
        
        {/* React Frontend */}
        <rect x="50" y="190" width="120" height="90" fill="#61dafb" stroke="#0891b2" strokeWidth="2" rx="8"/>
        <text x="110" y="220" fill="white" textAnchor="middle" fontSize="14" fontWeight="bold">React Frontend</text>
        <text x="110" y="240" fill="white" textAnchor="middle" fontSize="12">TypeScript</text>
        <text x="110" y="255" fill="white" textAnchor="middle" fontSize="12">TailwindCSS</text>
        <text x="110" y="270" fill="white" textAnchor="middle" fontSize="12">Shadcn UI</text>
        
        {/* Floating Chatbot */}
        <rect x="200" y="190" width="120" height="90" fill="#10b981" stroke="#059669" strokeWidth="2" rx="8"/>
        <text x="260" y="220" fill="white" textAnchor="middle" fontSize="14" fontWeight="bold">Chatbot UI</text>
        <text x="260" y="240" fill="white" textAnchor="middle" fontSize="12">Floating Widget</text>
        <text x="260" y="255" fill="white" textAnchor="middle" fontSize="12">Real-time Chat</text>
        
        {/* Admin Dashboard */}
        <rect x="350" y="190" width="120" height="90" fill="#6366f1" stroke="#4338ca" strokeWidth="2" rx="8"/>
        <text x="410" y="220" fill="white" textAnchor="middle" fontSize="14" fontWeight="bold">Admin Panel</text>
        <text x="410" y="240" fill="white" textAnchor="middle" fontSize="12">Content Mgmt</text>
        <text x="410" y="255" fill="white" textAnchor="middle" fontSize="12">Analytics</text>
        
        {/* Portfolio Pages */}
        <rect x="500" y="190" width="120" height="90" fill="#8b5cf6" stroke="#7c3aed" strokeWidth="2" rx="8"/>
        <text x="560" y="220" fill="white" textAnchor="middle" fontSize="14" fontWeight="bold">Portfolio</text>
        <text x="560" y="240" fill="white" textAnchor="middle" fontSize="12">About/Projects</text>
        <text x="560" y="255" fill="white" textAnchor="middle" fontSize="12">Blog/Top5</text>
        
        {/* Contact System */}
        <rect x="650" y="190" width="120" height="90" fill="#f59e0b" stroke="#d97706" strokeWidth="2" rx="8"/>
        <text x="710" y="220" fill="white" textAnchor="middle" fontSize="14" fontWeight="bold">Contact Form</text>
        <text x="710" y="240" fill="white" textAnchor="middle" fontSize="12">Email Integration</text>
        <text x="710" y="255" fill="white" textAnchor="middle" fontSize="12">Resume Download</text>
        
        {/* Service Layer */}
        <rect x="20" y="320" width="960" height="140" fill="#f0f9ff" stroke="#bae6fd" strokeWidth="1" rx="4"/>
        <text x="30" y="340" fontSize="16" fontWeight="bold" fill="#0284c7">Service Layer</text>
        
        {/* Express Server */}
        <rect x="50" y="350" width="120" height="90" fill="#68a063" stroke="#4f7942" strokeWidth="2" rx="8"/>
        <text x="110" y="380" fill="white" textAnchor="middle" fontSize="14" fontWeight="bold">Express Server</text>
        <text x="110" y="400" fill="white" textAnchor="middle" fontSize="12">REST API</text>
        <text x="110" y="415" fill="white" textAnchor="middle" fontSize="12">Session Mgmt</text>
        <text x="110" y="430" fill="white" textAnchor="middle" fontSize="12">File Upload</text>
        
        {/* LangChain Service */}
        <rect x="200" y="350" width="120" height="90" fill="#8b5cf6" stroke="#7c3aed" strokeWidth="2" rx="8"/>
        <text x="260" y="380" fill="white" textAnchor="middle" fontSize="14" fontWeight="bold">LangChain RAG</text>
        <text x="260" y="400" fill="white" textAnchor="middle" fontSize="12">Document Search</text>
        <text x="260" y="415" fill="white" textAnchor="middle" fontSize="12">Response Gen</text>
        <text x="260" y="430" fill="white" textAnchor="middle" fontSize="12">LangSmith Log</text>
        
        {/* Chatbot Service */}
        <rect x="350" y="350" width="120" height="90" fill="#10b981" stroke="#059669" strokeWidth="2" rx="8"/>
        <text x="410" y="380" fill="white" textAnchor="middle" fontSize="14" fontWeight="bold">Chatbot Service</text>
        <text x="410" y="400" fill="white" textAnchor="middle" fontSize="12">AI Training</text>
        <text x="410" y="415" fill="white" textAnchor="middle" fontSize="12">Evaluation</text>
        <text x="410" y="430" fill="white" textAnchor="middle" fontSize="12">Feedback</text>
        
        {/* AI Polisher */}
        <rect x="500" y="350" width="120" height="90" fill="#f97316" stroke="#ea580c" strokeWidth="2" rx="8"/>
        <text x="560" y="380" fill="white" textAnchor="middle" fontSize="14" fontWeight="bold">AI Polisher</text>
        <text x="560" y="400" fill="white" textAnchor="middle" fontSize="12">Content Analysis</text>
        <text x="560" y="415" fill="white" textAnchor="middle" fontSize="12">Suggestions</text>
        <text x="560" y="430" fill="white" textAnchor="middle" fontSize="12">Anti-AI Detection</text>
        
        {/* Email Service */}
        <rect x="650" y="350" width="120" height="90" fill="#1976d2" stroke="#1565c0" strokeWidth="2" rx="8"/>
        <text x="710" y="380" fill="white" textAnchor="middle" fontSize="14" fontWeight="bold">Email Service</text>
        <text x="710" y="400" fill="white" textAnchor="middle" fontSize="12">Contact Forms</text>
        <text x="710" y="415" fill="white" textAnchor="middle" fontSize="12">Notifications</text>
        <text x="710" y="430" fill="white" textAnchor="middle" fontSize="12">SendGrid API</text>
        
        {/* Data Layer */}
        <rect x="20" y="480" width="960" height="140" fill="#fef3c7" stroke="#fbbf24" strokeWidth="1" rx="4"/>
        <text x="30" y="500" fontSize="16" fontWeight="bold" fill="#d97706">Data Layer</text>
        
        {/* PostgreSQL */}
        <rect x="50" y="510" width="120" height="90" fill="#336791" stroke="#2a5a7a" strokeWidth="2" rx="8"/>
        <text x="110" y="540" fill="white" textAnchor="middle" fontSize="14" fontWeight="bold">PostgreSQL</text>
        <text x="110" y="560" fill="white" textAnchor="middle" fontSize="12">User Data</text>
        <text x="110" y="575" fill="white" textAnchor="middle" fontSize="12">Conversations</text>
        <text x="110" y="590" fill="white" textAnchor="middle" fontSize="12">Content</text>
        
        {/* Chroma Database */}
        <rect x="200" y="510" width="120" height="90" fill="#f59e0b" stroke="#d97706" strokeWidth="2" rx="8"/>
        <text x="260" y="540" fill="white" textAnchor="middle" fontSize="14" fontWeight="bold">Chroma DB</text>
        <text x="260" y="560" fill="white" textAnchor="middle" fontSize="12">Vector Store</text>
        <text x="260" y="575" fill="white" textAnchor="middle" fontSize="12">Embeddings</text>
        <text x="260" y="590" fill="white" textAnchor="middle" fontSize="12">Document Search</text>
        
        {/* File Storage */}
        <rect x="350" y="510" width="120" height="90" fill="#6b7280" stroke="#4b5563" strokeWidth="2" rx="8"/>
        <text x="410" y="540" fill="white" textAnchor="middle" fontSize="14" fontWeight="bold">File Storage</text>
        <text x="410" y="560" fill="white" textAnchor="middle" fontSize="12">Uploads</text>
        <text x="410" y="575" fill="white" textAnchor="middle" fontSize="12">Images</text>
        <text x="410" y="590" fill="white" textAnchor="middle" fontSize="12">Documents</text>
        
        {/* Session Store */}
        <rect x="500" y="510" width="120" height="90" fill="#ec4899" stroke="#db2777" strokeWidth="2" rx="8"/>
        <text x="560" y="540" fill="white" textAnchor="middle" fontSize="14" fontWeight="bold">Session Store</text>
        <text x="560" y="560" fill="white" textAnchor="middle" fontSize="12">Memory Store</text>
        <text x="560" y="575" fill="white" textAnchor="middle" fontSize="12">Admin Auth</text>
        <text x="560" y="590" fill="white" textAnchor="middle" fontSize="12">Chat State</text>
        
        {/* External Services */}
        <rect x="20" y="640" width="960" height="140" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="1" rx="4"/>
        <text x="30" y="660" fontSize="16" fontWeight="bold" fill="#4b5563">External Services</text>
        
        {/* OpenAI */}
        <rect x="50" y="670" width="120" height="90" fill="#10a37f" stroke="#0d9488" strokeWidth="2" rx="8"/>
        <text x="110" y="700" fill="white" textAnchor="middle" fontSize="14" fontWeight="bold">OpenAI</text>
        <text x="110" y="720" fill="white" textAnchor="middle" fontSize="12">GPT-4o</text>
        <text x="110" y="735" fill="white" textAnchor="middle" fontSize="12">Embeddings</text>
        <text x="110" y="750" fill="white" textAnchor="middle" fontSize="12">API Calls</text>
        
        {/* LangSmith */}
        <rect x="200" y="670" width="120" height="90" fill="#ef4444" stroke="#dc2626" strokeWidth="2" rx="8"/>
        <text x="260" y="700" fill="white" textAnchor="middle" fontSize="14" fontWeight="bold">LangSmith</text>
        <text x="260" y="720" fill="white" textAnchor="middle" fontSize="12">Tracing</text>
        <text x="260" y="735" fill="white" textAnchor="middle" fontSize="12">Evaluation</text>
        <text x="260" y="750" fill="white" textAnchor="middle" fontSize="12">Monitoring</text>
        
        {/* SendGrid */}
        <rect x="350" y="670" width="120" height="90" fill="#1976d2" stroke="#1565c0" strokeWidth="2" rx="8"/>
        <text x="410" y="700" fill="white" textAnchor="middle" fontSize="14" fontWeight="bold">SendGrid</text>
        <text x="410" y="720" fill="white" textAnchor="middle" fontSize="12">Email Delivery</text>
        <text x="410" y="735" fill="white" textAnchor="middle" fontSize="12">SMTP</text>
        <text x="410" y="750" fill="white" textAnchor="middle" fontSize="12">Templates</text>
        
        {/* PostHog */}
        <rect x="500" y="670" width="120" height="90" fill="#ff6b35" stroke="#e55a2b" strokeWidth="2" rx="8"/>
        <text x="560" y="700" fill="white" textAnchor="middle" fontSize="14" fontWeight="bold">PostHog</text>
        <text x="560" y="720" fill="white" textAnchor="middle" fontSize="12">User Analytics</text>
        <text x="560" y="735" fill="white" textAnchor="middle" fontSize="12">Event Tracking</text>
        <text x="560" y="750" fill="white" textAnchor="middle" fontSize="12">Dashboards</text>
        
        {/* Key Connections */}
        <path d="M110 120 L110 190" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead)"/>
        <path d="M260 120 L260 190" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead)"/>
        <path d="M110 280 L110 350" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead)"/>
        <path d="M260 280 L260 350" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead)"/>
        <path d="M110 440 L110 510" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead)"/>
        <path d="M260 440 L260 510" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead)"/>
        <path d="M410 440 L410 510" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead)"/>
        <path d="M110 600 L110 670" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead)"/>
        <path d="M260 600 L260 670" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead)"/>
        <path d="M410 600 L410 670" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead)"/>
        <path d="M560 600 L560 670" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead)"/>
        
        {/* Arrow marker definition */}
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#374151"/>
          </marker>
        </defs>
      </svg>
    </div>
  );
};

export const DataFlowDiagram = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-slate-200">
      <h3 className="text-xl font-semibold mb-4">Data Flow Process</h3>
      <svg width="800" height="500" viewBox="0 0 800 500" className="w-full h-auto">
        <rect width="800" height="500" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" rx="8"/>
        
        {/* Step 1: Question */}
        <circle cx="100" cy="80" r="30" fill="#3b82f6" stroke="#1e40af" strokeWidth="2"/>
        <text x="100" y="85" fill="white" textAnchor="middle" fontSize="14" fontWeight="bold">1</text>
        <text x="100" y="130" textAnchor="middle" fontSize="12">Question Asked</text>
        
        {/* Step 2: Chroma Search */}
        <circle cx="300" cy="80" r="30" fill="#f59e0b" stroke="#d97706" strokeWidth="2"/>
        <text x="300" y="85" fill="white" textAnchor="middle" fontSize="14" fontWeight="bold">2</text>
        <text x="300" y="130" textAnchor="middle" fontSize="12">Search Chroma DB</text>
        
        {/* Step 3: Document Retrieval */}
        <circle cx="500" cy="80" r="30" fill="#10b981" stroke="#059669" strokeWidth="2"/>
        <text x="500" y="85" fill="white" textAnchor="middle" fontSize="14" fontWeight="bold">3</text>
        <text x="500" y="130" textAnchor="middle" fontSize="12">Retrieve Snippets</text>
        
        {/* Step 4: AI Response */}
        <circle cx="700" cy="80" r="30" fill="#8b5cf6" stroke="#7c3aed" strokeWidth="2"/>
        <text x="700" y="85" fill="white" textAnchor="middle" fontSize="14" fontWeight="bold">4</text>
        <text x="700" y="130" textAnchor="middle" fontSize="12">Generate Response</text>
        
        {/* Step 5: Store Conversation */}
        <circle cx="300" cy="250" r="30" fill="#6b7280" stroke="#4b5563" strokeWidth="2"/>
        <text x="300" y="255" fill="white" textAnchor="middle" fontSize="14" fontWeight="bold">5</text>
        <text x="300" y="300" textAnchor="middle" fontSize="12">Store in PostgreSQL</text>
        
        {/* Step 6: Log to LangSmith */}
        <circle cx="500" cy="250" r="30" fill="#ef4444" stroke="#dc2626" strokeWidth="2"/>
        <text x="500" y="255" fill="white" textAnchor="middle" fontSize="14" fontWeight="bold">6</text>
        <text x="500" y="300" textAnchor="middle" fontSize="12">Log to LangSmith</text>
        
        {/* Step 7: Evaluate */}
        <circle cx="700" cy="250" r="30" fill="#f97316" stroke="#ea580c" strokeWidth="2"/>
        <text x="700" y="255" fill="white" textAnchor="middle" fontSize="14" fontWeight="bold">7</text>
        <text x="700" y="300" textAnchor="middle" fontSize="12">AI Evaluation</text>
        
        {/* Step 8: Training Feedback */}
        <circle cx="100" cy="400" r="30" fill="#ec4899" stroke="#db2777" strokeWidth="2"/>
        <text x="100" y="405" fill="white" textAnchor="middle" fontSize="14" fontWeight="bold">8</text>
        <text x="100" y="450" textAnchor="middle" fontSize="12">Training Questions</text>
        
        {/* Arrows */}
        <path d="M130 80 L270 80" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead2)"/>
        <path d="M330 80 L470 80" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead2)"/>
        <path d="M530 80 L670 80" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead2)"/>
        <path d="M680 110 L320 220" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead2)"/>
        <path d="M500 110 L500 220" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead2)"/>
        <path d="M530 250 L670 250" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead2)"/>
        <path d="M130 400 L270 390" stroke="#ec4899" strokeWidth="2" strokeDasharray="5,5" markerEnd="url(#arrowhead2)"/>
        
        {/* Data boxes */}
        <rect x="200" y="160" width="200" height="40" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1" rx="4"/>
        <text x="300" y="185" textAnchor="middle" fontSize="12">Document Snippets + Context</text>
        
        <rect x="600" y="160" width="200" height="40" fill="#dcfce7" stroke="#10b981" strokeWidth="1" rx="4"/>
        <text x="700" y="185" textAnchor="middle" fontSize="12">Question + Response + Context</text>
        
        <rect x="600" y="330" width="200" height="40" fill="#fef2f2" stroke="#ef4444" strokeWidth="1" rx="4"/>
        <text x="700" y="355" textAnchor="middle" fontSize="12">Evaluation Metrics</text>
        
        <defs>
          <marker id="arrowhead2" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#374151"/>
          </marker>
        </defs>
      </svg>
    </div>
  );
};

export const TrainingFlowDiagram = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-slate-200">
      <h3 className="text-xl font-semibold mb-4">AI Training System Flow (100+ Questions)</h3>
      <svg width="900" height="600" viewBox="0 0 900 600" className="w-full h-auto">
        <rect width="900" height="600" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" rx="8"/>
        
        {/* Phase 1: Question Generation */}
        <rect x="20" y="20" width="860" height="120" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1" rx="4"/>
        <text x="30" y="40" fontSize="16" fontWeight="bold" fill="#d97706">Phase 1: AI Question Generation</text>
        
        {/* AI Training Engine */}
        <rect x="50" y="50" width="140" height="70" fill="#f97316" stroke="#ea580c" strokeWidth="2" rx="8"/>
        <text x="120" y="80" fill="white" textAnchor="middle" fontSize="14" fontWeight="bold">AI Training</text>
        <text x="120" y="100" fill="white" textAnchor="middle" fontSize="12">Engine</text>
        
        {/* Document Analysis */}
        <rect x="220" y="50" width="140" height="70" fill="#8b5cf6" stroke="#7c3aed" strokeWidth="2" rx="8"/>
        <text x="290" y="80" fill="white" textAnchor="middle" fontSize="14" fontWeight="bold">Analyze</text>
        <text x="290" y="100" fill="white" textAnchor="middle" fontSize="12">Your Documents</text>
        
        {/* Question Generator */}
        <rect x="390" y="50" width="140" height="70" fill="#10b981" stroke="#059669" strokeWidth="2" rx="8"/>
        <text x="460" y="80" fill="white" textAnchor="middle" fontSize="14" fontWeight="bold">Generate</text>
        <text x="460" y="100" fill="white" textAnchor="middle" fontSize="12">100+ Questions</text>
        
        {/* Admin Review */}
        <rect x="560" y="50" width="140" height="70" fill="#6366f1" stroke="#4338ca" strokeWidth="2" rx="8"/>
        <text x="630" y="80" fill="white" textAnchor="middle" fontSize="14" fontWeight="bold">Admin Review</text>
        <text x="630" y="100" fill="white" textAnchor="middle" fontSize="12">& Approval</text>
        
        {/* Question Bank */}
        <rect x="730" y="50" width="140" height="70" fill="#ef4444" stroke="#dc2626" strokeWidth="2" rx="8"/>
        <text x="800" y="80" fill="white" textAnchor="middle" fontSize="14" fontWeight="bold">Question Bank</text>
        <text x="800" y="100" fill="white" textAnchor="middle" fontSize="12">Approved Queue</text>
        
        {/* Phase 2: Training Execution */}
        <rect x="20" y="160" width="860" height="120" fill="#f0f9ff" stroke="#0284c7" strokeWidth="1" rx="4"/>
        <text x="30" y="180" fontSize="16" fontWeight="bold" fill="#0284c7">Phase 2: Training Execution</text>
        
        {/* Training Scheduler */}
        <rect x="50" y="190" width="140" height="70" fill="#0ea5e9" stroke="#0284c7" strokeWidth="2" rx="8"/>
        <text x="120" y="220" fill="white" textAnchor="middle" fontSize="14" fontWeight="bold">Training</text>
        <text x="120" y="240" fill="white" textAnchor="middle" fontSize="12">Scheduler</text>
        
        {/* Chatbot Response */}
        <rect x="220" y="190" width="140" height="70" fill="#10b981" stroke="#059669" strokeWidth="2" rx="8"/>
        <text x="290" y="220" fill="white" textAnchor="middle" fontSize="14" fontWeight="bold">Chatbot</text>
        <text x="290" y="240" fill="white" textAnchor="middle" fontSize="12">Answers</text>
        
        {/* Chroma Search */}
        <rect x="390" y="190" width="140" height="70" fill="#f59e0b" stroke="#d97706" strokeWidth="2" rx="8"/>
        <text x="460" y="220" fill="white" textAnchor="middle" fontSize="14" fontWeight="bold">Chroma DB</text>
        <text x="460" y="240" fill="white" textAnchor="middle" fontSize="12">Search</text>
        
        {/* Response Generation */}
        <rect x="560" y="190" width="140" height="70" fill="#8b5cf6" stroke="#7c3aed" strokeWidth="2" rx="8"/>
        <text x="630" y="220" fill="white" textAnchor="middle" fontSize="14" fontWeight="bold">AI Response</text>
        <text x="630" y="240" fill="white" textAnchor="middle" fontSize="12">Generation</text>
        
        {/* Store Q&A */}
        <rect x="730" y="190" width="140" height="70" fill="#6b7280" stroke="#4b5563" strokeWidth="2" rx="8"/>
        <text x="800" y="220" fill="white" textAnchor="middle" fontSize="14" fontWeight="bold">Store Q&A</text>
        <text x="800" y="240" fill="white" textAnchor="middle" fontSize="12">PostgreSQL</text>
        
        {/* Phase 3: Evaluation & Integration */}
        <rect x="20" y="300" width="860" height="120" fill="#fef2f2" stroke="#dc2626" strokeWidth="1" rx="4"/>
        <text x="30" y="320" fontSize="16" fontWeight="bold" fill="#dc2626">Phase 3: Evaluation & Integration</text>
        
        {/* LangSmith Evaluation */}
        <rect x="50" y="330" width="140" height="70" fill="#ef4444" stroke="#dc2626" strokeWidth="2" rx="8"/>
        <text x="120" y="360" fill="white" textAnchor="middle" fontSize="14" fontWeight="bold">LangSmith</text>
        <text x="120" y="380" fill="white" textAnchor="middle" fontSize="12">Evaluation</text>
        
        {/* Quality Check */}
        <rect x="220" y="330" width="140" height="70" fill="#f97316" stroke="#ea580c" strokeWidth="2" rx="8"/>
        <text x="290" y="360" fill="white" textAnchor="middle" fontSize="14" fontWeight="bold">Quality</text>
        <text x="290" y="380" fill="white" textAnchor="middle" fontSize="12">Assessment</text>
        
        {/* Update Chroma */}
        <rect x="390" y="330" width="140" height="70" fill="#f59e0b" stroke="#d97706" strokeWidth="2" rx="8"/>
        <text x="460" y="360" fill="white" textAnchor="middle" fontSize="14" fontWeight="bold">Update</text>
        <text x="460" y="380" fill="white" textAnchor="middle" fontSize="12">Chroma DB</text>
        
        {/* Performance Metrics */}
        <rect x="560" y="330" width="140" height="70" fill="#8b5cf6" stroke="#7c3aed" strokeWidth="2" rx="8"/>
        <text x="630" y="360" fill="white" textAnchor="middle" fontSize="14" fontWeight="bold">Performance</text>
        <text x="630" y="380" fill="white" textAnchor="middle" fontSize="12">Metrics</text>
        
        {/* Improvement Loop */}
        <rect x="730" y="330" width="140" height="70" fill="#ec4899" stroke="#db2777" strokeWidth="2" rx="8"/>
        <text x="800" y="360" fill="white" textAnchor="middle" fontSize="14" fontWeight="bold">Continuous</text>
        <text x="800" y="380" fill="white" textAnchor="middle" fontSize="12">Improvement</text>
        
        {/* Phase 4: Results */}
        <rect x="20" y="440" width="860" height="120" fill="#f0fdf4" stroke="#16a34a" strokeWidth="1" rx="4"/>
        <text x="30" y="460" fontSize="16" fontWeight="bold" fill="#16a34a">Phase 4: Results & Benefits</text>
        
        {/* Enhanced Chroma DB */}
        <rect x="150" y="470" width="140" height="70" fill="#16a34a" stroke="#15803d" strokeWidth="2" rx="8"/>
        <text x="220" y="500" fill="white" textAnchor="middle" fontSize="14" fontWeight="bold">Enhanced</text>
        <text x="220" y="520" fill="white" textAnchor="middle" fontSize="12">Chroma DB</text>
        
        {/* Better Responses */}
        <rect x="320" y="470" width="140" height="70" fill="#0ea5e9" stroke="#0284c7" strokeWidth="2" rx="8"/>
        <text x="390" y="500" fill="white" textAnchor="middle" fontSize="14" fontWeight="bold">Better</text>
        <text x="390" y="520" fill="white" textAnchor="middle" fontSize="12">Responses</text>
        
        {/* Comprehensive Training */}
        <rect x="490" y="470" width="140" height="70" fill="#8b5cf6" stroke="#7c3aed" strokeWidth="2" rx="8"/>
        <text x="560" y="500" fill="white" textAnchor="middle" fontSize="14" fontWeight="bold">Complete</text>
        <text x="560" y="520" fill="white" textAnchor="middle" fontSize="12">Training Data</text>
        
        {/* Horizontal Arrows */}
        <path d="M190 85 L220 85" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead3)"/>
        <path d="M360 85 L390 85" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead3)"/>
        <path d="M530 85 L560 85" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead3)"/>
        <path d="M700 85 L730 85" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead3)"/>
        
        <path d="M190 225 L220 225" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead3)"/>
        <path d="M360 225 L390 225" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead3)"/>
        <path d="M530 225 L560 225" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead3)"/>
        <path d="M700 225 L730 225" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead3)"/>
        
        <path d="M190 365 L220 365" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead3)"/>
        <path d="M360 365 L390 365" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead3)"/>
        <path d="M530 365 L560 365" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead3)"/>
        <path d="M700 365 L730 365" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead3)"/>
        
        {/* Vertical Arrows */}
        <path d="M800 120 L120 190" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead3)"/>
        <path d="M800 260 L120 330" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead3)"/>
        <path d="M460 400 L220 470" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead3)"/>
        <path d="M460 400 L390 470" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead3)"/>
        <path d="M460 400 L560 470" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead3)"/>
        
        {/* Feedback Loop */}
        <path d="M800 540 L800 580 L50 580 L50 400" stroke="#ec4899" strokeWidth="3" strokeDasharray="8,4" markerEnd="url(#arrowhead3)"/>
        <text x="425" y="575" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#ec4899">Continuous Learning Cycle</text>
        
        <defs>
          <marker id="arrowhead3" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#374151"/>
          </marker>
        </defs>
      </svg>
    </div>
  );
};