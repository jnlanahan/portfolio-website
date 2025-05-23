import PDFDocument from 'pdfkit';
import { Response } from 'express';
import { ResumeJobType } from '../client/src/data/resume';
import path from 'path';
import fs from 'fs';

// Function to generate a PDF resume
export const generateResumePDF = async (res: Response, resumeData: ResumeJobType[]) => {
  // Create a new PDF document
  const doc = new PDFDocument({
    margin: 50,
    size: 'A4'
  });

  // Pipe the PDF document to the response
  doc.pipe(res);

  // Set the response headers
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=nick-lanahan-cv.pdf');

  // Add styling and content to the PDF
  generateProfessionalResume(doc);

  // Finalize the PDF and end the stream
  doc.end();
};

// Function to generate a professional resume
const generateProfessionalResume = (doc: PDFKit.PDFDocument) => {
  // Add document metadata
  doc.info.Title = 'Nick Lanahan - Professional Resume';
  doc.info.Author = 'Nick Lanahan';
  doc.info.Subject = 'Resume/CV';
  doc.info.Keywords = 'resume, cv, professional, leadership, product management';

  // Define colors
  const primaryColor = '#22c55e'; // Green theme color
  const accentColor = '#0e7638'; // Darker green for contrast
  const textColor = '#1a1a1a';
  const mutedColor = '#6b7280';
  const lightBackground = '#f8fafc';

  // HEADER SECTION
  // --------------
  doc.rect(0, 0, doc.page.width, 120)
     .fill(lightBackground);
  
  doc.fontSize(32)
     .fillColor(accentColor)
     .font('Helvetica-Bold')
     .text('NICK LANAHAN', 50, 50);

  doc.fontSize(15)
     .fillColor(mutedColor)
     .font('Helvetica')
     .text('Leadership & Product Strategy', 50, 85);

  // Right-aligned contact info
  const contactY = 50;
  const contactX = 350;
  
  doc.fontSize(10)
     .fillColor(textColor)
     .font('Helvetica')
     .text('nick@example.com', contactX, contactY)
     .text('(555) 123-4567', contactX, contactY + 15)
     .text('linkedin.com/in/nicklanahan', contactX, contactY + 30)
     .text('San Francisco, CA', contactX, contactY + 45);

  // Green line under header
  doc.moveDown(3);
  doc.strokeColor(primaryColor)
     .lineWidth(3)
     .moveTo(50, 130)
     .lineTo(doc.page.width - 50, 130)
     .stroke();

  // PROFESSIONAL SUMMARY
  // -------------------
  doc.moveDown(1);
  addSectionHeading(doc, 'PROFESSIONAL SUMMARY', primaryColor);

  doc.fontSize(11)
     .fillColor(textColor)
     .font('Helvetica')
     .text('Transformative leader with 15+ years of experience building high-performance teams and driving product innovation. Passionate about creating user-centered solutions that deliver measurable business impact. Proven track record of coaching teams to achieve exceptional results through strategic vision, clear communication, and a focus on professional growth.', {
       align: 'justify',
       width: doc.page.width - 100,
       lineGap: 5
     });

  // PROFESSIONAL EXPERIENCE
  // ----------------------
  doc.moveDown(1.5);
  addSectionHeading(doc, 'PROFESSIONAL EXPERIENCE', primaryColor);
  doc.moveDown(0.5);

  // Job 1
  addJobEntry(doc, {
    title: 'Senior Director of Product Management',
    company: 'Innovatech Solutions',
    location: 'San Francisco, CA',
    period: '2018 - Present',
    responsibilities: [
      'Lead a team of 12 product managers overseeing $85M in annual revenue across the enterprise product suite',
      'Implemented product discovery process that increased feature adoption by 47% and reduced development cycles by 32%',
      'Established OKR framework aligning 100+ engineering resources with strategic business goals',
      'Mentored 15+ product managers, with 5 advancing to senior leadership positions'
    ],
    textColor,
    primaryColor,
    mutedColor
  });

  // Job 2
  addJobEntry(doc, {
    title: 'Head of Product Strategy',
    company: 'TechForward',
    location: 'Austin, TX',
    period: '2015 - 2018',
    responsibilities: [
      'Led product strategy resulting in 124% revenue growth over three years',
      'Directed cross-functional teams to develop and launch 5 new product lines',
      'Established customer feedback loop that improved NPS from 32 to 68',
      'Created strategic roadmap that secured $12M in Series B funding'
    ],
    textColor,
    primaryColor,
    mutedColor
  });

  // Job 3
  addJobEntry(doc, {
    title: 'Product Manager',
    company: 'Future Systems Inc.',
    location: 'Seattle, WA',
    period: '2012 - 2015',
    responsibilities: [
      'Managed full product lifecycle for company\'s flagship analytics platform',
      'Led initiative to restructure pricing model, increasing LTV by 43%',
      'Collaborated with UX team to redesign dashboard, resulting in 27% higher user engagement',
      'Introduced agile methodologies that improved delivery reliability by 58%'
    ],
    textColor,
    primaryColor,
    mutedColor
  });

  // EDUCATION & CERTIFICATIONS
  // -------------------------
  doc.moveDown(1.5);
  addSectionHeading(doc, 'EDUCATION & CERTIFICATIONS', primaryColor);
  doc.moveDown(0.5);

  // Education
  doc.fontSize(12)
     .fillColor(textColor)
     .font('Helvetica-Bold')
     .text('MBA, Technology Management');

  doc.fontSize(11)
     .fillColor(primaryColor)
     .font('Helvetica')
     .text('Stanford Graduate School of Business • 2010');
  
  doc.moveDown(0.5);

  doc.fontSize(12)
     .fillColor(textColor)
     .font('Helvetica-Bold')
     .text('B.S. Computer Science');

  doc.fontSize(11)
     .fillColor(primaryColor)
     .font('Helvetica')
     .text('UC Berkeley • 2006');

  doc.moveDown(0.5);

  // Certifications
  doc.fontSize(11)
     .fillColor(textColor)
     .font('Helvetica')
     .text('• Certified Product Manager (CPM)', {continued: true})
     .text('  •  Certified Scrum Product Owner (CSPO)', {continued: true})
     .text('  •  Leadership Coaching Certification');

  // SKILLS
  // ------
  doc.moveDown(1.5);
  addSectionHeading(doc, 'PROFESSIONAL SKILLS', primaryColor);
  doc.moveDown(0.5);

  // Skills columns
  const skillsCol1 = [
    'Strategic Leadership',
    'Product Vision & Strategy',
    'Team Building & Development',
    'Business Model Innovation',
    'Executive Communication'
  ];

  const skillsCol2 = [
    'Market & Competitive Analysis',
    'Revenue & Growth Modeling',
    'Product-Led Growth Strategies',
    'Cross-Functional Leadership',
    'Agile/Lean Methodologies'
  ];

  const colWidth = (doc.page.width - 150) / 2;
  let y = doc.y;

  // First column
  doc.fontSize(11)
     .fillColor(textColor)
     .font('Helvetica');
  
  skillsCol1.forEach(skill => {
    doc.text(`• ${skill}`, 50, y);
    y += 20;
  });

  // Reset y position
  y = doc.y - (skillsCol1.length * 20);

  // Second column
  skillsCol2.forEach(skill => {
    doc.text(`• ${skill}`, 50 + colWidth, y);
    y += 20;
  });

  // Footer
  const date = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  doc.fontSize(8)
     .fillColor(mutedColor)
     .text(`Generated on ${date}`, 50, doc.page.height - 50, {
       align: 'center',
       width: doc.page.width - 100
     });
};

// Helper function to add a section heading
const addSectionHeading = (doc: PDFKit.PDFDocument, title: string, color: string) => {
  doc.fontSize(14)
     .fillColor(color)
     .font('Helvetica-Bold')
     .text(title);
};

// Helper function to add a job entry
const addJobEntry = (
  doc: PDFKit.PDFDocument, 
  {
    title,
    company,
    location,
    period,
    responsibilities,
    textColor,
    primaryColor,
    mutedColor
  }: {
    title: string;
    company: string;
    location: string;
    period: string;
    responsibilities: string[];
    textColor: string;
    primaryColor: string;
    mutedColor: string;
  }
) => {
  doc.fontSize(12)
     .fillColor(textColor)
     .font('Helvetica-Bold')
     .text(title);

  doc.fontSize(11)
     .fillColor(primaryColor)
     .font('Helvetica')
     .text(`${company} • ${location} • ${period}`);

  doc.moveDown(0.5);

  // Responsibilities as bullet points
  doc.fontSize(10)
     .fillColor(textColor)
     .font('Helvetica');
     
  responsibilities.forEach(responsibility => {
    doc.text(`• ${responsibility}`, {
      indent: 10,
      lineGap: 2,
      width: doc.page.width - 120,
      align: 'left'
    });
    doc.moveDown(0.2);
  });

  doc.moveDown(0.5);
};