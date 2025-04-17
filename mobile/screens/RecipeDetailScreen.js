// screens/RecipeDetailScreen.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, ActivityIndicator, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../config';

export default function RecipeDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [servings, setServings] = useState(0);

  useEffect(() => {
    fetchRecipe();
  }, []);

  const fetchRecipe = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/recipes/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch recipe');
      }
      
      const data = await response.json();
      setRecipe(data);
      setServings(data.servings || 4);
      setError(null);
    } catch (err) {
      setError('Could not load recipe details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const scaleRecipe = async (newServings) => {
    if (newServings <= 0) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/recipes/${id}/scale/${newServings}`);
      
      if (!response.ok) {
        throw new Error('Failed to scale recipe');
      }
      
      const data = await response.json();
      setRecipe(data);
      setServings(newServings);
    } catch (err) {
      Alert.alert('Error', 'Could not scale recipe');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteRecipe = async () => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this recipe?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${API_URL}/api/recipes/${id}`, {
                method: 'DELETE'
              });
              
              if (!response.ok) {
                throw new Error('Failed to delete recipe');
              }
              
              navigation.goBack();
            } catch (err) {
              Alert.alert('Error', 'Could not delete recipe');
              console.error(err);
            }
          }
        }
      ]
    );
  };

  if (loading && !recipe) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#ff6b6b" />
      </View>
    );
  }

  if (error && !recipe) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchRecipe}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!recipe) return null;

  return (
    <ScrollView style={styles.container}>
      {recipe.image ? (
        <Image source={{ uri: recipe.image }} style={styles.recipeImage} />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Ionicons name="restaurant-outline" size={60} color="#adb5bd" />
        </View>
      )}
      
      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{recipe.title}</Text>
          <TouchableOpacity onPress={deleteRecipe}>
            <Ionicons name="trash-outline" size={24} color="#dc3545" />
          </TouchableOpacity>
        </View>
        
        {recipe.description && (
          <Text style={styles.description}>{recipe.description}</Text>
        )}
        
        <View style={styles.metaInfo}>
          {(recipe.prepTime || recipe.cookTime) && (
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={18} color="#6c757d" />
              <Text style={styles.metaText}>
                {recipe.prepTime ? `Prep: ${recipe.prepTime}m ` : ''}
                {recipe.cookTime ? `Cook: ${recipe.cookTime}m` : ''}
              </Text>
            </View>
          )}
          
          <View style={styles.servingsContainer}>
            <TouchableOpacity 
              style={styles.servingButton}
              onPress={() => scaleRecipe(servings - 1)}
              disabled={servings <= 1}
            >
              <Ionicons name="remove" size={18} color={servings <= 1 ? '#adb5bd' : '#ff6b6b'} />
            </TouchableOpacity>
            
            <View style={styles.metaItem}>
              <Ionicons name="people-outline" size={18} color="#6c757d" />
              <Text style={styles.metaText}>{servings} servings</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.servingButton}
              onPress={() => scaleRecipe(servings + 1)}
            >
              <Ionicons name="add" size={18} color="#ff6b6b" />
            </TouchableOpacity>
          </View>
        </View>
        
        {recipe.sourceUrl && (
          <Text style={styles.source}>
            Source: {recipe.sourceUrl}
          </Text>
        )}
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ingredients</Text>
          <View style={styles.divider} />
          
          {recipe.ingredients && recipe.ingredients.map((ingredient, index) => (
            <View key={index} style={styles.ingredient}>
              <Text style={styles.ingredientAmount}>
                {ingredient.amount} {ingredient.unit}
              </Text>
              <Text style={styles.ingredientName}>
                {ingredient.name}
                {ingredient.notes ? ` (${ingredient.notes})` : ''}
              </Text>
            </View>
          ))}
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          <View style={styles.divider} />
          
          {recipe.steps && recipe.steps.map((step, index) => (
            <View key={index} style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{step.number}</Text>
              </View>
              <Text style={styles.stepText}>{step.instruction}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  recipeImage: {
    width: '100%',
    height: 250,
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#343a40',
    flex: 1,
  },
  description: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 15,
    lineHeight: 22,
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 14,
    color: '#6c757d',
    marginLeft: 6,
  },
  servingsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  servingButton: {
    padding: 5,
  },
  source: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#343a40',
    marginBottom: 5,
  },
  divider: {
    height: 1,
    backgroundColor: '#dee2e6',
    marginBottom: 15,
  },
  ingredient: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  ingredientAmount: {
    width: 100,
    fontSize: 16,
    fontWeight: '500',
    color: '#495057',
  },
  ingredientName: {
    flex: 1,
    fontSize: 16,
    color: '#495057',
  },
  step: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ff6b6b',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  stepNumberText: {
    color: '#fff',
    fontWeight: '600',
  },
  stepText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: '#495057',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#ff6b6b',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryText: {
    color: '#fff',
    fontWeight: '500',
  },
});
