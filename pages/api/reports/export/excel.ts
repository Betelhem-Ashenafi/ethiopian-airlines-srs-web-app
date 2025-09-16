import type { NextApiRequest, NextApiResponse } from 'next';

// Simple CSV fallback (Excel can open CSV). Replace with XLSX library if needed later.
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  try {
    const rows = [
      ['ReportID','Title','Status','Department','Severity','Timestamp'],
      ['SAMPLE-1','Sample Report','Open','IT Support','Low', new Date().toISOString()],
    ];
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const filename = 'reports.csv';
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.status(200).send(csv);
  } catch (e:any) {
    console.error(e);
    if (!res.headersSent) res.status(500).json({ error: 'Failed to export CSV' });
  }
}
