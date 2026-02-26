// InstagramParser.js
class InstagramParser {
    constructor() {
        this.ingredientParser = new IngredientParser();
    }

    async fetchPage(url) {
        try {
            const proxyUrl = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`;
            const response = await fetch(proxyUrl);

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const html = await response.text();
            const parser = new DOMParser();
            return parser.parseFromString(html, 'text/html');
        } catch (err) {
            console.error('Error fetching Instagram page:', err);
            throw new Error('Unable to fetch Instagram post.');
        }
    }

    async parseRecipeFromUrl(url) {
        const doc = await this.fetchPage(url);

        // Extract the embedded JSON
        const scripts = doc.querySelectorAll('script[type="text/javascript"]');
        let sharedData = null;

        for (let script of scripts) {
            const text = script.textContent.trim();
            if (text.startsWith('window._sharedData')) {
                const jsonText = text.replace(/^window\._sharedData = /, '').slice(0, -1);
                try {
                    sharedData = JSON.parse(jsonText);
                    break;
                } catch (e) {
                    continue;
                }
            }
        }

        if (!sharedData) throw new Error('Could not extract Instagram post data.');

        const postData = sharedData.entry_data?.PostPage?.[0]?.graphql?.shortcode_media;
        if (!postData) throw new Error('No post data found.');

        const captionEdges = postData.edge_media_to_caption?.edges;
        let captionText = '';
        if (captionEdges && captionEdges.length > 0) {
            captionText = captionEdges[0].node.text;
        }

        if (!captionText) throw new Error('No caption text found.');

        // Split caption into lines
        const lines = captionText.split('\n').map(l => l.trim()).filter(l => l);

        // Heuristic: lines before 'step' or 'instructions' are ingredients
        const ingredients = [];
        const instructions = [];
        let mode = 'ingredients';

        for (let line of lines) {
            const lower = line.toLowerCase();
            if (lower.includes('step') || lower.includes('instruction') || lower.includes('directions')) {
                mode = 'instructions';
            }

            if (mode === 'ingredients') {
                // Use IngredientParser to parse each line
                const parsed = this.ingredientParser.parseIngredient(line);
                ingredients.push(parsed.parsed ? this.ingredientParser.scaleIngredient(parsed, 1) : line);
            } else {
                instructions.push(line);
            }
        }

        const recipe = {
            name: postData.title || 'Instagram Recipe',
            ingredients,
            instructions,
            servings: 'Not specified',
            prepTime: 'Not specified',
            cookTime: 'Not specified',
            url
        };

        return recipe;
    }
}

// Usage:
// const instagramParser = new InstagramParser();
// instagramParser.parseRecipeFromUrl('https://www.instagram.com/p/...').then(recipe => console.log(recipe));