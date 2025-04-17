import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PropTypes from 'prop-types';

const IngredientItem = ({ 
  ingredient, 
  quantity, 
  unit, 
  notes,
  isChecked,
  onToggleCheck,
  onDelete,
  editable = false,
  onEdit
}) => {
  // Format the ingredient text display
  const getFormattedText = () => {
    let text = '';
    
    if (quantity) {
      text += quantity + ' ';
    }
    
    if (unit) {
      text += unit + ' ';
    }
    
    text += ingredient;
    
    if (notes) {
      text += ` (${notes})`;
    }
    
    return text;
  };

  return (
    <View style={styles.container}>
      {onToggleCheck && (
        <TouchableOpacity
          style={styles.checkbox}
          onPress={onToggleCheck}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <Ionicons
            name={isChecked ? 'checkbox' : 'square-outline'}
            size={22}
            color={isChecked ? '#4CAF50' : '#757575'}
          />
        </TouchableOpacity>
      )}
      
      <View style={styles.textContainer}>
        <Text style={[
          styles.text,
          isChecked && styles.checkedText
        ]}>
          {getFormattedText()}
        </Text>
      </View>
      
      <View style={styles.actions}>
        {editable && onEdit && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onEdit}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <Ionicons name="pencil" size={20} color="#2196F3" />
          </TouchableOpacity>
        )}
        
        {onDelete && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onDelete}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <Ionicons name="trash-outline" size={20} color="#F44336" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

IngredientItem.propTypes = {
  ingredient: PropTypes.string.isRequired,
  quantity: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  unit: PropTypes.string,
  notes: PropTypes.string,
  isChecked: PropTypes.bool,
  onToggleCheck: PropTypes.func,
  onDelete: PropTypes.func,
  editable: PropTypes.bool,
  onEdit: PropTypes.func,
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: 'white',
  },
  checkbox: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  text: {
    fontSize: 16,
    color: '#212121',
  },
  checkedText: {
    textDecorationLine: 'line-through',
    color: '#757575',
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 6,
    marginLeft: 8,
  },
});

export default IngredientItem;
