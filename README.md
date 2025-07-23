🍳 Recipe Parser
Recipe Parser is a web-based app that lets you extract, scale, and save recipes from websites and (in the future) Instagram reels and captions. It’s perfect for organizing your favorite recipes and turning them into structured, editable cookbooks with smart scaling and shopping list features.

✨ Features
🌐 Parse recipes from website URLs

📥 Save and view parsed recipes

🧮 Scale recipe quantities easily (e.g., double, half)

📝 View ingredients and step-by-step instructions

📚 Organize recipes into cookbooks (planned)

✏️ Edit saved recipes (planned)

🛒 Generate shopping lists from recipes (planned)

📦 Local storage persistence for saved recipes

🚧 Known Bugs
When changing recipe scale, fractions aren't always updated correctly

Comments in ingredients/instructions may appear poorly formatted

🛠️ How It Works
🔍 Parsing Method
The app uses a layered extraction strategy to fetch and structure recipe data:

JSON-LD (most reliable)

Microdata

Fallback using common HTML patterns

Parsing is done client-side with help from a public CORS proxy for website access.

🚀 Getting Started
🔧 Prerequisites
A modern browser (Chrome, Firefox, etc.)

No backend required for the basic version (runs fully in the browser)

▶️ Running Locally
Clone or download the repo.

Open index.html in your browser.

Paste a URL to a recipe (e.g., from sites like meaningfuleats.com, allrecipes.com, etc.)

Click Parse Recipe.

View, scale, and save the recipe.

📸 Screenshots
You can add screenshots here using:

md
Copy
Edit
![Screenshot](images/screenshot.png)
📦 Planned Features
✅ Website recipe parsing

🔜 Instagram Reel & Caption parsing

🔜 Manual recipe editing

🔜 Cookbook grouping

🔜 Shopping list generation

🔜 Scale-aware fraction formatting

🔜 Optional backend for user accounts and syncing

💡 Tech Stack
HTML / CSS / JS

LocalStorage for saving recipes

Public proxy (via https://api.codetabs.com) to bypass CORS

Structured data parsing (JSON-LD, microdata, fallback)

🧠 Folder Structure
bash
Copy
Edit
├── index.html         # Main frontend app (self-contained)
├── images/            # (optional) Folder for screenshots
└── README.md          # You're here!
🙋‍♀️ Contributing / Ideas?
If you’d like to help with:

Instagram parsing (reels/captions)

Backend integration (Node.js or Firebase?)

UX feedback or UI enhancements

...feel free to open an issue or start a discussion!

📌 License
MIT — Feel free to use, adapt, and improve.

