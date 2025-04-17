// App.js - Main React Native application

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import HomeScreen from './screens/HomeScreen';
import RecipeListScreen from './screens/RecipeListScreen';
import RecipeDetailScreen from './screens/RecipeDetailScreen';
import AddRecipeScreen from './screens/AddRecipeScreen';
import UrlParserScreen from './screens/UrlParserScreen';
import GroceryListScreen from './screens/GroceryListScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Recipe stack navigator
function RecipeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="RecipeList" 
        component={RecipeListScreen} 
        options={{ title: 'My Recipes' }} 
      />
      <Stack.Screen 
        name="RecipeDetail" 
        component={RecipeDetailScreen} 
        options={({ route }) => ({ title: route.params?.title || 'Recipe Details' })} 
      />
      <Stack.Screen 
        name="AddRecipe" 
        component={AddRecipeScreen} 
        options={{ title: 'Add Recipe' }} 
      />
      <Stack.Screen 
        name="UrlParser" 
        component={UrlParserScreen} 
        options={{ title: 'Import from URL' }} 
      />
    </Stack.Navigator>
  );
}

// Main app component with tab navigation
export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Recipes') {
              iconName = focused ? 'book' : 'book-outline';
            } else if (route.name === 'Groceries') {
              iconName = focused ? 'cart' : 'cart-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
        tabBarOptions={{
          activeTintColor: '#ff6b6b',
          inactiveTintColor: 'gray',
        }}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Recipes" component={RecipeStack} />
        <Tab.Screen name="Groceries" component={GroceryListScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
