import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getGroceryList, addGroceryItem, removeGroceryItem, toggleItemCompleted } from '../services/api';

const GroceryListScreen = () => {
  const [groceryItems, setGroceryItems] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    loadGroceryList();
  }, []);
  
  const loadGroceryList = async () => {
    setIsLoading(true);
    try {
      const list = await getGroceryList();
      setGroceryItems(list);
    } catch (error) {
      console.error('Error loading grocery list:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddItem = async () => {
    if (newItem.trim() === '') return;
    
    try {
      const item = await addGroceryItem({ name: newItem, completed: false });
      setGroceryItems([...groceryItems, item]);
      setNewItem('');
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };
  
  const handleRemoveItem = async (id) => {
    try {
      await removeGroceryItem(id);
      setGroceryItems(groceryItems.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };
  
  const handleToggleItem = async (id) => {
    try {
      const itemIndex = groceryItems.findIndex(item => item.id === id);
      const item = groceryItems[itemIndex];
      const updatedItem = await toggleItemCompleted(id, !item.completed);
      
      const updatedItems = [...groceryItems];
      updatedItems[itemIndex] = updatedItem;
      setGroceryItems(updatedItems);
    } catch (error) {
      console.error('Error toggling item:', error);
    }
  };
  
  const renderGroceryItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <TouchableOpacity onPress={() => handleToggleItem(item.id)} style={styles.checkbox}>
        <Ionicons 
          name={item.completed ? 'checkbox' : 'square-outline'} 
          size={24} 
          color={item.completed ? '#4CAF50' : '#757575'} 
        />
      </TouchableOpacity>
      
      <Text style={[
        styles.itemText,
        item.completed && styles.completedItem
      ]}>
        {item.name}
      </Text>
      
      <TouchableOpacity onPress={() => handleRemoveItem(item.id)}>
        <Ionicons name="trash-outline" size={24} color="#F44336" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Grocery List</Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newItem}
          onChangeText={setNewItem}
          placeholder="Add grocery item"
          onSubmitEditing={handleAddItem}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>
      
      {isLoading ? (
        <Text style={styles.loadingText}>Loading grocery list...</Text>
      ) : (
        <FlatList
          data={groceryItems}
          renderItem={renderGroceryItem}
          keyExtractor={item => item.id.toString()}
          style={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Your grocery list is empty</Text>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    marginRight: 8,
    backgroundColor: 'white',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 4,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    flex: 1,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 4,
    marginBottom: 8,
    elevation: 1,
  },
  checkbox: {
    marginRight: 12,
  },
  itemText: {
    flex: 1,
    fontSize: 16,
  },
  completedItem: {
    textDecorationLine: 'line-through',
    color: '#757575',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 16,
    color: '#757575',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 16,
    color: '#757575',
  },
});

export default GroceryListScreen;
