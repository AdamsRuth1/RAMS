# 🇳🇬 RAMS – Radio Asset Management System
### Nigerian Army Signals Corps
*Communications · Information · Victory*

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FAdamsRuth1%2FRAMS)
[![Deploy to GitHub Pages](https://github.com/AdamsRuth1/RAMS/actions/workflows/deploy.yml/badge.svg)](https://github.com/AdamsRuth1/RAMS/actions/workflows/deploy.yml)

**Live Demo**: [https://adamsruth1.github.io/RAMS/](https://adamsruth1.github.io/RAMS/)

---

## 📌 Overview

**RAMS (Radio Asset Management System)** is a web application tailored for the **Nigerian Army Signals Corps** to streamline and secure tactical radio asset issuance, tracking, and returns.

---

## ⚡ Key Features

- **Single-Page Registration & Instant Radio Issuance**:
  - Register a soldier and immediately issue radio(s) in a single step without navigating between pages.
  - Enter soldier details (Name, Army Number, Rank, Unit, Phone).
- **Direct Serial Number & Quantity Entry**:
  - The person issuing the radio types the radio serial number(s) directly.
  - Set the quantity of radios signed out (`1`, `2`, `3+`).
- **Live Biometric Photo Capture**:
  - Built-in webcam snapshot & upload tool.
  - Saves the actual photo into the database with local persistence.
- **No Signature Column Required**:
  - Replaced manual signatures with tamper-proof digital photo verification.
- **Transaction History with Actual Soldier Photos**:
  - Dedicated column displaying the soldier's photo saved in the database.
  - Displays Radio Serial Numbers, Quantity Signed, Timestamps, and Officer in Charge.
  - Detailed modal voucher for printing receipts.
- **Radio Inventory & Return Management**:
  - Track serviceable, issued, and under-maintenance radios.
  - Overdue return monitoring and activity analytics.

---

## 🚀 Live Hosting Instructions

### Option 1: GitHub Pages (Automatic via GitHub Actions)
1. Go to your repository settings: [https://github.com/AdamsRuth1/RAMS/settings/pages](https://github.com/AdamsRuth1/RAMS/settings/pages)
2. Under **Build and deployment > Source**, select **GitHub Actions**.
3. That's it! GitHub will run the `.github/workflows/deploy.yml` workflow and publish your site at:
   **`https://adamsruth1.github.io/RAMS/`**

### Option 2: Vercel (Instant 1-Click Deployment)
1. Click the **Deploy with Vercel** button above or visit [vercel.com/new](https://vercel.com/new).
2. Select the `AdamsRuth1/RAMS` repository.
3. Click **Deploy**. Vercel will build and host it with automatic SSL.

---

## 💻 Local Development

```bash
# Clone the repository
git clone https://github.com/AdamsRuth1/RAMS.git

# Navigate into project directory
cd RAMS

# Install dependencies
npm install

# Start local development server
npm run dev
```

---

## 🛠️ Tech Stack

- **Framework**: React 19 + Vite 8
- **Routing**: React Router (HashRouter for fail-safe static hosting)
- **State Management**: Zustand with persistent storage
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Styling**: Tailwind CSS & Modern Dark Military Palette
