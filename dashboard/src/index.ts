import { CSVExporter } from './csv-exporter';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function main() {
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const serviceAccountPrivateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const worksheetName = process.env.WORKSHEET_NAME || '_moneyman';

  if (!serviceAccountEmail || !serviceAccountPrivateKey || !sheetId) {
    throw new Error('Missing required environment variables for Google Sheets');
  }

  const budgetConfigPath = path.join(__dirname, '../budget-config.json');

  const exporter = new CSVExporter(
    serviceAccountEmail,
    serviceAccountPrivateKey,
    sheetId,
    worksheetName,
    budgetConfigPath
  );

  await exporter.export();
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
