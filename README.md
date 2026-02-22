# 🍳 Recipe Parser

**Recipe Parser** is a web-based app that lets you **extract, scale, and save recipes** from websites and (in the future) Instagram reels and captions. It’s perfect for organizing your favorite recipes and turning them into structured, editable cookbooks with smart scaling and shopping list features.

## ✨ Features

- 🌐 Parse recipes from website URLs
- 📥 Save and view parsed recipes
- 🧮 Scale-aware fraction formatting
- 📝 View ingredients and step-by-step instructions
- 🗃️ Server support using SQLite (included)

## 🔮 Planned Features

- 🔜 Instagram Reel & Caption parsing
- 🔜 Edit saved recipes
- 🔜 Organize recipes into cookbooks
- 🔜 Generate shopping lists from recipes
- 🔜 User login and cloud sync

## 🚧 Known Bugs

- When changing recipe scale, **fractions aren't always updated correctly**
- Comments in ingredients/instructions may appear **poorly formatted**

---

## 🛠️ How It Works

### 🔍 Parsing Method

The app uses a layered extraction strategy to fetch and structure recipe data:
1. **JSON-LD** (most reliable)
2. **Microdata**
3. **Fallback** using common HTML patterns

Parsing is done client-side with help from a public CORS proxy, or server-side using `recipe-scraper`.

---

## 🚀 Getting Started

### 🔧 Prerequisites

- Node.js (for the server)
- Modern browser (for the frontend)

### ▶️ Running Locally

#### Frontend

1. Open `index.html` directly in your browser.

#### Backend (optional)

1. Run `npm install` to install dependencies:
    ```bash
    npm install express cors body-parser recipe-scraper sqlite3
    ```

2. Start the server:
    ```bash
    node server.js
    ```

3. The server runs at `http://localhost:3000`.

---

## 📁 Folder Structure

```
project-root/
│
├── index.html          # Frontend app
├── server.js           # Node.js + Express + SQLite backend
├── recipes.db          # SQLite database (created on first run)
├── README.md           # This file
```

---

## 💡 Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express, SQLite
- **Recipe Parsing**: `recipe-scraper` library + JSON-LD/Microdata fallback

---

## 📌 License

MIT — Feel free to use, adapt, and improve.

---

## 🙋‍♀️ Contributions Welcome

Have ideas or want to help with parsing, scaling, or feature building? Open an issue or submit a PR!
