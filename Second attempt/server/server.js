// server.js

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const recipeScraper = require('recipe-scraper').default;
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// SQLite database setup
const db = new sqlite3.Database('./recipes.db', (err) => {
    if (err) {
        console.error("[DB INIT ERROR]", err.message);
    } else {
        console.log("[DB INIT] Connected to SQLite database.");
    }
});

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS recipes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            url TEXT UNIQUE,
            source TEXT,
            ingredients TEXT,
            instructions TEXT,
            dateAdded TEXT
        )
    `, (err) => {
        if (err) console.error("[DB TABLE CREATE ERROR]", err.message);
        else console.log("[DB INIT] Recipes table ensured.");
    });
});

// Route to parse recipe
app.post('/api/parse', async (req, res) => {
    const { url } = req.body;
    console.log("[API PARSE] Received URL:", url);

    try {
        const recipe = await recipeScraper(url);
        console.log("[SCRAPER SUCCESS] Recipe scraped:", recipe.name);

        const data = {
            title: recipe.name,
            url: url,
            source: new URL(url).hostname,
            ingredients: JSON.stringify(recipe.ingredients),
            instructions: JSON.stringify(recipe.instructions),
            dateAdded: new Date().toLocaleDateString()
        };

        db.run(`
            INSERT OR IGNORE INTO recipes (title, url, source, ingredients, instructions, dateAdded)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [data.title, data.url, data.source, data.ingredients, data.instructions, data.dateAdded], (err) => {
            if (err) {
                console.error("[DB INSERT ERROR]", err.message);
                res.status(500).json({ error: "Failed to save recipe" });
            } else {
                console.log("[DB INSERT] Recipe saved.");
                res.json({ ...data });
            }
        });
    } catch (err) {
        console.error("[SCRAPER ERROR]", err);
        res.status(500).json({ error: "Failed to parse recipe" });
    }
});

// Route to get all saved recipes
app.get('/api/recipes', (req, res) => {
    db.all("SELECT * FROM recipes", [], (err, rows) => {
        if (err) {
            console.error("[DB FETCH ERROR]", err.message);
            return res.status(500).json({ error: err.message });
        }
        console.log("[DB FETCH] Returning recipes:", rows.length);
        res.json(rows.map(row => ({
            ...row,
            ingredients: JSON.parse(row.ingredients),
            instructions: JSON.parse(row.instructions)
        })));
    });
});

app.listen(PORT, () => {
    console.log(`\n[SERVER START] Listening at http://localhost:${PORT}\n`);
});
