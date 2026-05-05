import express from 'express';
import cors from 'cors';
import * as fs from 'fs';
import * as path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// API endpoint to get budget summary
app.get('/api/budget-summary', (req, res) => {
  const summaryPath = path.join(__dirname, '../data/budget-summary-latest.json');

  if (!fs.existsSync(summaryPath)) {
    return res.status(404).json({ error: 'No budget summary available. Run the data export first.' });
  }

  const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf-8'));
  res.json(summary);
});

// API endpoint to get transactions
app.get('/api/transactions', (req, res) => {
  const csvPath = path.join(__dirname, '../data/transactions-latest.csv');

  if (!fs.existsSync(csvPath)) {
    return res.status(404).json({ error: 'No transactions available. Run the data export first.' });
  }

  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n');
  const headers = lines[0].split(',');

  const transactions = lines.slice(1).filter(line => line.trim()).map(line => {
    const values = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g) || [];
    const obj: any = {};
    headers.forEach((header, index) => {
      let value = values[index] || '';
      // Remove quotes if present
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1).replace(/""/g, '"');
      }
      obj[header.trim()] = value.trim();
    });
    return obj;
  });

  res.json(transactions);
});

// API endpoint to get transactions by category
app.get('/api/transactions/:category', (req, res) => {
  const { category } = req.params;
  const csvPath = path.join(__dirname, '../data/transactions-latest.csv');

  if (!fs.existsSync(csvPath)) {
    return res.status(404).json({ error: 'No transactions available. Run the data export first.' });
  }

  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n');
  const headers = lines[0].split(',');

  const transactions = lines.slice(1).filter(line => line.trim()).map(line => {
    const values = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g) || [];
    const obj: any = {};
    headers.forEach((header, index) => {
      let value = values[index] || '';
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1).replace(/""/g, '"');
      }
      obj[header.trim()] = value.trim();
    });
    return obj;
  }).filter(tx => tx.autoCategory === category);

  res.json(transactions);
});

app.listen(PORT, () => {
  console.log(`Dashboard server running on http://localhost:${PORT}`);
});
