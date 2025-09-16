import type { NextApiRequest, NextApiResponse } from 'next';
import PDFDocument from 'pdfkit';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  try {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="reports.pdf"');
    const doc = new PDFDocument({ margin: 40 });
    doc.pipe(res);
    doc.fontSize(18).text('Reports Export', { underline: true });
    doc.moveDown();
    doc.fontSize(12).text('This is a placeholder PDF export. Integrate real data mapping later.');
    doc.end();
  } catch (e:any) {
    console.error(e);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to generate PDF' });
    }
  }
}
