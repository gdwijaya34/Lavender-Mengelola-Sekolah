import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

const CONFIG_FILE = path.join(__dirname, 'shared_sheets_config.json');

const DEFAULT_CONFIG = {
  spreadsheet_id_akademik: '13ohWc_DhrKXXogQnK2JWwxQfGYwo0KVV5gu20cfAt68',
  spreadsheet_id_keuangan: '17vf-FEBzvboyiESP7QFKvP7dIUwT6XiChCOIQuuOJm0',
  webhook_url_akademik: '',
  webhook_url_keuangan: '',
  auto_sync_interval_mins: 1,
  auto_sync_enabled: true,
  last_sync_akademik: 'Hari ini',
  last_sync_keuangan: 'Hari ini',
  sync_status: 'terhubung'
};

function readConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
      return { ...DEFAULT_CONFIG, ...JSON.parse(data) };
    }
  } catch (err) {
    console.error('Error reading shared_sheets_config.json:', err);
  }
  return DEFAULT_CONFIG;
}

function writeConfig(cfg: any) {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing shared_sheets_config.json:', err);
    return false;
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '15mb' }));

  // API Route: Get permanent shared sheets config
  app.get('/api/sheets-config', (_req, res) => {
    res.json(readConfig());
  });

  // API Route: Save permanent shared sheets config across all devices & accounts
  app.post('/api/sheets-config', (req, res) => {
    const current = readConfig();
    const updated = { ...current, ...req.body };
    writeConfig(updated);
    res.json({ success: true, config: updated });
  });

  // API Route: Server-side proxy for Google Apps Script Webhook (prevents CORS and browser restrictions)
  app.post('/api/sheets-sync', async (req, res) => {
    const { type, payload } = req.body;
    const config = readConfig();
    const webhookUrl = type === 'akademik' ? config.webhook_url_akademik : config.webhook_url_keuangan;

    if (!webhookUrl) {
      return res.status(400).json({ success: false, message: `URL Webhook ${type} belum dikonfigurasi di server.` });
    }

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(payload),
        redirect: 'follow'
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = { success: response.ok, raw: text };
      }

      res.json({ success: true, data });
    } catch (err: any) {
      console.error('Server webhook sync error:', err);
      res.status(500).json({ success: false, message: err.message || 'Gagal menghubungi Webhook Apps Script' });
    }
  });

  // API Route: Import data from Google Sheet (via Webhook or Google Sheets export API)
  app.post('/api/sheets-import', async (req, res) => {
    const { source, type, spreadsheetId, sheetName } = req.body;
    const config = readConfig();

    // 1. Fetch via configured Webhook (Fastest & full table structure)
    if (source === 'webhook' || (!source && type)) {
      const webhookUrl = type === 'akademik' ? config.webhook_url_akademik : config.webhook_url_keuangan;
      if (!webhookUrl) {
        return res.status(400).json({
          success: false,
          message: `Webhook ${type} belum dipasang. Harap pasang URL Webhook terlebih dahulu di menu Integrasi Google Sheets, atau gunakan opsi URL Google Sheet Publik.`
        });
      }

      try {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'export_all' }),
          redirect: 'follow'
        });

        const text = await response.text();
        const data = JSON.parse(text);
        if (data.tables) {
          return res.json({
            success: true,
            tables: data.tables,
            spreadsheetName: data.spreadsheetName || (type === 'akademik' ? 'Database Akademik' : 'Database Keuangan')
          });
        }
        return res.status(400).json({ success: false, message: data.message || 'Webhook tidak mengembalikan data tabel.' });
      } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message || 'Gagal mengambil data dari Webhook.' });
      }
    }

    // 2. Fetch directly via Google Sheets CSV / Viz API
    if (spreadsheetId && sheetName) {
      try {
        const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
        const response = await fetch(url);
        if (!response.ok) {
          return res.status(400).json({
            success: false,
            message: `Gagal mengakses tab ${sheetName}. Pastikan spreadsheet dapat diakses dengan link (Anyone with the link).`
          });
        }
        const csvText = await response.text();
        return res.json({ success: true, csv: csvText, sheetName });
      } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message || 'Gagal mengunduh CSV dari Google Sheet.' });
      }
    }

    res.status(400).json({ success: false, message: 'Parameter permintaan import tidak valid.' });
  });

  // Background 24/7 Auto-Sync Heartbeat (Runs every 60s in Google Cloud environment)
  setInterval(async () => {
    const config = readConfig();
    if (!config.auto_sync_enabled) return;

    if (config.webhook_url_keuangan) {
      try {
        await fetch(config.webhook_url_keuangan, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'test_ping', source: 'server_cron_60s' }),
          redirect: 'follow'
        });
      } catch {
        // silent ping
      }
    }

    if (config.webhook_url_akademik) {
      try {
        await fetch(config.webhook_url_akademik, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'test_ping', source: 'server_cron_60s' }),
          redirect: 'follow'
        });
      } catch {
        // silent ping
      }
    }
  }, 60000);

  // Vite integration
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SIM Sekolah Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
