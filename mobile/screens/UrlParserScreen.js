// // screens/UrlParserScreen.js
// import React, { useState } from 'react';
// import { 
//   View, Text, StyleSheet, TextInput, 
//   TouchableOpacity, ScrollView, ActivityIndicator 
// } from 'react-native';
// import { API_URL } from '../config';

// export default function UrlParserScreen({ navigation }) {
//   const [url, setUrl] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const parseRecipeUrl = async () => {
//     if (!url.trim()) {
//       setError('Please enter a URL');
//       return;
//     }
    
//     if (!url.startsWith('http')) {
//       setError('Please enter a valid URL');
//       return;
//     }
    
//     try {
//       setLoading(true);
//       setError(null);
      
//       const response = await fetch(`${API_URL}/api/parser/url`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ url })
//       });
      
//       if (!response.ok) {
//         throw new Error('Failed to parse recipe');
//       }
      
//       const parsedRecipe = await response.json();
      
//       // Navigate to add recipe screen with pre-filled data
//       navigation.navigate('AddRecipe', { parsedRecipe });
//     } catch (err) {
//       setError('Could not parse recipe from this URL. Please try another URL or enter recipe manually.');
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <ScrollView style={styles.container}>
//       <Text style={styles.title}>Import Recipe from Website</Text>
//       <Text style={styles.description}>
//         Enter the URL of a recipe page to automatically import it.
//       </Text>
      
//       <View style={styles.inputContainer}>
//         <TextInput
//           style={styles.input}
//           value={url}
//           onChangeText={setUrl}
//           placeholder="https://example.com/recipe"
//           autoCapitalize="none"
//           autoCorrect={false}
//           keyboardType="url"
//         />
//       </View>
      
//       {error && (
//         <Text style={styles.errorText}>{error}</Text>
//       )}
      
//       <TouchableOpacity
//         style={styles.button}
//         onPress={parseRecipeUrl}
//         disabled={loading}
//       >
//         {loading ? (
//           <ActivityIndicator size="small" color="#fff" />
//         ) : (
//           <Text style={styles.buttonText}>Parse Recipe</Text>
//         )}
//       </TouchableOpacity>
      
//       <TouchableOpacity
//         style={styles.secondaryButton}
//         onPress={() => navigation.navigate('AddRecipe')}
//       >
//         <Text style={styles.secondaryButtonText}>Enter Recipe Manually</Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     backgroundColor: '#f8f9fa',
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 10,
//     color: '#343a40',
//   },
//   description: {
//     fontSize: 16,
//     marginBottom: 20,
//     color: '#6c757d',
//     lineHeight: 22,
//   },
//   inputContainer: {
//     marginBottom: 20,
//   },
//   input: {
//     backgroundColor: '#fff',
//     borderWidth: 1,
//     borderColor: '#ced4da',
//     borderRadius: 5,
//     padding: 12,
//     fontSize: 16,
//   },
//   button: {
//     backgroundColor: '#ff6b6b',
//     padding: 15,
//     borderRadius: 5,
//     alignItems: 'center',
//     marginBottom: 15,
//   },
//   buttonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '500',
//   },
//   secondaryButton: {
//     backgroundColor: 'transparent',
//     padding: 15,
//     borderRadius: 5,
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#ff6b6b',
//   },
//   secondaryButtonText: {
//     color: '#ff6b6b',
//     fontSize: 16,
//     fontWeight: '500',
//   },
//   errorText: {
//     color: '#dc3545',
//     marginBottom: 15,
//   },
// });

// mobile/screens/UrlParserScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { parseRecipeUrl } from '../services/api';
import { UI_CONFIG } from '../config';

export default function UrlParserScreen({ navigation }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleParse = async () => {
    if (!url.trim()) {
      Alert.alert('Error', 'Please enter a valid URL');
      return;
    }

    try {
      setLoading(true);
      const parsedRecipe = await parseRecipeUrl(url);
      
      navigation.navigate('AddRecipe', { parsedRecipe });
    } catch (err) {
      console.error(err);
      Alert.alert(
        'Error',
        'Could not parse recipe from this URL. Please try another URL or enter the recipe manually.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Import Recipe from URL</Text>
        
        <Text style={styles.description}>
          Enter a URL from a recipe website to automatically import it. The parser will attempt to extract the recipe details.
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
          
          <TouchableOpacity
            style={[styles.clearButton, !url && styles.hidden]}
            onPress={() => setUrl('')}
          >
            <Ionicons name="close-circle" size={20} color="#6c757d" />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity
          style={styles.parseButton}
          onPress={handleParse}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="download-outline" size={20} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Import Recipe</Text>
            </>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.manualButton}
          onPress={() => navigation.navigate('AddRecipe')}
        >
          <Text style={styles.manualButtonText}>Enter Recipe Manually</Text>
        </TouchableOpacity>
        
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Tips:</Text>
          <Text style={styles.tipText}>• Recipe import works best with popular recipe websites</Text>
          <Text style={styles.tipText}>• You may need to adjust some details after import</Text>
          <Text style={styles.tipText}>• Make sure the URL leads directly to a recipe page</Text>
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
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 20,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    flex: r,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 5,
    padding: 12,
    fontSize: 16,
  },
  clearButton: {
    position: 'absolute',
    right: 12,
  },
  hidden: {
    display: 'none',
  },
  parseButton: {
    backgroundColor: UI_CONFIG.PRIMARY_COLOR,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 5,
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 8,
  },
  manualButton: {
    padding: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  manualButtonText: {
    color: UI_CONFIG.SECONDARY_COLOR,
    fontSize: 16,
    fontWeight: '500',
  },
  tipsContainer: {
    backgroundColor: '#e9ecef',
    padding: 15,
    borderRadius: 5,
    marginTop: 10,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#495057',
  },
  tipText: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 5,
    lineHeight: 20,
  },
});