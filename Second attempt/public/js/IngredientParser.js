class IngredientParser {
    constructor() {
        this.fractionMap = {
            "½": "1/2",
            "⅓": "1/3",
            "⅔": "2/3",
            "¼": "1/4",
            "¾": "3/4",
            "⅛": "1/8"
        };

        this.units = [
            "cup", "cups",
            "tbsp", "tablespoon", "tablespoons",
            "tsp", "teaspoon", "teaspoons",
            "g", "kg", "oz", "lb",
            "ml", "l",
            "clove", "cloves",
            "can", "cans"
        ];
    }

    // -------------------------
    // NORMALIZATION
    // -------------------------

    normalizeText(text) {
        let normalized = text;

        for (let [unicode, ascii] of Object.entries(this.fractionMap)) {
            normalized = normalized.replaceAll(unicode, ascii);
        }

        return normalized.replace(/–|—/g, "-").trim();
    }

    tokenize(text) {
        return text.split(/\s+/);
    }

    // -------------------------
    // QUANTITY PARSING
    // -------------------------

    isWholeNumber(token) {
        return /^\d+$/.test(token);
    }

    isDecimal(token) {
        return /^\d+\.\d+$/.test(token);
    }

    isFraction(token) {
        return /^\d+\/\d+$/.test(token);
    }

    parseFraction(token) {
        const [num, denom] = token.split("/").map(Number);
        return num / denom;
    }

    parseQuantityFromTokens(tokens) {
        let quantity = 0;
        let index = 0;

        if (!tokens[index]) return { quantity: null, index };

        // Whole number or decimal
        if (this.isWholeNumber(tokens[index]) || this.isDecimal(tokens[index])) {
            quantity += parseFloat(tokens[index]);
            index++;
        }

        // Mixed fraction
        if (tokens[index] && this.isFraction(tokens[index])) {
            quantity += this.parseFraction(tokens[index]);
            index++;
        }

        // Pure fraction (like "1/2")
        else if (this.isFraction(tokens[0])) {
            quantity = this.parseFraction(tokens[0]);
            index = 1;
        }

        if (quantity === 0) return { quantity: null, index: 0 };

        return { quantity, index };
    }

    // -------------------------
    // UNIT PARSING
    // -------------------------

    parseUnit(token) {
        if (!token) return null;

        const lower = token.toLowerCase();
        return this.units.includes(lower) ? lower : null;
    }

    // -------------------------
    // MAIN PARSER
    // -------------------------

    parseIngredient(text) {
        const normalized = this.normalizeText(text);
        const tokens = this.tokenize(normalized);

        const { quantity, index } = this.parseQuantityFromTokens(tokens);

        let unit = null;
        let nextIndex = index;

        if (tokens[nextIndex] && this.parseUnit(tokens[nextIndex])) {
            unit = tokens[nextIndex].toLowerCase();
            nextIndex++;
        }

        const ingredientName = tokens.slice(nextIndex).join(" ");

        return {
            original: text,
            quantity,
            unit,
            ingredient: ingredientName,
            parsed: quantity !== null
        };
    }

    // -------------------------
    // SCALING
    // -------------------------

    scaleIngredient(ingredientObj, factor) {
        if (!ingredientObj.parsed || ingredientObj.quantity == null) {
            return ingredientObj.original;
        }

        const newQuantity = ingredientObj.quantity * factor;

        return `${this.formatQuantity(newQuantity)} ${ingredientObj.unit || ""} ${ingredientObj.ingredient}`.trim();
    }

    // -------------------------
    // FORMAT BACK TO FRACTIONS
    // -------------------------

    formatQuantity(quantity) {
        const tolerance = 0.01;
        const whole = Math.floor(quantity);
        const fraction = quantity - whole;

        const fractions = [
            { value: 1/8, str: "1/8" },
            { value: 1/4, str: "1/4" },
            { value: 1/3, str: "1/3" },
            { value: 1/2, str: "1/2" },
            { value: 2/3, str: "2/3" },
            { value: 3/4, str: "3/4" }
        ];

        for (let frac of fractions) {
            if (Math.abs(fraction - frac.value) < tolerance) {
                return whole > 0 ? `${whole} ${frac.str}` : frac.str;
            }
        }

        if (fraction < tolerance) {
            return whole.toString();
        }

        return quantity.toFixed(2).replace(/\.00$/, "");
    }
}