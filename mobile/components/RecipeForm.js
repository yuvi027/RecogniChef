import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import IngredientItem from './IngredientItem';
import StepItem from './StepItem';

const RecipeForm = ({ 
  initialData = {}, 
  onSubmit,
  isLoading = false
}) => {
  // Default empty recipe structure
  const emptyRecipe = {
    title: '',
    description: '',
    prepTime: '',
    cookTime: '',
    servings: '4',
    ingredients: [],
    steps: [],
    notes: '',
    category: '',
    tags: [],
    imageUrl: '',
  };

  // State for the form
  const [recipe, setRecipe] = useState({...emptyRecipe, ...initialData});
  
  // State for adding new ingredients
  const [newIngredient, setNewIngredient] = useState({
    name: '',
    quantity: '',
    unit: '',
    notes: ''
  });
  
  // State for adding new steps
  const [newStep, setNewStep] = useState('');
  
  // State for adding new tags
  const [newTag, setNewTag] = useState('');

  // Update form if initialData changes
  useEffect(() => {
    if (Object.keys(initialData).length > 0) {
      setRecipe({...emptyRecipe, ...initialData});
    }
  }, [initialData]);

  // Handle text input changes
  const handleInputChange = (name, value) => {
    setRecipe({...recipe, [name]: value});
  };

  // Handle adding a new ingredient
  const handleAddIngredient = () => {
    if (!newIngredient.name.trim()) {
      Alert.alert('Error', 'Please enter an ingredient name');
      return;
    }
    
    const ingredient = {
      id: Date.now().toString(),
      name: newIngredient.name.trim(),
      quantity: newIngredient.quantity.trim(),
      unit: newIngredient.unit.trim(),
      notes: newIngredient.notes.trim()
    };
    
    setRecipe({
      ...recipe,
      ingredients: [...recipe.ingredients, ingredient]
    });
    
    // Reset the new ingredient form
    setNewIngredient({name: '', quantity: '', unit: '', notes: ''});
  };

  // Handle editing an ingredient
  const handleEditIngredient = (id) => {
    const ingredient = recipe.ingredients.find(item => item.id === id);
    
    if (ingredient) {
      setNewIngredient({
        name: ingredient.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        notes: ingredient.notes
      });
      
      // Remove the ingredient being edited
      handleDeleteIngredient(id);
    }
  };

  // Handle deleting an ingredient
  const handleDeleteIngredient = (id) => {
    setRecipe({
      ...recipe,
      ingredients: recipe.ingredients.filter(item => item.id !== id)
    });
  };

  // Handle adding a new step
  const handleAddStep = () => {
    if (!newStep.trim()) {
      Alert.alert('Error', 'Please enter a step instruction');
      return;
    }
    
    const step = {
      id: Date.now().toString(),
      instruction: newStep.trim(),
      timers: []
    };
    
    setRecipe({
      ...recipe,
      steps: [...recipe.steps, step]
    });
    
    // Reset the new step input
    setNewStep('');
  };

  // Handle editing a step
  const handleEditStep = (id) => {
    const step = recipe.steps.find(item => item.id === id);
    
    if (step) {
      setNewStep(step.instruction);
      
      // Remove the step being edited
      handleDeleteStep(id);
    }
  };

  // Handle deleting a step
  const handleDeleteStep = (id) => {
    setRecipe({
      ...recipe,
      steps: recipe.steps.filter(item => item.id !== id)
    });
  };

  // Handle adding a new tag
  const handleAddTag = () => {
    if (!newTag.trim()) return;
    
    if (!recipe.tags.includes(newTag.trim())) {
      setRecipe({
        ...recipe,
        tags: [...recipe.tags, newTag.trim()]
      });
    }
    
    setNewTag('');
  };

  // Handle removing a tag
  const handleRemoveTag = (tagToRemove) => {
    setRecipe({
      ...recipe,
      tags: recipe.tags.filter(tag => tag !== tagToRemove)
    });
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!recipe.title.trim()) {
      Alert.alert('Error', 'Recipe title is required');
      return;
    }
    
    if (recipe.ingredients.length === 0) {
      Alert.alert('Error', 'At least one ingredient is required');
      return;
    }
    
    if (recipe.steps.length === 0) {
      Alert.alert('Error', 'At least one step is required');
      return;
    }
    
    onSubmit(recipe);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={100}
    >
      <ScrollView style={styles.scrollView}>
        {/* Title */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Recipe Title *</Text>
          <TextInput
            style={styles.input}
            value={recipe.title}
            onChangeText={(text) => handleInputChange('title', text)}
            placeholder="Enter recipe title"
          />
        </View>
        
        {/* Description */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={recipe.description}
            onChangeText={(text) => handleInputChange('description', text)}
            placeholder="Enter a brief description"
            multiline
            numberOfLines={3}
          />
        </View>
        
        {/* Prep Time, Cook Time, Servings */}
        <View style={styles.row}>
          <View style={[styles.formGroup, styles.column]}>
            <Text style={styles.label}>Prep Time (mins)</Text>
            <TextInput
              style={styles.input}
              value={recipe.prepTime}
              onChangeText={(text) => handleInputChange('prepTime', text)}
              placeholder="e.g., 15"
              keyboardType="numeric"
            />
          </View>
          
          <View style={[styles.formGroup, styles.column]}>
            <Text style={styles.label}>Servings</Text>
            <TextInput
              style={styles.input}
              value={recipe.servings}
              onChangeText={(text) => handleInputChange('servings', text)}
              placeholder="e.g., 4"
              keyboardType="numeric"
            />
          </View>
        </View>
        
        {/* Category */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Category</Text>
          <TextInput
            style={styles.input}
            value={recipe.category}
            onChangeText={(text) => handleInputChange('category', text)}
            placeholder="e.g., Dinner, Dessert"
          />
        </View>
        
        {/* Tags */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Tags</Text>
          <View style={styles.tagsContainer}>
            {recipe.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
                <TouchableOpacity onPress={() => handleRemoveTag(tag)}>
                  <Ionicons name="close-circle" size={18} color="#757575" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
          
          <View style={styles.tagInput}>
            <TextInput
              style={[styles.input, {flex: 1}]}
              value={newTag}
              onChangeText={setNewTag}
              placeholder="Add a tag"
              onSubmitEditing={handleAddTag}
            />
            <TouchableOpacity style={styles.addButton} onPress={handleAddTag}>
              <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Ingredients */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Ingredients *</Text>
          
          {recipe.ingredients.map((item, index) => (
            <IngredientItem
              key={item.id}
              ingredient={item.name}
              quantity={item.quantity}
              unit={item.unit}
              notes={item.notes}
              editable={true}
              onEdit={() => handleEditIngredient(item.id)}
              onDelete={() => handleDeleteIngredient(item.id)}
            />
          ))}
          
          <View style={styles.ingredientForm}>
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.smallInput]}
                value={newIngredient.quantity}
                onChangeText={(text) => setNewIngredient({...newIngredient, quantity: text})}
                placeholder="Qty"
                keyboardType="numeric"
              />
              
              <TextInput
                style={[styles.input, styles.smallInput]}
                value={newIngredient.unit}
                onChangeText={(text) => setNewIngredient({...newIngredient, unit: text})}
                placeholder="Unit"
              />
              
              <TextInput
                style={[styles.input, {flex: 1}]}
                value={newIngredient.name}
                onChangeText={(text) => setNewIngredient({...newIngredient, name: text})}
                placeholder="Ingredient name *"
              />
            </View>
            
            <View style={styles.row}>
              <TextInput
                style={[styles.input, {flex: 1}]}
                value={newIngredient.notes}
                onChangeText={(text) => setNewIngredient({...newIngredient, notes: text})}
                placeholder="Notes (optional, e.g., chopped, diced)"
              />
              
              <TouchableOpacity style={styles.addButton} onPress={handleAddIngredient}>
                <Ionicons name="add" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        {/* Steps */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Steps *</Text>
          
          {recipe.steps.map((step, index) => (
            <StepItem
              key={step.id}
              stepNumber={index + 1}
              instruction={step.instruction}
              editable={true}
              onEdit={() => handleEditStep(step.id)}
              onDelete={() => handleDeleteStep(step.id)}
            />
          ))}
          
          <View style={styles.stepForm}>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={newStep}
              onChangeText={setNewStep}
              placeholder="Enter step instruction"
              multiline
              numberOfLines={3}
            />
            
            <TouchableOpacity style={styles.addButton} onPress={handleAddStep}>
              <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Notes */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Additional Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={recipe.notes}
            onChangeText={(text) => handleInputChange('notes', text)}
            placeholder="Any additional notes about the recipe"
            multiline
            numberOfLines={4}
          />
        </View>
        
        {/* Submit Button */}
        <TouchableOpacity 
          style={[styles.submitButton, isLoading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <Text style={styles.submitButtonText}>
            {isLoading ? 'Saving...' : 'Save Recipe'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

RecipeForm.propTypes = {
  initialData: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#424242',
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    padding: 10,
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  column: {
    flex: 1,
    marginRight: 8,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#212121',
  },
  ingredientForm: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  smallInput: {
    width: 80,
    marginRight: 8,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    width: 44,
    height: 44,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  stepForm: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    marginRight: 4,
    color: '#388E3C',
  },
  tagInput: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 4,
    paddingVertical: 14,
    alignItems: 'center',
    marginVertical: 24,
  },
  disabledButton: {
    backgroundColor: '#9E9E9E',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default RecipeForm;