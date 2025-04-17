// screens/HomeScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recipe Keeper</Text>
      <Text style={styles.subtitle}>Your personal recipe collection</Text>
      
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => navigation.navigate('Recipes', { screen: 'AddRecipe' })}
        >
          <Ionicons name="create-outline" size={32} color="#fff" />
          <Text style={styles.actionText}>Add Recipe</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => navigation.navigate('Recipes', { screen: 'UrlParser' })}
        >
          <Ionicons name="globe-outline" size={32} color="#fff" />
          <Text style={styles.actionText}>Import from URL</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => navigation.navigate('Recipes', { screen: 'RecipeList' })}
        >
          <Ionicons name="list-outline" size={32} color="#fff" />
          <Text style={styles.actionText}>View All Recipes</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#343a40',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    color: '#6c757d',
  },
  actionsContainer: {
    width: '100%',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff6b6b',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  actionText: {
    color: '#fff',
    marginLeft: 15,
    fontSize: 18,
    fontWeight: '500',
  },
});
