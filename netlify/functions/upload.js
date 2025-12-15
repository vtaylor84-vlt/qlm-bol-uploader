import { google } from 'googleapis';
import busboy from 'busboy';

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: 'driver-app-writer@gen-lang-client-0748484610.iam.gserviceaccount.com',
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/spreadsheets'],
});

const drive = google.drive({ version: 'v3', auth });
const sheets = google.sheets({ version: 'v4', auth });

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { fields, files } = await parseMultipart(req);
    const company = fields.company;
    const loadId = fields.loadId || `NOID-${Date.now()}`;

    const parentId = company.includes('BST') ? '1bZpcJcgUAyFxQZ2H5iMhN-LuNljQDd2d' : '1wpW0-UY7QvDI8g080Pu9DSt44vy4wtNr';

    const folder = await drive.files.create({
      resource: { name: `Load ${loadId} - ${company}`, mimeType: 'application/vnd.google-apps.folder', parents: [parentId] },
      fields: 'id'
    });

    const uploaded = [];
    let idx = 0;
    for (const file of files) {
      const name = `${++idx}_${file.filename.replace(/[^a-z0-9.]/gi, '_')}`;
      await drive.files.create({
        resource: { name, parents: [folder.data.id] },
        media: { mimeType: file.mimeType, body: file.data }
      });
      uploaded.push(name);
    }

    await sheets.spreadsheets.values.append({
      spreadsheetId: '1QHw1tFqvx_vRz0biAkqRdOriA3zVpDzF3MHI6RqllPg',
      range: 'A:E',
      valueInputOption: 'USER_ENTERED',
      resource: { values: [[new Date().toISOString(), company, loadId, uploaded.join(', '), `https://drive.google.com/drive/folders/${folder.data.id}`]] }
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
}

function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const bb = busboy({ headers: req.headers });
    const fields = {}, files = [];
    bb.on('file', (n, f, i) => {
      const chunks = [];
      f.on('data', d => chunks.push(d)).on('end', () => files.push({ name: n, filename: i.filename, mimeType: i.mimeType, data: Buffer.concat(chunks) }));
    });
    bb.on('field', (n, v) => fields[n] = v);
    bb.on('close', () => resolve({ fields, files }));
    bb.on('error', reject);
    req.pipe(bb);
  });
}

export const config = { api: { bodyParser: false } };