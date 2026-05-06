import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import * as fs from "fs";
import * as path from "path";

interface Transaction {
  date: string;
  amount: number;
  description: string;
  memo: string;
  category: string;
  account: string;
  hash: string;
  comment?: string;
  "scraped at": string;
  "scraped by": string;
  identifier: string;
  chargedCurrency?: string;
}

interface BudgetConfig {
  categories: {
    [key: string]: {
      budget: number;
      displayName?: string;
      maxCategories?: string[];
      keywords: string[];
    };
  };
  defaultCategory: string;
}

export class CSVExporter {
  private doc: GoogleSpreadsheet;
  private budgetConfig: BudgetConfig;

  constructor(
    private serviceAccountEmail: string,
    private serviceAccountPrivateKey: string,
    private sheetId: string,
    private worksheetName: string,
    private budgetConfigPath: string,
  ) {
    const serviceAccountAuth = new JWT({
      email: this.serviceAccountEmail,
      key: this.serviceAccountPrivateKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    this.doc = new GoogleSpreadsheet(this.sheetId, serviceAccountAuth);
    this.budgetConfig = JSON.parse(
      fs.readFileSync(this.budgetConfigPath, "utf-8"),
    );
  }

  private categorizeTransaction(
    maxCategory: string,
    description: string,
    memo: string,
  ): string {
    // First, try to map using the Max category column
    if (maxCategory) {
      for (const [category, config] of Object.entries(
        this.budgetConfig.categories,
      )) {
        if (
          config.maxCategories &&
          config.maxCategories.includes(maxCategory)
        ) {
          return category;
        }
      }
    }

    // Fallback to keyword matching in description/memo
    const searchText = `${description} ${memo}`.toLowerCase();

    for (const [category, config] of Object.entries(
      this.budgetConfig.categories,
    )) {
      if (config.keywords.length === 0) continue;

      for (const keyword of config.keywords) {
        if (searchText.includes(keyword.toLowerCase())) {
          return category;
        }
      }
    }

    return this.budgetConfig.defaultCategory;
  }

  private async fetchTransactions(): Promise<
    Array<Transaction & { autoCategory: string }>
  > {
    console.log("Loading Google Sheet...");
    await this.doc.loadInfo();

    const sheet = this.doc.sheetsByTitle[this.worksheetName];
    if (!sheet) {
      throw new Error(`Worksheet "${this.worksheetName}" not found`);
    }

    console.log("Fetching transactions...");
    const rows = await sheet.getRows();

    const transactions: Transaction[] = rows.map((row) => {
      const amountStr = row.get("amount") || "0";
      // Try to parse amount - handle various formats
      let amount = parseFloat(amountStr.replace(/[^\d.-]/g, ""));
      if (isNaN(amount)) amount = 0;

      return {
        date: row.get("date") || "",
        amount: amount,
        description: row.get("description") || "",
        memo: row.get("memo") || "",
        category: row.get("category") || "",
        account: row.get("account") || "",
        hash: row.get("hash") || "",
        comment: row.get("comment") || undefined,
        "scraped at": row.get("scraped at") || "",
        "scraped by": row.get("scraped by") || "",
        identifier: row.get("identifier") || "",
        chargedCurrency: row.get("chargedCurrency") || undefined,
      };
    });

    console.log(`Found ${transactions.length} transactions`);

    // Add auto-categorization
    const categorizedTransactions = transactions.map((tx) => ({
      ...tx,
      autoCategory: this.categorizeTransaction(
        tx.category,
        tx.description,
        tx.memo,
      ),
    }));

    return categorizedTransactions;
  }

  async export(): Promise<void> {
    const categorizedTransactions = await this.fetchTransactions();

    // Generate CSV
    const dataDir = path.join(__dirname, "../../data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().split("T")[0];
    const csvPath = path.join(dataDir, `transactions-${timestamp}.csv`);
    const latestCsvPath = path.join(dataDir, "transactions-latest.csv");

    const headers = [
      "date",
      "amount",
      "description",
      "memo",
      "category",
      "autoCategory",
      "account",
      "hash",
      "comment",
      "scraped at",
      "scraped by",
      "identifier",
      "chargedCurrency",
    ];

    const csvContent = [
      headers.join(","),
      ...categorizedTransactions.map((tx) =>
        headers
          .map((header) => {
            const value = (tx as any)[header];
            if (value === undefined || value === null) return "";
            // Escape commas and quotes
            const stringValue = String(value);
            if (
              stringValue.includes(",") ||
              stringValue.includes('"') ||
              stringValue.includes("\n")
            ) {
              return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
          })
          .join(","),
      ),
    ].join("\n");

    fs.writeFileSync(csvPath, csvContent, "utf-8");
    fs.writeFileSync(latestCsvPath, csvContent, "utf-8");

    console.log(`CSV exported to: ${csvPath}`);
    console.log(`Latest CSV updated: ${latestCsvPath}`);

    // Generate budget summary
    this.generateBudgetSummary(categorizedTransactions, dataDir, timestamp);
  }

  async exportInMemory(): Promise<{
    transactions: Array<Transaction & { autoCategory: string }>;
    summary: any;
  }> {
    const categorizedTransactions = await this.fetchTransactions();
    const summary = this.generateBudgetSummaryInMemory(categorizedTransactions);
    return { transactions: categorizedTransactions, summary };
  }

  private generateBudgetSummaryInMemory(
    transactions: Array<Transaction & { autoCategory: string }>,
  ): any {
    // Credit card billing period: April 16, 2026 - May 15, 2026
    const startDate = new Date(2026, 3, 16); // April 16, 2026 (month is 0-indexed)
    const endDate = new Date(2026, 4, 15, 23, 59, 59); // May 15, 2026

    // Filter transactions from billing period (negative amounts are expenses)
    // Exclude credit card billing transactions from bank accounts to avoid double-counting
    const currentMonthExpenses = transactions.filter((tx) => {
      const txDate = this.parseIsraeliDate(tx.date);
      const isCreditCardBilling = tx.description.includes("חיוב לכרטיס");
      return (
        txDate >= startDate &&
        txDate <= endDate &&
        tx.amount < 0 &&
        !isCreditCardBilling
      );
    });

    // Deduplicate transactions by hash AND identifier (some transactions have same identifier but different dates)
    const uniqueExpenses = currentMonthExpenses.filter(
      (tx, index, self) =>
        index ===
        self.findIndex(
          (t) =>
            t.hash === tx.hash ||
            (t.identifier && tx.identifier && t.identifier === tx.identifier),
        ),
    );

    const categorySpending: { [key: string]: number } = {};

    uniqueExpenses.forEach((tx) => {
      const category = tx.autoCategory;
      if (!categorySpending[category]) {
        categorySpending[category] = 0;
      }
      categorySpending[category] += Math.abs(tx.amount);
    });

    const summary = Object.entries(this.budgetConfig.categories).map(
      ([category, config]) => ({
        category,
        budget: config.budget,
        spent: Math.round(categorySpending[category] || 0),
        remaining: Math.round(
          config.budget - (categorySpending[category] || 0),
        ),
        percentUsed:
          config.budget === 0
            ? null
            : Math.round(
                ((categorySpending[category] || 0) / config.budget) * 100,
              ),
      }),
    );

    return {
      month: "2026-04-16 to 2026-05-15",
      generatedAt: new Date().toISOString(),
      summary,
      totalBudget: summary.reduce((sum, item) => sum + item.budget, 0),
      totalSpent: summary.reduce((sum, item) => sum + item.spent, 0),
    };
  }

  private generateBudgetSummary(
    transactions: Array<Transaction & { autoCategory: string }>,
    dataDir: string,
    timestamp: string,
  ): void {
    // Credit card billing period: April 16, 2026 - May 15, 2026
    const startDate = new Date(2026, 3, 16); // April 16, 2026 (month is 0-indexed)
    const endDate = new Date(2026, 4, 15, 23, 59, 59); // May 15, 2026

    // Filter transactions from billing period (negative amounts are expenses)
    // Exclude credit card billing transactions from bank accounts to avoid double-counting
    const currentMonthExpenses = transactions.filter((tx) => {
      const txDate = this.parseIsraeliDate(tx.date);
      const isCreditCardBilling = tx.description.includes("חיוב לכרטיס");
      return (
        txDate >= startDate &&
        txDate <= endDate &&
        tx.amount < 0 &&
        !isCreditCardBilling
      );
    });

    // Deduplicate transactions by hash AND identifier (some transactions have same identifier but different dates)
    const uniqueExpenses = currentMonthExpenses.filter(
      (tx, index, self) =>
        index ===
        self.findIndex(
          (t) =>
            t.hash === tx.hash ||
            (t.identifier && tx.identifier && t.identifier === tx.identifier),
        ),
    );

    const categorySpending: { [key: string]: number } = {};

    uniqueExpenses.forEach((tx) => {
      const category = tx.autoCategory;
      if (!categorySpending[category]) {
        categorySpending[category] = 0;
      }
      categorySpending[category] += Math.abs(tx.amount);
    });

    const summary = Object.entries(this.budgetConfig.categories).map(
      ([category, config]) => ({
        category,
        budget: config.budget,
        spent: Math.round(categorySpending[category] || 0),
        remaining: Math.round(
          config.budget - (categorySpending[category] || 0),
        ),
        percentUsed: Math.round(
          ((categorySpending[category] || 0) / config.budget) * 100,
        ),
      }),
    );

    const summaryPath = path.join(dataDir, `budget-summary-${timestamp}.json`);
    const latestSummaryPath = path.join(dataDir, "budget-summary-latest.json");

    const summaryContent = JSON.stringify(
      {
        month: "2026-04-16 to 2026-05-15",
        generatedAt: new Date().toISOString(),
        summary,
        totalBudget: summary.reduce((sum, item) => sum + item.budget, 0),
        totalSpent: summary.reduce((sum, item) => sum + item.spent, 0),
      },
      null,
      2,
    );

    fs.writeFileSync(summaryPath, summaryContent, "utf-8");
    fs.writeFileSync(latestSummaryPath, summaryContent, "utf-8");

    console.log(`Budget summary saved to: ${summaryPath}`);
    console.log(`Latest summary updated: ${latestSummaryPath}`);
  }

  private parseIsraeliDate(dateStr: string): Date {
    // Israeli date format: dd/mm/yyyy
    const [day, month, year] = dateStr.split("/").map((n) => parseInt(n, 10));
    return new Date(year, month - 1, day);
  }
}
