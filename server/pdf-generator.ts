import PDFDocument from 'pdfkit';
import { Response } from 'express';
import { ResumeJobType } from '../client/src/data/resume';

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
  res.setHeader('Content-Disposition', 'attachment; filename=resume.pdf');

  // Add styling and content to the PDF
  addDocumentStyling(doc, resumeData);

  // Finalize the PDF and end the stream
  doc.end();
};

// Function to add styling and content to the PDF
const addDocumentStyling = (doc: PDFKit.PDFDocument, resumeData: ResumeJobType[]) => {
  // Add document metadata
  doc.info.Title = 'Professional Resume';
  doc.info.Author = 'Nick Lanahan';

  // Define colors (matching the site's green theme)
  const primaryColor = '#22c55e'; // Green color similar to the website
  const textColor = '#1a1a1a';
  const mutedColor = '#6b7280';

  // Add header with name and title
  doc.fontSize(28)
     .fillColor(primaryColor)
     .font('Helvetica-Bold')
     .text('Nick Lanahan', { align: 'center' });

  doc.moveDown(0.5);
  
  doc.fontSize(14)
     .fillColor(mutedColor)
     .font('Helvetica')
     .text('Leader | Coach | Product Manager | Strategist', { align: 'center' });

  doc.moveDown(0.5);

  // Add contact information
  doc.fontSize(10)
     .text('Email: nick@example.com | Phone: (555) 123-4567 | LinkedIn: linkedin.com/in/nicklanahan', { 
       align: 'center'
     });

  doc.moveDown(1);

  // Add a horizontal line
  doc.strokeColor(primaryColor)
     .lineWidth(1)
     .moveTo(50, doc.y)
     .lineTo(doc.page.width - 50, doc.y)
     .stroke();

  doc.moveDown(1);

  // Add summary
  doc.fontSize(14)
     .fillColor(primaryColor)
     .font('Helvetica-Bold')
     .text('Professional Summary');

  doc.moveDown(0.5);

  doc.fontSize(10)
     .fillColor(textColor)
     .font('Helvetica')
     .text('With 8+ years of experience crafting digital experiences since 2015, I specialize in building impactful web applications. My journey began with a Computer Science degree from UC Berkeley, followed by roles at startups and tech companies. I create intuitive, accessible interfaces backed by robust architecture, combining technical excellence with empathetic design thinking.', {
       align: 'justify',
       lineGap: 5
     });

  doc.moveDown(1);

  // Add experience section
  doc.fontSize(14)
     .fillColor(primaryColor)
     .font('Helvetica-Bold')
     .text('Professional Experience');

  doc.moveDown(1);

  // Loop through resume data to add each job
  resumeData.forEach((job, index) => {
    // Add job title
    doc.fontSize(12)
       .fillColor(textColor)
       .font('Helvetica-Bold')
       .text(job.title);

    // Add company and period
    doc.fontSize(10)
       .fillColor(primaryColor)
       .font('Helvetica')
       .text(`${job.company} • ${job.period}`);

    doc.moveDown(0.5);

    // Add job description
    doc.fontSize(10)
       .fillColor(textColor)
       .font('Helvetica')
       .text(job.description, {
         align: 'justify',
         lineGap: 2
       });

    doc.moveDown(0.5);

    // Add skills
    doc.fontSize(10)
       .fillColor(mutedColor)
       .font('Helvetica-Oblique')
       .text(`Skills: ${job.skills.join(', ')}`, {
         align: 'left'
       });

    // Add space between jobs
    if (index < resumeData.length - 1) {
      doc.moveDown(1);
      
      // Add a light separator line between jobs
      doc.strokeColor(mutedColor)
         .opacity(0.5)
         .lineWidth(0.5)
         .moveTo(70, doc.y)
         .lineTo(doc.page.width - 70, doc.y)
         .stroke()
         .opacity(1);
         
      doc.moveDown(1);
    }
  });

  doc.moveDown(1);

  // Add skills section
  doc.fontSize(14)
     .fillColor(primaryColor)
     .font('Helvetica-Bold')
     .text('Technical Skills');

  doc.moveDown(0.5);

  // Front-end skills
  doc.fontSize(10)
     .fillColor(textColor)
     .font('Helvetica-Bold')
     .text('Front-End:');
  
  doc.fontSize(10)
     .fillColor(textColor)
     .font('Helvetica')
     .text('React & Next.js, TypeScript, Tailwind CSS, Framer Motion');

  doc.moveDown(0.5);

  // Back-end skills
  doc.fontSize(10)
     .fillColor(textColor)
     .font('Helvetica-Bold')
     .text('Back-End:');
  
  doc.fontSize(10)
     .fillColor(textColor)
     .font('Helvetica')
     .text('Node.js & Express, PostgreSQL & MongoDB, GraphQL, AWS & Firebase');

  doc.moveDown(1);

  // Add footer
  const date = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  doc.fontSize(8)
     .fillColor(mutedColor)
     .text(`Generated on ${date}`, 50, doc.page.height - 50, {
       align: 'center'
     });
};