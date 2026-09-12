# 📊 Kanakku360 Google Sheet Database Setup Guide

Use any Google Sheet as your personal, zero-cost, private database for Kanakku360.

---

## 🚀 3-Minute Quick Setup

### Step 1: Create a Google Sheet
1. Open [Google Sheets](https://sheets.new) in your browser.
2. Name the sheet **`Kanakku360 Database`**.

### Step 2: Open Apps Script Editor
1. In the top menu, click **Extensions** > **Apps Script**.
2. Delete any boilerplate code inside `Code.gs`.
3. Copy the entire contents of [`Code.gs`](./Code.gs) and paste it into the editor.
4. Click the **Save** disk icon (or press `Ctrl+S` / `Cmd+S`).

### Step 3: Deploy as a Web App
1. In the top-right corner of the Apps Script editor, click **Deploy** > **New deployment**.
2. Click the gear icon ⚙️ next to "Select type" and choose **Web app**.
3. Configure settings:
   - **Description**: `Kanakku360 Production API`
   - **Execute as**: `Me (<your-email@gmail.com>)`
   - **Who has access**: `Anyone` *(Crucial: allows Kanakku360 UI to communicate with your sheet securely)*
4. Click **Deploy**.
5. Grant permissions if prompted (Click *Advanced* -> *Go to Kanakku360 (unsafe)* -> *Allow*).

### Step 4: Connect in Kanakku360
1. Copy the **Web app URL** (starts with `https://script.google.com/macros/s/.../exec`).
2. Open **Kanakku360** in your browser.
3. Click **Settings** (or the Cloud Sync button in top bar).
4. Paste the URL into **Google Apps Script URL** and click **Test & Connect**.
5. Click **Sync to Google Sheet** to initialize all your categories, accounts, budgets, and transactions!

---

## 📑 Generated Sheets & Structure

The script automatically initializes and maintains the following tabs in your Google Sheet:
- **`Transactions`**: id, date, type, amount, category, account, description, payment mode, tags
- **`Categories`**: id, name, type (Expense/Income), icon, color, budgetLimit
- **`Accounts`**: id, name, type (Bank, Cash, UPI, Credit Card), balance, number, color
- **`Budgets`**: monthly targets, category limits, alert thresholds
- **`SavingsGoals`**: target amount, saved amount, target date, progress
- **`Settings`**: currency preferences, profile preferences

You can inspect or add formulas directly in your Google Sheet anytime!
