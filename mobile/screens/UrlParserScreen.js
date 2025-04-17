// screens/UrlParserScreen.js
import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TextInput, 
  TouchableOpacity, ScrollView, ActivityIndicator 
} from 'react-native';
import { API_URL } from '../config';

export default function UrlParserScreen({ navigation }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const parseRecipeUrl = async () => {
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }
    
    if (!url.startsWith('http')) {
      setError('Please enter a valid URL');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/api/parser/url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url })
      });
      
      if (!response.ok) {
        throw new Error('Failed to parse recipe');
      }
      
      const parsedRecipe = await response.json();
      
      // Navigate to add recipe screen with pre-filled data
      navigation.navigate('AddRecipe', { parsedRecipe });
    } catch (err) {
      setError('Could not parse recipe from this URL. Please try another URL or enter recipe manually.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Import Recipe from Website</Text>
      <Text style={styles.description}>
        Enter the URL of a recipe page to automatically import it.
      </Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={url}
          onChangeText={setUrl}
          placeholder="https://example.com/recipe"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
        />
      </View>
      
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
      
      <TouchableOpacity
        style={styles.button}
        onPress={parseRecipeUrl}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Parse Recipe</Text>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => navigation.navigate('AddRecipe')}
      >
        <Text style={styles.secondaryButtonText}>Enter Recipe Manually</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#343a40',
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
    color: '#6c757d',
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 5,
    padding: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#ff6b6b',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ff6b6b',
  },
  secondaryButtonText: {
    color: '#ff6b6b',
    fontSize: 16,
    fontWeight: '500',
  },
  errorText: {
    color: '#dc3545',
    marginBottom: 15,
  },
});
