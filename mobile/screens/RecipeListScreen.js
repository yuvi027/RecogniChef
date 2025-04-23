// // screens/RecipeListScreen.js
// import React, { useEffect, useState } from 'react';
// import { 
//   View, Text, FlatList, StyleSheet, 
//   TouchableOpacity, Image, ActivityIndicator 
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { API_URL } from '../config';

// export default function RecipeListScreen({ navigation }) {
//   const [recipes, setRecipes] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     fetchRecipes();
    
//     // Set up navigation listener to refresh on focus
//     const unsubscribe = navigation.addListener('focus', () => {
//       fetchRecipes();
//     });
    
//     return unsubscribe;
//   }, [navigation]);

//   const fetchRecipes = async () => {
//     try {
//       setLoading(true);
//       const response = await fetch(`${API_URL}/api/recipes`);
      
//       if (!response.ok) {
//         throw new Error('Failed to fetch recipes');
//       }
      
//       const data = await response.json();
//       setRecipes(data);
//       setError(null);
//     } catch (err) {
//       setError('Could not load recipes. Please try again later.');
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const renderRecipeItem = ({ item }) => (
//     <TouchableOpacity
//       style={styles.recipeCard}
//       onPress={() => navigation.navigate('RecipeDetail', { id: item._id, title: item.title })}
//     >
//       <View style={styles.recipeContent}>
//         {item.image ? (
//           <Image source={{ uri: item.image }} style={styles.recipeImage} />
//         ) : (
//           <View style={styles.imagePlaceholder}>
//             <Ionicons name="restaurant-outline" size={40} color="#adb5bd" />
//           </View>
//         )}
//         <View style={styles.recipeInfo}>
//           <Text style={styles.recipeTitle}>{item.title}</Text>
//           <View style={styles.recipeDetails}>
//             <View style={styles.detailItem}>
//               <Ionicons name="time-outline" size={16} color="#6c757d" />
//               <Text style={styles.detailText}>
//                 {(item.prepTime || 0) + (item.cookTime || 0)} min
//               </Text>
//             </View>
//             <View style={styles.detailItem}>
//               <Ionicons name="people-outline" size={16} color="#6c757d" />
//               <Text style={styles.detailText}>{item.servings} servings</Text>
//             </View>
//           </View>
//         </View>
//       </View>
//     </TouchableOpacity>
//   );

//   if (loading) {
//     return (
//       <View style={styles.centered}>
//         <ActivityIndicator size="large" color="#ff6b6b" />
//       </View>
//     );
//   }

//   if (error) {
//     return (
//       <View style={styles.centered}>
//         <Text style={styles.errorText}>{error}</Text>
//         <TouchableOpacity style={styles.retryButton} onPress={fetchRecipes}>
//           <Text style={styles.retryText}>Try Again</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <FlatList
//         data={recipes}
//         keyExtractor={item => item._id}
//         renderItem={renderRecipeItem}
//         contentContainerStyle={styles.listContainer}
//         ListEmptyComponent={
//           <View style={styles.emptyContainer}>
//             <Ionicons name="document-text-outline" size={60} color="#adb5bd" />
//             <Text style={styles.emptyText}>No recipes yet</Text>
//             <Text style={styles.emptySubtext}>Add your first recipe to get started</Text>
//           </View>
//         }
//       />
      
//       <TouchableOpacity
//         style={styles.addButton}
//         onPress={() => navigation.navigate('AddRecipe')}
//       >
//         <Ionicons name="add" size={30} color="#fff" />
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f8f9fa',
//   },
//   listContainer: {
//     padding: 15,
//   },
//   recipeCard: {
//     backgroundColor: '#fff',
//     borderRadius: 10,
//     marginBottom: 15,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   recipeContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   recipeImage: {
//     width: 80,
//     height: 80,
//     borderTopLeftRadius: 10,
//     borderBottomLeftRadius: 10,
//   },
//   imagePlaceholder: {
//     width: 80,
//     height: 80,
//     borderTopLeftRadius: 10,
//     borderBottomLeftRadius: 10,
//     backgroundColor: '#e9ecef',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   recipeInfo: {
//     flex: 1,
//     padding: 12,
//   },
//   recipeTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     marginBottom: 6,
//     color: '#343a40',
//   },
//   recipeDetails: {
//     flexDirection: 'row',
//   },
//   detailItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginRight: 12,
//   },
//   detailText: {
//     fontSize: 12,
//     color: '#6c757d',
//     marginLeft: 4,
//   },
//   addButton: {
//     position: 'absolute',
//     right: 20,
//     bottom: 20,
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     backgroundColor: '#ff6b6b',
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 3,
//     elevation: 5,
//   },
//   centered: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   errorText: {
//     fontSize: 16,
//     color: '#dc3545',
//     textAlign: 'center',
//     marginBottom: 20,
//   },
//   retryButton: {
//     backgroundColor: '#ff6b6b',
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderRadius: 5,
//   },
//   retryText: {
//     color: '#fff',
//     fontWeight: '500',
//   },
//   emptyContainer: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 30,
//   },
//   emptyText: {
//     fontSize: 18,
//     fontWeight: '500',
//     color: '#343a40',
//     marginTop: 20,
//   },
//   emptySubtext: {
//     fontSize: 14,
//     color: '#6c757d',
//     textAlign: 'center',
//     marginTop: 10,
//   },
// });


// screens/RecipeListScreen.js
import React, { useEffect, useState } from 'react';
import { 
  View, Text, FlatList, StyleSheet, 
  TouchableOpacity, Image, ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getRecipes } from '../services/api';
import { UI_CONFIG } from '../config';

export default function RecipeListScreen({ navigation }) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRecipes();
    
    // Set up navigation listener to refresh on focus
    const unsubscribe = navigation.addListener('focus', () => {
      fetchRecipes();
    });
    
    return unsubscribe;
  }, [navigation]);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const data = await getRecipes();
      setRecipes(data);
      setError(null);
    } catch (err) {
      setError('Could not load recipes. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderRecipeItem = ({ item }) => (
    <TouchableOpacity
      style={styles.recipeCard}
      onPress={() => navigation.navigate('RecipeDetail', { id: item._id, title: item.title })}
    >
      <View style={styles.recipeContent}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.recipeImage} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="restaurant-outline" size={40} color="#adb5bd" />
          </View>
        )}
        <View style={styles.recipeInfo}>
          <Text style={styles.recipeTitle}>{item.title}</Text>
          <View style={styles.recipeDetails}>
            <View style={styles.detailItem}>
              <Ionicons name="time-outline" size={16} color="#6c757d" />
              <Text style={styles.detailText}>
                {(item.prepTime || 0) + (item.cookTime || 0)} min
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="people-outline" size={16} color="#6c757d" />
              <Text style={styles.detailText}>{item.servings} servings</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={UI_CONFIG.PRIMARY_COLOR} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchRecipes}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={recipes}
        keyExtractor={item => item._id}
        renderItem={renderRecipeItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={60} color="#adb5bd" />
            <Text style={styles.emptyText}>No recipes yet</Text>
            <Text style={styles.emptySubtext}>Add your first recipe to get started</Text>
          </View>
        }
      />
      
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddRecipe')}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  listContainer: {
    padding: 15,
  },
  recipeCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  recipeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recipeImage: {
    width: 80,
    height: 80,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recipeInfo: {
    flex: 1,
    padding: 12,
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    color: '#343a40',
  },
  recipeDetails: {
    flexDirection: 'row',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  detailText: {
    fontSize: 12,
    color: '#6c757d',
    marginLeft: 4,
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: UI_CONFIG.PRIMARY_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: UI_CONFIG.ERROR_COLOR,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: UI_CONFIG.PRIMARY_COLOR,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryText: {
    color: '#fff',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#343a40',
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    marginTop: 10,
  },
});