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

// --- CONFIGURATION ---
// NOTE: Replace this with actual authentication logic later.
const CURRENT_USER_ID = 1; 

// --- SQLite database setup ---
const db = new sqlite3.Database('./recipes.db', (err) => {
    if (err) {
        console.error("[DB INIT ERROR]", err.message);
    } else {
        console.log("[DB INIT] Connected to SQLite database.");
    }
});

db.serialize(() => {
    // MODIFIED: Added user_id to the table schema
    db.run(`
        CREATE TABLE IF NOT EXISTS recipes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,  
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

// --- API ROUTES ---

// Route to parse and save a new recipe
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
            INSERT OR IGNORE INTO recipes (user_id, title, url, source, ingredients, instructions, dateAdded)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [CURRENT_USER_ID, data.title, data.url, data.source, data.ingredients, data.instructions, data.dateAdded], function(err) {
            if (err) {
                console.error("[DB INSERT ERROR]", err.message);
                res.status(500).json({ error: "Failed to save recipe" });
            } else {
                console.log("[DB INSERT] Recipe saved. ID:", this.lastID);
                // Return the newly created ID to the frontend
                res.json({ ...data, id: this.lastID }); 
            }
        });
    } catch (err) {
        console.error("[SCRAPER ERROR]", err);
        res.status(500).json({ error: "Failed to parse recipe" });
    }
});

// Route to get all saved recipes for the current user
app.get('/api/recipes', (req, res) => {
    db.all("SELECT * FROM recipes WHERE user_id = ?", [CURRENT_USER_ID], (err, rows) => {
        if (err) {
            console.error("[DB FETCH ERROR]", err.message);
            return res.status(500).json({ error: err.message });
        }
        console.log("[DB FETCH] Returning recipes:", rows.length);
        res.json(rows.map(row => ({
            ...row,
            // Parse JSON back to JavaScript arrays for the frontend
            ingredients: JSON.parse(row.ingredients),
            instructions: JSON.parse(row.instructions)
        })));
    });
});

// NEW ROUTE: Route to update a saved recipe (Editing)
app.put('/api/recipes/:id', (req, res) => {
    const { id } = req.params;
    const { title, ingredients, instructions } = req.body;

    // Use JSON.stringify again before saving to SQLite
    const updatedIngredients = JSON.stringify(ingredients);
    const updatedInstructions = JSON.stringify(instructions);

    db.run(`
        UPDATE recipes 
        SET title = ?, ingredients = ?, instructions = ?
        WHERE id = ? AND user_id = ?
    `, [title, updatedIngredients, updatedInstructions, id, CURRENT_USER_ID], function(err) {
        if (err) {
            console.error("[DB UPDATE ERROR]", err.message);
            return res.status(500).json({ error: "Failed to update recipe" });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: "Recipe not found or not owned by user" });
        }
        console.log(`[DB UPDATE] Recipe ID ${id} updated.`);
        res.json({ message: "Recipe updated successfully", id: id });
    });
});

// Route for Random Recipe Generation
app.post('/api/generate-random', (req, res) => {
    const { count, requirements } = req.body;
    
    console.log("rendonm recepie gen presed");
    console.log(`Requested count: ${count}`);
    
    if (requirements && requirements.length > 0) {
        console.log(`Specific Requirements: ${requirements.join(", ")}`);
    } else {
        console.log(`Specific Requirements: None`);
    }
    
    res.json({ message: "Random recipe generation requested" });
});

app.listen(PORT, () => {
    console.log(`\n[SERVER START] Listening at http://localhost:${PORT}\n`);
});


// // server.js

// const express = require('express');
// const cors = require('cors');
// const bodyParser = require('body-parser');
// const recipeScraper = require('recipe-scraper').default;
// const sqlite3 = require('sqlite3').verbose();

// const app = express();
// const PORT = 3000;

// app.use(cors());
// app.use(bodyParser.json());

// // SQLite database setup
// const db = new sqlite3.Database('./recipes.db', (err) => {
//     if (err) {
//         console.error("[DB INIT ERROR]", err.message);
//     } else {
//         console.log("[DB INIT] Connected to SQLite database.");
//     }
// });

// db.serialize(() => {
//     db.run(`
//         CREATE TABLE IF NOT EXISTS recipes (
//             id INTEGER PRIMARY KEY AUTOINCREMENT,
//             title TEXT,
//             url TEXT UNIQUE,
//             source TEXT,
//             ingredients TEXT,
//             instructions TEXT,
//             dateAdded TEXT
//         )
//     `, (err) => {
//         if (err) console.error("[DB TABLE CREATE ERROR]", err.message);
//         else console.log("[DB INIT] Recipes table ensured.");
//     });
// });

// // Route to parse recipe
// app.post('/api/parse', async (req, res) => {
//     const { url } = req.body;
//     console.log("[API PARSE] Received URL:", url);

//     try {
//         const recipe = await recipeScraper(url);
//         console.log("[SCRAPER SUCCESS] Recipe scraped:", recipe.name);

//         const data = {
//             title: recipe.name,
//             url: url,
//             source: new URL(url).hostname,
//             ingredients: JSON.stringify(recipe.ingredients),
//             instructions: JSON.stringify(recipe.instructions),
//             dateAdded: new Date().toLocaleDateString()
//         };

//         db.run(`
//             INSERT OR IGNORE INTO recipes (title, url, source, ingredients, instructions, dateAdded)
//             VALUES (?, ?, ?, ?, ?, ?)
//         `, [data.title, data.url, data.source, data.ingredients, data.instructions, data.dateAdded], (err) => {
//             if (err) {
//                 console.error("[DB INSERT ERROR]", err.message);
//                 res.status(500).json({ error: "Failed to save recipe" });
//             } else {
//                 console.log("[DB INSERT] Recipe saved.");
//                 res.json({ ...data });
//             }
//         });
//     } catch (err) {
//         console.error("[SCRAPER ERROR]", err);
//         res.status(500).json({ error: "Failed to parse recipe" });
//     }
// });

// // Route to get all saved recipes
// app.get('/api/recipes', (req, res) => {
//     db.all("SELECT * FROM recipes", [], (err, rows) => {
//         if (err) {
//             console.error("[DB FETCH ERROR]", err.message);
//             return res.status(500).json({ error: err.message });
//         }
//         console.log("[DB FETCH] Returning recipes:", rows.length);
//         res.json(rows.map(row => ({
//             ...row,
//             ingredients: JSON.parse(row.ingredients),
//             instructions: JSON.parse(row.instructions)
//         })));
//     });
// });

// app.listen(PORT, () => {
//     console.log(`\n[SERVER START] Listening at http://localhost:${PORT}\n`);
// });


// /*
// // server.js
// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const axios = require('axios');
// const cheerio = require('cheerio');
// const { URL } = require('url');

// const app = express();
// const PORT = process.env.PORT || 3000;

// // Middleware
// app.use(cors({ origin: '*', methods: ['GET', 'POST'], allowedHeaders: ['Content-Type'] }));
// app.use(express.json());

// // MongoDB connection
// mongoose.connect('mongodb://localhost:27017/recipe-parser', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// });

// // Recipe Schema
// const recipeSchema = new mongoose.Schema({
//   title: String,
//   ingredients: [String],
//   instructions: [String],
//   prepTime: String,
//   cookTime: String,
//   totalTime: String,
//   servings: String,
//   description: String,
//   image: String,
//   url: { type: String, required: true },
//   userId: { type: String, default: 'default' },
//   dateAdded: { type: Date, default: Date.now }
// });
// const Recipe = mongoose.model('Recipe', recipeSchema);

// // Extraction class
// // Enhanced RecipeExtractor class with site-specific parsing
// class RecipeExtractor {
//   static async extractFromUrl(url) {
//     const response = await axios.get(url, {
//       headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' },
//       timeout: 15000
//     });
//     const $ = cheerio.load(response.data);
    
//     // Try JSON-LD first (most reliable)
//     const jsonLdRecipe = this.extractJsonLd($);
//     if (jsonLdRecipe && jsonLdRecipe.title && jsonLdRecipe.ingredients.length > 0) {
//       return jsonLdRecipe;
//     }
    
//     // Try microdata second
//     const microdataRecipe = this.extractMicrodata($);
//     if (microdataRecipe && microdataRecipe.title && microdataRecipe.ingredients.length > 0) {
//       return microdataRecipe;
//     }
    
//     // Try site-specific parsing
//     const hostname = new URL(url).hostname.toLowerCase();
//     const siteSpecificRecipe = this.extractSiteSpecific($, hostname);
//     if (siteSpecificRecipe && siteSpecificRecipe.title && siteSpecificRecipe.ingredients.length > 0) {
//       return siteSpecificRecipe;
//     }
    
//     throw new Error('Could not extract recipe from this website');
//   }

//   static extractJsonLd($) {
//     const scripts = $('script[type="application/ld+json"]');
//     for (const script of scripts.toArray()) {
//       try {
//         const json = JSON.parse($(script).contents().text());
//         const data = Array.isArray(json) ? json : [json];
//         for (const item of data) {
//           if (item['@type'] === 'Recipe' || (item['@graph'] && item['@graph'].find(i => i['@type'] === 'Recipe'))) {
//             const recipe = item['@type'] === 'Recipe' ? item : item['@graph'].find(i => i['@type'] === 'Recipe');
//             return {
//               title: recipe.name || '',
//               description: recipe.description || '',
//               ingredients: (recipe.recipeIngredient || []).map(i => i.trim()).filter(Boolean),
//               instructions: (recipe.recipeInstructions || []).map(i => 
//                 typeof i === 'string' ? i : i.text || i.name || ''
//               ).filter(Boolean),
//               prepTime: this.formatTime(recipe.prepTime),
//               cookTime: this.formatTime(recipe.cookTime),
//               totalTime: this.formatTime(recipe.totalTime),
//               servings: this.formatServings(recipe.recipeYield),
//               image: typeof recipe.image === 'string' ? recipe.image : recipe.image?.url || ''
//             };
//           }
//         }
//       } catch (e) {
//         continue;
//       }
//     }
//     return null;
//   }

//   static extractMicrodata($) {
//     const el = $('[itemtype*="Recipe"]');
//     if (!el.length) return null;
    
//     return {
//       title: el.find('[itemprop="name"]').first().text().trim(),
//       description: el.find('[itemprop="description"]').first().text().trim(),
//       ingredients: el.find('[itemprop="recipeIngredient"]').map((_, e) => $(e).text().trim()).get().filter(Boolean),
//       instructions: el.find('[itemprop="recipeInstructions"]').map((_, e) => $(e).text().trim()).get().filter(Boolean),
//       prepTime: this.formatTime(el.find('[itemprop="prepTime"]').attr('datetime') || el.find('[itemprop="prepTime"]').text()),
//       cookTime: this.formatTime(el.find('[itemprop="cookTime"]').attr('datetime') || el.find('[itemprop="cookTime"]').text()),
//       totalTime: this.formatTime(el.find('[itemprop="totalTime"]').attr('datetime') || el.find('[itemprop="totalTime"]').text()),
//       servings: this.formatServings(el.find('[itemprop="recipeYield"]').text().trim()),
//       image: el.find('[itemprop="image"]').attr('src') || el.find('[itemprop="image"] img').attr('src') || ''
//     };
//   }

//   static extractSiteSpecific($, hostname) {
//     // AllRecipes
//     if (hostname.includes('allrecipes.com')) {
//       return this.extractAllRecipes($);
//     }
    
//     // Food Network
//     if (hostname.includes('foodnetwork.com')) {
//       return this.extractFoodNetwork($);
//     }
    
//     // Bon Appétit
//     if (hostname.includes('bonappetit.com')) {
//       return this.extractBonAppetit($);
//     }
    
//     // Serious Eats
//     if (hostname.includes('seriouseats.com')) {
//       return this.extractSeriousEats($);
//     }
    
//     // Food52
//     if (hostname.includes('food52.com')) {
//       return this.extractFood52($);
//     }
    
//     // Epicurious
//     if (hostname.includes('epicurious.com')) {
//       return this.extractEpicurious($);
//     }
    
//     // Tasty
//     if (hostname.includes('tasty.co')) {
//       return this.extractTasty($);
//     }
    
//     // BBC Good Food
//     if (hostname.includes('bbcgoodfood.com')) {
//       return this.extractBBCGoodFood($);
//     }
    
//     // Simply Recipes
//     if (hostname.includes('simplyrecipes.com')) {
//       return this.extractSimplyRecipes($);
//     }
    
//     // Meaningful Eats (from your example)
//     if (hostname.includes('meaningfuleats.com')) {
//       return this.extractMeaningfulEats($);
//     }
    
//     return null;
//   }

//   static extractAllRecipes($) {
//     return {
//       title: $('h1.recipe-summary__h1').text().trim() || $('h1').first().text().trim(),
//       description: $('.recipe-summary__description').text().trim(),
//       ingredients: $('.recipe-ingred_txt').map((_, el) => $(el).text().trim()).get().filter(Boolean),
//       instructions: $('.recipe-directions__list--item').map((_, el) => $(el).text().trim()).get().filter(Boolean),
//       prepTime: this.formatTime($('.recipe-summary__item:contains("prep")').text()),
//       cookTime: this.formatTime($('.recipe-summary__item:contains("cook")').text()),
//       totalTime: this.formatTime($('.recipe-summary__item:contains("total")').text()),
//       servings: this.formatServings($('.recipe-summary__item:contains("servings")').text()),
//       image: $('.rec-photo img').attr('src') || $('img.recipe-image').attr('src') || ''
//     };
//   }

//   static extractFoodNetwork($) {
//     return {
//       title: $('h1.o-AssetTitle__a-HeadlineText').text().trim() || $('h1').first().text().trim(),
//       description: $('.o-AssetDescription__a-Description').text().trim(),
//       ingredients: $('.o-RecipeIngredient__a-Ingredient').map((_, el) => $(el).text().trim()).get().filter(Boolean),
//       instructions: $('.o-Method__m-Step').map((_, el) => $(el).text().trim()).get().filter(Boolean),
//       prepTime: this.formatTime($('.o-RecipeInfo__a-Description:contains("prep")').text()),
//       cookTime: this.formatTime($('.o-RecipeInfo__a-Description:contains("cook")').text()),
//       totalTime: this.formatTime($('.o-RecipeInfo__a-Description:contains("total")').text()),
//       servings: this.formatServings($('.o-RecipeInfo__a-Description:contains("serves")').text()),
//       image: $('.m-MediaBlock__a-Image img').attr('src') || ''
//     };
//   }

//   static extractBonAppetit($) {
//     return {
//       title: $('h1[data-testid="recipe-title"]').text().trim() || $('h1').first().text().trim(),
//       description: $('.recipe-intro').text().trim(),
//       ingredients: $('[data-testid="ingredient-list"] li').map((_, el) => $(el).text().trim()).get().filter(Boolean),
//       instructions: $('[data-testid="instruction-step"]').map((_, el) => $(el).text().trim()).get().filter(Boolean),
//       prepTime: this.formatTime($('[data-testid="recipe-info"] span:contains("prep")').parent().text()),
//       cookTime: this.formatTime($('[data-testid="recipe-info"] span:contains("cook")').parent().text()),
//       totalTime: this.formatTime($('[data-testid="recipe-info"] span:contains("total")').parent().text()),
//       servings: this.formatServings($('[data-testid="recipe-info"] span:contains("serves")').parent().text()),
//       image: $('picture img').first().attr('src') || ''
//     };
//   }

//   static extractSeriousEats($) {
//     return {
//       title: $('h1.heading__h1').text().trim() || $('h1').first().text().trim(),
//       description: $('.article-header__description').text().trim(),
//       ingredients: $('.structured-ingredients__list li').map((_, el) => $(el).text().trim()).get().filter(Boolean),
//       instructions: $('.structured-project__steps li').map((_, el) => $(el).text().trim()).get().filter(Boolean),
//       prepTime: this.formatTime($('.project-meta__recipe-time:contains("prep")').text()),
//       cookTime: this.formatTime($('.project-meta__recipe-time:contains("cook")').text()),
//       totalTime: this.formatTime($('.project-meta__recipe-time:contains("total")').text()),
//       servings: this.formatServings($('.project-meta__recipe-serves').text()),
//       image: $('.primary-image img').attr('src') || ''
//     };
//   }

//   static extractFood52($) {
//     return {
//       title: $('h1.recipe-title').text().trim() || $('h1').first().text().trim(),
//       description: $('.recipe-description').text().trim(),
//       ingredients: $('.recipe-list--ingredients li').map((_, el) => $(el).text().trim()).get().filter(Boolean),
//       instructions: $('.recipe-list--instructions li').map((_, el) => $(el).text().trim()).get().filter(Boolean),
//       prepTime: this.formatTime($('.recipe-meta-item:contains("prep")').text()),
//       cookTime: this.formatTime($('.recipe-meta-item:contains("cook")').text()),
//       totalTime: this.formatTime($('.recipe-meta-item:contains("total")').text()),
//       servings: this.formatServings($('.recipe-meta-item:contains("serves")').text()),
//       image: $('.recipe-photo img').attr('src') || ''
//     };
//   }

//   static extractEpicurious($) {
//     return {
//       title: $('h1.recipe-title').text().trim() || $('h1').first().text().trim(),
//       description: $('.recipe-intro').text().trim(),
//       ingredients: $('.ingredient').map((_, el) => $(el).text().trim()).get().filter(Boolean),
//       instructions: $('.preparation-step').map((_, el) => $(el).text().trim()).get().filter(Boolean),
//       prepTime: this.formatTime($('.recipe-info-item:contains("prep")').text()),
//       cookTime: this.formatTime($('.recipe-info-item:contains("cook")').text()),
//       totalTime: this.formatTime($('.recipe-info-item:contains("total")').text()),
//       servings: this.formatServings($('.recipe-info-item:contains("serves")').text()),
//       image: $('.photo img').attr('src') || ''
//     };
//   }

//   static extractTasty($) {
//     return {
//       title: $('h1.recipe-name').text().trim() || $('h1').first().text().trim(),
//       description: $('.recipe-description').text().trim(),
//       ingredients: $('.ingredient').map((_, el) => $(el).text().trim()).get().filter(Boolean),
//       instructions: $('.instruction').map((_, el) => $(el).text().trim()).get().filter(Boolean),
//       prepTime: this.formatTime($('.recipe-time:contains("prep")').text()),
//       cookTime: this.formatTime($('.recipe-time:contains("cook")').text()),
//       totalTime: this.formatTime($('.recipe-time:contains("total")').text()),
//       servings: this.formatServings($('.recipe-yield').text()),
//       image: $('.recipe-image img').attr('src') || ''
//     };
//   }

//   static extractBBCGoodFood($) {
//     return {
//       title: $('h1.gel-trafalgar-bold').text().trim() || $('h1').first().text().trim(),
//       description: $('.editor-content p').first().text().trim(),
//       ingredients: $('.recipe-ingredients__list li').map((_, el) => $(el).text().trim()).get().filter(Boolean),
//       instructions: $('.recipe-method__list li').map((_, el) => $(el).text().trim()).get().filter(Boolean),
//       prepTime: this.formatTime($('.recipe-details__item:contains("prep")').text()),
//       cookTime: this.formatTime($('.recipe-details__item:contains("cook")').text()),
//       totalTime: this.formatTime($('.recipe-details__item:contains("total")').text()),
//       servings: this.formatServings($('.recipe-details__item:contains("serves")').text()),
//       image: $('.recipe-media__image img').attr('src') || ''
//     };
//   }

//   static extractSimplyRecipes($) {
//     return {
//       title: $('h1.entry-title').text().trim() || $('h1').first().text().trim(),
//       description: $('.entry-content p').first().text().trim(),
//       ingredients: $('.recipe-ingredients li').map((_, el) => $(el).text().trim()).get().filter(Boolean),
//       instructions: $('.recipe-instructions li').map((_, el) => $(el).text().trim()).get().filter(Boolean),
//       prepTime: this.formatTime($('.recipe-meta:contains("prep")').text()),
//       cookTime: this.formatTime($('.recipe-meta:contains("cook")').text()),
//       totalTime: this.formatTime($('.recipe-meta:contains("total")').text()),
//       servings: this.formatServings($('.recipe-meta:contains("serves")').text()),
//       image: $('.recipe-image img').attr('src') || ''
//     };
//   }

//   static extractMeaningfulEats($) {
//     return {
//       title: $('h1.wp-block-heading').text().trim() || $('h1').first().text().trim(),
//       description: $('.wp-block-paragraph').first().text().trim(),
//       ingredients: $('.wp-block-list li, .recipe-ingredients li').map((_, el) => {
//         const text = $(el).text().trim();
//         // Filter for actual ingredients (containing measurements)
//         return /\d+.*(cup|tbsp|tsp|gram|kg|oz|ml|teaspoon|tablespoon|pound|lb)/i.test(text) ? text : null;
//       }).get().filter(Boolean),
//       instructions: $('.wp-block-list li, .recipe-instructions li').map((_, el) => {
//         const text = $(el).text().trim();
//         // Filter for actual instructions (longer text, contains verbs)
//         return text.length > 20 && /\b(mix|stir|bake|cook|add|pour|heat|combine|whisk|fold)\b/i.test(text) ? text : null;
//       }).get().filter(Boolean),
//       prepTime: this.formatTime($('.recipe-meta:contains("prep"), .wp-block-paragraph:contains("prep")').text()),
//       cookTime: this.formatTime($('.recipe-meta:contains("cook"), .wp-block-paragraph:contains("cook")').text()),
//       totalTime: this.formatTime($('.recipe-meta:contains("total"), .wp-block-paragraph:contains("total")').text()),
//       servings: this.formatServings($('.recipe-meta:contains("serves"), .wp-block-paragraph:contains("serves")').text()),
//       image: $('.wp-block-image img, .recipe-image img').first().attr('src') || ''
//     };
//   }

//   // Helper methods
//   static formatTime(timeStr) {
//     if (!timeStr) return '';
    
//     // Handle ISO 8601 duration format (PT15M)
//     const isoMatch = timeStr.match(/PT(\d+H)?(\d+M)?/);
//     if (isoMatch) {
//       const hours = isoMatch[1] ? parseInt(isoMatch[1]) : 0;
//       const minutes = isoMatch[2] ? parseInt(isoMatch[2]) : 0;
//       return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
//     }
    
//     // Handle regular time formats
//     const timeMatch = timeStr.match(/(\d+)\s*(hour|hr|h|minute|min|m)/gi);
//     if (timeMatch) {
//       return timeMatch.join(' ');
//     }
    
//     // Extract just numbers and common time words
//     const cleaned = timeStr.replace(/[^\d\s\w]/g, ' ').trim();
//     const numberMatch = cleaned.match(/\d+/);
//     if (numberMatch) {
//       return `${numberMatch[0]} min`;
//     }
    
//     return timeStr.trim();
//   }

//   static formatServings(servingStr) {
//     if (!servingStr) return '';
    
//     // Extract numbers from serving string
//     const numberMatch = servingStr.match(/\d+/);
//     if (numberMatch) {
//       return numberMatch[0];
//     }
    
//     return servingStr.trim();
//   }
// }

// // API Endpoints
// app.post('/api/recipes/parse', async (req, res) => {
//   const { url } = req.body;
//   if (!url) return res.status(400).json({ error: 'URL is required' });

//   try {
//     new URL(url);
//   } catch {
//     return res.status(400).json({ error: 'Invalid URL' });
//   }

//   try {
//     const data = await RecipeExtractor.extractFromUrl(url);
//     if (!data || (!data.title && !data.ingredients.length)) {
//       return res.status(404).json({ error: 'No recipe found' });
//     }
//     return res.json({ ...data, url });
//   } catch (err) {
//     return res.status(500).json({ error: err.message });
//   }
// });

// app.post('/api/recipes', async (req, res) => {
//   try {
//     const data = req.body;
//     const exists = await Recipe.findOne({ url: data.url });
//     if (exists) return res.status(409).json({ error: 'Recipe already saved' });
//     const recipe = await new Recipe(data).save();
//     res.status(201).json(recipe);
//   } catch (e) {
//     res.status(500).json({ error: 'Failed to save recipe' });
//   }
// });

// app.get('/api/recipes', async (req, res) => {
//   try {
//     const recipes = await Recipe.find({ userId: 'default' }).sort({ dateAdded: -1 });
//     res.json(recipes);
//   } catch (e) {
//     res.status(500).json({ error: 'Failed to fetch recipes' });
//   }
// });

// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// */