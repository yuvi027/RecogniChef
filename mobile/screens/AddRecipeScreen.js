// screens/AddRecipeScreen.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, Alert, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../config';
import { addRecipe } from '../services/api';


export default function AddRecipeScreen({ route, navigation }) {
  const { parsedRecipe } = route.params || {};
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [servings, setServings] = useState('4');
  const [prepTime, setPrepTime] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [ingredients, setIngredients] = useState([{ name: '', amount: '', unit: '' }]);
  const [steps, setSteps] = useState([{ number: 1, instruction: '' }]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (parsedRecipe) {
      prefillRecipeData(parsedRecipe);
    }
  }, [parsedRecipe]);

  const prefillRecipeData = (recipe) => {
    setTitle(recipe.title || '');
    setDescription(recipe.description || '');
    setServings(recipe.servings ? String(recipe.servings) : '4');
    setPrepTime(recipe.prepTime ? String(recipe.prepTime) : '');
    setCookTime(recipe.cookTime ? String(recipe.cookTime) : '');
    
    if (recipe.ingredients && recipe.ingredients.length > 0) {
      setIngredients(recipe.ingredients.map(ing => ({
        name: ing.name || '',
        amount: ing.amount ? String(ing.amount) : '',
        unit: ing.unit || ''
      })));
    }
    
    if (recipe.steps && recipe.steps.length > 0) {
      setSteps(recipe.steps.map(step => ({
        number: step.number || 1,
        instruction: step.instruction || ''
      })));
    }
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', amount: '', unit: '' }]);
  };

  const removeIngredient = (index) => {
    const updatedIngredients = [...ingredients];
    updatedIngredients.splice(index, 1);
    setIngredients(updatedIngredients);
  };

  const updateIngredient = (index, field, value) => {
    const updatedIngredients = [...ingredients];
    updatedIngredients[index][field] = value;
    setIngredients(updatedIngredients);
  };

  const addStep = () => {
    const newStepNumber = steps.length > 0 ? steps[steps.length - 1].number + 1 : 1;
    setSteps([...steps, { number: newStepNumber, instruction: '' }]);
  };

  const removeStep = (index) => {
    const updatedSteps = [...steps];
    updatedSteps.splice(index, 1);
    // Renumber steps
    updatedSteps.forEach((step, i) => {
      step.number = i + 1;
    });
    setSteps(updatedSteps);
  };

  const updateStep = (index, value) => {
    const updatedSteps = [...steps];
    updatedSteps[index].instruction = value;
    setSteps(updatedSteps);
  };

  const validateForm = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Recipe title is required');
      return false;
    }
    
    if (ingredients.length === 0 || ingredients.some(ing => !ing.name.trim())) {
      Alert.alert('Error', 'All ingredients must have at least a name');
      return false;
    }
    
    if (steps.length === 0 || steps.some(step => !step.instruction.trim())) {
      Alert.alert('Error', 'All steps must have instructions');
      return false;
    }
    
    return true;
  };

  const saveRecipe = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      const recipeData = {
        title,
        description,
        servings: parseInt(servings) || 4,
        prepTime: prepTime ? parseInt(prepTime) : undefined,
        cookTime: cookTime ? parseInt(cookTime) : undefined,
        ingredients: ingredients.map(ing => ({
          name: ing.name,
          amount: parseFloat(ing.amount) || 1,
          unit: ing.unit || '',
          notes: ing.notes || ''
        })),
        steps: steps.map(step => ({
          number: step.number,
          instruction: step.instruction
        }))
      };
      
      const response = await fetch(`${API_URL}/api/recipes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(recipeData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to save recipe');
      }
      
      const savedRecipe = await addRecipe(recipeData);

      Alert.alert(
        'Success',
        'Recipe saved successfully',
        [{ text: 'OK', onPress: () => navigation.navigate('RecipeList') }]
      );
    } catch (err) {
      Alert.alert('Error', 'Could not save recipe. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Recipe Title *</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Enter recipe title"
        />
        
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Brief description of the recipe"
          multiline
          numberOfLines={3}
        />
        
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>Servings</Text>
            <TextInput
              style={styles.input}
              value={servings}
              onChangeText={setServings}
              placeholder="4"
              keyboardType="numeric"
            />
          </View>
          
          <View style={styles.column}>
            <Text style={styles.label}>Prep Time (min)</Text>
            <TextInput
              style={styles.input}
              value={prepTime}
              onChangeText={setPrepTime}
              placeholder="15"
              keyboardType="numeric"
            />
          </View>
          
          <View style={styles.column}>
            <Text style={styles.label}>Cook Time (min)</Text>
            <TextInput
              style={styles.input}
              value={cookTime}
              onChangeText={setCookTime}
              placeholder="25"
              keyboardType="numeric"
            />
          </View>
        </View>
        
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Ingredients *</Text>
          <TouchableOpacity style={styles.addButton} onPress={addIngredient}>
            <Ionicons name="add" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        
        {ingredients.map((ingredient, index) => (
          <View key={index} style={styles.ingredientRow}>
            <View style={styles.ingredientColumn}>
              <TextInput
                style={styles.ingredientInput}
                value={ingredient.amount}
                onChangeText={(value) => updateIngredient(index, 'amount', value)}
                placeholder="Amount"
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.ingredientColumn}>
              <TextInput
                style={styles.ingredientInput}
                value={ingredient.unit}
                onChangeText={(value) => updateIngredient(index, 'unit', value)}
                placeholder="Unit"
              />
            </View>
            
            <View style={[styles.ingredientColumn, { flex: 2 }]}>
              <TextInput
                style={styles.ingredientInput}
                value={ingredient.name}
                onChangeText={(value) => updateIngredient(index, 'name', value)}
                placeholder="Ingredient name"
              />
            </View>
            
            <TouchableOpacity 
              style={styles.removeButton}
              onPress={() => removeIngredient(index)}
              disabled={ingredients.length === 1}
            >
              <Ionicons 
                name="close-circle" 
                size={24} 
                color={ingredients.length === 1 ? '#ced4da' : '#dc3545'} 
              />
            </TouchableOpacity>
          </View>
        ))}
        
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Instructions *</Text>
          <TouchableOpacity style={styles.addButton} onPress={addStep}>
            <Ionicons name="add" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        
        {steps.map((step, index) => (
          <View key={index} style={styles.stepContainer}>
            <View style={styles.stepNumberContainer}>
              <Text style={styles.stepNumber}>{step.number}</Text>
            </View>
            
            <View style={styles.stepInputContainer}>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={step.instruction}
                onChangeText={(value) => updateStep(index, value)}
                placeholder="Step instructions"
                multiline
                numberOfLines={2}
              />
            </View>
            
            <TouchableOpacity 
              style={styles.removeButton}
              onPress={() => removeStep(index)}
              disabled={steps.length === 1}
            >
              <Ionicons 
                name="close-circle" 
                size={24} 
                color={steps.length === 1 ? '#ced4da' : '#dc3545'} 
              />
            </TouchableOpacity>
          </View>
        ))}
        
        <TouchableOpacity
          style={styles.saveButton}
          onPress={saveRecipe}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Recipe</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#343a40',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    marginBottom: 15,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  column: {
    flex: 1,
    marginRight: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#343a40',
  },
  addButton: {
    backgroundColor: '#ff6b6b',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ingredientRow: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'center',
  },
  ingredientColumn: {
    flex: 1,
    marginRight: 10,
  },
  ingredientInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  removeButton: {
    padding: 5,
  },
  stepContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'flex-start',
  },
  stepNumberContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ff6b6b',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 5,
  },
  stepNumber: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  stepInputContainer: {
    flex: 1,
  },
  saveButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 30,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
