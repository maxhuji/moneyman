import express from "express";
import cors from "cors";
import * as path from "path";
import { CSVExporter } from "./csv-exporter";

const app = express();
const PORT = parseInt(process.env.PORT || "10000", 10);

// Configuration from environment variables
const config = {
  serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
  serviceAccountPrivateKey:
    process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY!.replace(/\\n/g, "\n"),
  sheetId: process.env.GOOGLE_SHEET_ID!,
  worksheetName: process.env.WORKSHEET_NAME || "Moneyman",
  budgetConfigPath: path.join(__dirname, "../budget-config.json"),
  dashboardPassword: process.env.DASHBOARD_PASSWORD || "moneyman2026",
};

let cachedData: { summary: any; transactions: any[] } | null = null;
let lastFetch = 0;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

app.use(cors());
app.use(express.json());

// Basic authentication middleware
app.use((req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Basic ")) {
    res.setHeader("WWW-Authenticate", 'Basic realm="Moneyman Dashboard"');
    return res.status(401).send("Authentication required");
  }

  const base64Credentials = authHeader.split(" ")[1];
  const credentials = Buffer.from(base64Credentials, "base64").toString(
    "ascii",
  );
  const [username, password] = credentials.split(":");

  if (password !== config.dashboardPassword) {
    res.setHeader("WWW-Authenticate", 'Basic realm="Moneyman Dashboard"');
    return res.status(401).send("Invalid credentials");
  }

  next();
});

app.use(express.static(path.join(__dirname, "../public")));

async function fetchData(offsetMonths: number = 0) {
  const now = Date.now();
  // Don't cache if looking at different periods
  if (offsetMonths === 0 && cachedData && now - lastFetch < CACHE_DURATION) {
    return cachedData;
  }

  console.log(
    `Fetching data from Google Sheets (offset: ${offsetMonths} months)...`,
  );
  const exporter = new CSVExporter(
    config.serviceAccountEmail,
    config.serviceAccountPrivateKey,
    config.sheetId,
    config.worksheetName,
    config.budgetConfigPath,
  );

  const { transactions, summary } = await exporter.exportInMemory(offsetMonths);

  // Only cache current period
  if (offsetMonths === 0) {
    cachedData = { summary, transactions };
    lastFetch = now;
  }

  return { summary, transactions };
}

// API endpoint to get budget summary
app.get("/api/budget-summary", async (req, res) => {
  try {
    const offsetMonths = parseInt(req.query.offset as string) || 0;
    const data = await fetchData(offsetMonths);
    res.json(data.summary);
  } catch (error) {
    console.error("Error fetching budget summary:", error);
    res.status(500).json({ error: "Failed to fetch budget data" });
  }
});

// API endpoint to get all transactions
app.get("/api/transactions", async (req, res) => {
  try {
    const offsetMonths = parseInt(req.query.offset as string) || 0;
    const data = await fetchData(offsetMonths);
    res.json(data.transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

// API endpoint to get transactions by category
app.get("/api/transactions/:category", async (req, res) => {
  try {
    const { category } = req.params;
    const offsetMonths = parseInt(req.query.offset as string) || 0;
    const data = await fetchData(offsetMonths);
    const filtered = data.transactions.filter(
      (tx: any) => tx.autoCategory === category,
    );
    res.json(filtered);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

// Manual refresh endpoint
app.post("/api/refresh", async (req, res) => {
  try {
    cachedData = null;
    await fetchData();
    res.json({ success: true, message: "Data refreshed successfully" });
  } catch (error) {
    console.error("Error refreshing data:", error);
    res.status(500).json({ error: "Failed to refresh data" });
  }
});

// Update transaction endpoint
app.patch("/api/transactions/:hash", async (req, res) => {
  try {
    const { hash } = req.params;
    const { manualCategory, excluded } = req.body;

    const exporter = new CSVExporter(
      config.serviceAccountEmail,
      config.serviceAccountPrivateKey,
      config.sheetId,
      config.worksheetName,
      config.budgetConfigPath,
    );

    await exporter.updateTransaction(hash, { manualCategory, excluded });

    // Clear cache to force refresh
    cachedData = null;

    res.json({ success: true, message: "Transaction updated successfully" });
  } catch (error) {
    console.error("Error updating transaction:", error);
    res.status(500).json({ error: "Failed to update transaction" });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Dashboard server running on port ${PORT}`);
  console.log("Data will be fetched from Google Sheets on first request");
});
