import re
import json
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
from typing import Dict, List, Optional, Tuple
import logging

class RecipeParser:
    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        # Common measurement units and their variations
        self.units = {
            'cup': ['cup', 'cups', 'c'],
            'tablespoon': ['tablespoon', 'tablespoons', 'tbsp', 'tbs', 'T'],
            'teaspoon': ['teaspoon', 'teaspoons', 'tsp', 't'],
            'pound': ['pound', 'pounds', 'lb', 'lbs'],
            'ounce': ['ounce', 'ounces', 'oz'],
            'gram': ['gram', 'grams', 'g'],
            'kilogram': ['kilogram', 'kilograms', 'kg'],
            'liter': ['liter', 'liters', 'l'],
            'milliliter': ['milliliter', 'milliliters', 'ml'],
            'piece': ['piece', 'pieces', 'pc', 'pcs'],
            'clove': ['clove', 'cloves'],
            'slice': ['slice', 'slices'],
            'pinch': ['pinch', 'pinches']
        }
        
        # Fraction patterns
        self.fraction_map = {
            '½': '1/2', '¼': '1/4', '¾': '3/4', '⅓': '1/3', '⅔': '2/3',
            '⅛': '1/8', '⅜': '3/8', '⅝': '5/8', '⅜': '7/8'
        }
    
    def fetch_page(self, url: str) -> Optional[BeautifulSoup]:
        """Fetch and parse a webpage"""
        try:
            response = requests.get(url, headers=self.headers, timeout=10)
            response.raise_for_status()
            return BeautifulSoup(response.content, 'html.parser')
        except Exception as e:
            logging.error(f"Error fetching {url}: {e}")
            return None
    
    def extract_json_ld(self, soup: BeautifulSoup) -> Optional[Dict]:
        """Extract recipe data from JSON-LD structured data"""
        json_scripts = soup.find_all('script', type='application/ld+json')
        
        for script in json_scripts:
            try:
                data = json.loads(script.string)
                
                # Handle both single objects and arrays
                if isinstance(data, list):
                    data = data[0] if data else {}
                
                # Look for Recipe type or nested Recipe
                if data.get('@type') == 'Recipe':
                    return data
                elif 'Recipe' in str(data):
                    # Search nested structure
                    recipe_data = self._find_recipe_in_nested(data)
                    if recipe_data:
                        return recipe_data
                        
            except (json.JSONDecodeError, AttributeError):
                continue
        
        return None
    
    def _find_recipe_in_nested(self, data) -> Optional[Dict]:
        """Recursively search for Recipe type in nested JSON-LD"""
        if isinstance(data, dict):
            if data.get('@type') == 'Recipe':
                return data
            for value in data.values():
                result = self._find_recipe_in_nested(value)
                if result:
                    return result
        elif isinstance(data, list):
            for item in data:
                result = self._find_recipe_in_nested(item)
                if result:
                    return result
        return None
    
    def extract_microdata(self, soup: BeautifulSoup) -> Dict:
        """Extract recipe data from microdata"""
        recipe_data = {}
        
        # Look for recipe microdata
        recipe_elem = soup.find(attrs={'itemtype': re.compile(r'schema\.org/Recipe')})
        if not recipe_elem:
            return recipe_data
        
        # Extract basic info
        name = recipe_elem.find(attrs={'itemprop': 'name'})
        if name:
            recipe_data['name'] = name.get_text(strip=True)
        
        description = recipe_elem.find(attrs={'itemprop': 'description'})
        if description:
            recipe_data['description'] = description.get_text(strip=True)
        
        # Extract ingredients
        ingredients = recipe_elem.find_all(attrs={'itemprop': 'recipeIngredient'})
        if ingredients:
            recipe_data['recipeIngredient'] = [ing.get_text(strip=True) for ing in ingredients]
        
        # Extract instructions
        instructions = recipe_elem.find_all(attrs={'itemprop': 'recipeInstructions'})
        if instructions:
            recipe_data['recipeInstructions'] = []
            for inst in instructions:
                text = inst.get_text(strip=True)
                if text:
                    recipe_data['recipeInstructions'].append({'text': text})
        
        return recipe_data
    
    def extract_fallback(self, soup: BeautifulSoup) -> Dict:
        """Fallback extraction using common HTML patterns"""
        recipe_data = {}
        
        # Try to find title
        title_selectors = [
            'h1.recipe-title', 'h1.entry-title', '.recipe-header h1',
            'h1', '.recipe-title', '[class*="recipe"] h1'
        ]
        
        for selector in title_selectors:
            title = soup.select_one(selector)
            if title:
                recipe_data['name'] = title.get_text(strip=True)
                break
        
        # Try to find ingredients
        ingredient_selectors = [
            '.recipe-ingredients li', '.ingredients li', '[class*="ingredient"] li',
            '.recipe-ingredients p', '.ingredients p', '[class*="ingredient"] p'
        ]
        
        for selector in ingredient_selectors:
            ingredients = soup.select(selector)
            if ingredients:
                recipe_data['recipeIngredient'] = [ing.get_text(strip=True) for ing in ingredients]
                break
        
        # Try to find instructions
        instruction_selectors = [
            '.recipe-instructions li', '.instructions li', '[class*="instruction"] li',
            '.recipe-instructions p', '.instructions p', '[class*="instruction"] p',
            '.recipe-directions li', '.directions li', '[class*="direction"] li'
        ]
        
        for selector in instruction_selectors:
            instructions = soup.select(selector)
            if instructions:
                recipe_data['recipeInstructions'] = []
                for inst in instructions:
                    text = inst.get_text(strip=True)
                    if text and len(text) > 10:  # Filter out very short text
                        recipe_data['recipeInstructions'].append({'text': text})
                break
        
        return recipe_data
    
    def parse_ingredient(self, ingredient_text: str) -> Dict:
        """Parse individual ingredient into components"""
        # Normalize fractions
        normalized_text = ingredient_text
        for unicode_frac, ascii_frac in self.fraction_map.items():
            normalized_text = normalized_text.replace(unicode_frac, ascii_frac)
        
        # Pattern to match quantity, unit, and ingredient
        # Examples: "2 cups flour", "1/2 tsp salt", "3 large eggs"
        pattern = r'^(\d+(?:\s*\/\s*\d+)?(?:\.\d+)?)\s*([a-zA-Z]+)?\s+(.+)$'
        match = re.match(pattern, normalized_text.strip())
        
        if match:
            quantity_str, unit, ingredient = match.groups()
            
            # Parse quantity (handle fractions)
            quantity = self._parse_quantity(quantity_str)
            
            # Normalize unit
            normalized_unit = self._normalize_unit(unit) if unit else None
            
            return {
                'original': ingredient_text,
                'quantity': quantity,
                'unit': normalized_unit,
                'ingredient': ingredient.strip(),
                'parsed': True
            }
        else:
            # If no quantity found, try to extract just unit and ingredient
            unit_pattern = r'^([a-zA-Z]+)\s+(.+)$'
            unit_match = re.match(unit_pattern, normalized_text.strip())
            
            if unit_match:
                unit, ingredient = unit_match.groups()
                normalized_unit = self._normalize_unit(unit)
                if normalized_unit:
                    return {
                        'original': ingredient_text,
                        'quantity': None,
                        'unit': normalized_unit,
                        'ingredient': ingredient.strip(),
                        'parsed': True
                    }
            
            # Return unparsed if no pattern matches
            return {
                'original': ingredient_text,
                'quantity': None,
                'unit': None,
                'ingredient': ingredient_text.strip(),
                'parsed': False
            }
    
    def _parse_quantity(self, quantity_str: str) -> float:
        """Parse quantity string to float (handles fractions)"""
        quantity_str = quantity_str.strip()
        
        if '/' in quantity_str:
            # Handle fractions
            parts = quantity_str.split('/')
            if len(parts) == 2:
                try:
                    return float(parts[0]) / float(parts[1])
                except ValueError:
                    return 1.0
        
        try:
            return float(quantity_str)
        except ValueError:
            return 1.0
    
    def _normalize_unit(self, unit: str) -> Optional[str]:
        """Normalize unit to standard form"""
        if not unit:
            return None
        
        unit_lower = unit.lower().strip()
        
        for standard_unit, variations in self.units.items():
            if unit_lower in variations:
                return standard_unit
        
        return unit_lower  # Return original if not found
    
    def scale_recipe(self, recipe_data: Dict, scale_factor: float) -> Dict:
        """Scale recipe quantities by given factor"""
        scaled_recipe = recipe_data.copy()
        
        if 'recipeIngredient' in scaled_recipe:
            scaled_ingredients = []
            for ingredient in scaled_recipe['recipeIngredient']:
                if isinstance(ingredient, str):
                    parsed = self.parse_ingredient(ingredient)
                    if parsed['parsed'] and parsed['quantity']:
                        new_quantity = parsed['quantity'] * scale_factor
                        scaled_text = f"{new_quantity:.2f}".rstrip('0').rstrip('.')
                        if parsed['unit']:
                            scaled_text += f" {parsed['unit']}"
                        scaled_text += f" {parsed['ingredient']}"
                        scaled_ingredients.append(scaled_text)
                    else:
                        scaled_ingredients.append(ingredient)
                else:
                    scaled_ingredients.append(ingredient)
            
            scaled_recipe['recipeIngredient'] = scaled_ingredients
        
        # Scale yield if present
        if 'recipeYield' in scaled_recipe:
            try:
                original_yield = float(scaled_recipe['recipeYield'])
                scaled_recipe['recipeYield'] = str(int(original_yield * scale_factor))
            except (ValueError, TypeError):
                pass
        
        return scaled_recipe
    
    def generate_shopping_list(self, recipes: List[Dict]) -> Dict[str, List[Dict]]:
        """Generate consolidated shopping list from multiple recipes"""
        shopping_list = {}
        
        for recipe in recipes:
            if 'recipeIngredient' not in recipe:
                continue
            
            for ingredient in recipe['recipeIngredient']:
                if isinstance(ingredient, str):
                    parsed = self.parse_ingredient(ingredient)
                    ingredient_name = parsed['ingredient'].lower()
                    
                    if ingredient_name not in shopping_list:
                        shopping_list[ingredient_name] = []
                    
                    shopping_list[ingredient_name].append({
                        'recipe': recipe.get('name', 'Unknown Recipe'),
                        'quantity': parsed['quantity'],
                        'unit': parsed['unit'],
                        'original': parsed['original']
                    })
        
        return shopping_list
    
    def parse_recipe_from_url(self, url: str) -> Optional[Dict]:
        """Main method to parse recipe from URL"""
        soup = self.fetch_page(url)
        if not soup:
            return None
        
        # Try JSON-LD first (most reliable)
        recipe_data = self.extract_json_ld(soup)
        if recipe_data:
            logging.info("Extracted recipe using JSON-LD")
            return self._clean_recipe_data(recipe_data)
        
        # Try microdata
        recipe_data = self.extract_microdata(soup)
        if recipe_data and recipe_data.get('name'):
            logging.info("Extracted recipe using microdata")
            return self._clean_recipe_data(recipe_data)
        
        # Fallback to pattern matching
        recipe_data = self.extract_fallback(soup)
        if recipe_data and recipe_data.get('name'):
            logging.info("Extracted recipe using fallback method")
            return self._clean_recipe_data(recipe_data)
        
        logging.warning("Could not extract recipe data")
        return None
    
    def _clean_recipe_data(self, data: Dict) -> Dict:
        """Clean and standardize recipe data"""
        cleaned = {}
        
        # Standard fields
        if 'name' in data:
            cleaned['name'] = str(data['name']).strip()
        
        if 'description' in data:
            cleaned['description'] = str(data['description']).strip()
        
        # Handle ingredients
        if 'recipeIngredient' in data:
            ingredients = data['recipeIngredient']
            if isinstance(ingredients, list):
                cleaned['ingredients'] = [str(ing).strip() for ing in ingredients if ing]
            elif isinstance(ingredients, str):
                cleaned['ingredients'] = [ingredients.strip()]
        
        # Handle instructions
        if 'recipeInstructions' in data:
            instructions = data['recipeInstructions']
            cleaned_instructions = []
            
            if isinstance(instructions, list):
                for inst in instructions:
                    if isinstance(inst, dict):
                        text = inst.get('text', '')
                    else:
                        text = str(inst)
                    
                    if text.strip():
                        cleaned_instructions.append(text.strip())
            
            cleaned['instructions'] = cleaned_instructions
        
        # Additional metadata
        for field in ['prepTime', 'cookTime', 'totalTime', 'recipeYield', 'recipeCategory', 'recipeCuisine']:
            if field in data:
                cleaned[field] = data[field]
        
        return cleaned

# Example usage and testing
def main():
    parser = RecipeParser()
    
    # Test URLs (replace with actual recipe URLs)
    test_urls = [
        "https://www.allrecipes.com/recipe/213742/cheesy-chicken-broccoli-casserole/",
        "https://cooking.nytimes.com/recipes/1015987-chocolate-chip-cookies"
    ]
    
    for url in test_urls:
        print(f"\nParsing: {url}")
        recipe = parser.parse_recipe_from_url(url)
        
        if recipe:
            print(f"Recipe: {recipe.get('name', 'Unknown')}")
            print(f"Ingredients: {len(recipe.get('ingredients', []))}")
            print(f"Instructions: {len(recipe.get('instructions', []))}")
            
            # Test scaling
            scaled = parser.scale_recipe(recipe, 2.0)
            print("Scaled recipe by 2x")
            
            # Test ingredient parsing
            if 'ingredients' in recipe:
                print("\nParsed ingredients:")
                for ing in recipe['ingredients'][:3]:  # Show first 3
                    parsed = parser.parse_ingredient(ing)
                    print(f"  {parsed}")
        else:
            print("Failed to parse recipe")

if __name__ == "__main__":
    main()