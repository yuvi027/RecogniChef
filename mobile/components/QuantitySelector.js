import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PropTypes from 'prop-types';

const QuantitySelector = ({ 
  value, 
  onChange, 
  min = 1, 
  max = 20,
  step = 1,
  label = 'Servings',
  showControls = true,
  disabled = false
}) => {
  const increment = () => {
    if (value < max) {
      onChange(value + step);
    }
  };

  const decrement = () => {
    if (value > min) {
      onChange(value - step);
    }
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={[
        styles.controlsContainer,
        disabled && styles.disabled
      ]}>
        {showControls && (
          <TouchableOpacity 
            style={[
              styles.button,
              value <= min && styles.disabledButton
            ]}
            onPress={decrement}
            disabled={value <= min || disabled}
          >
            <Ionicons name="remove" size={20} color={value <= min ? '#BDBDBD' : '#424242'} />
          </TouchableOpacity>
        )}
        
        <View style={styles.valueContainer}>
          <Text style={styles.value}>{value}</Text>
        </View>
        
        {showControls && (
          <TouchableOpacity 
            style={[
              styles.button,
              value >= max && styles.disabledButton
            ]}
            onPress={increment}
            disabled={value >= max || disabled}
          >
            <Ionicons name="add" size={20} color={value >= max ? '#BDBDBD' : '#424242'} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

QuantitySelector.propTypes = {
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  min: PropTypes.number,
  max: PropTypes.number,
  step: PropTypes.number,
  label: PropTypes.string,
  showControls: PropTypes.bool,
  disabled: PropTypes.bool
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#424242',
    flex: 1,
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 4,
  },
  disabled: {
    opacity: 0.6,
  },
  button: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  disabledButton: {
    backgroundColor: '#EEEEEE',
  },
  valueContainer: {
    minWidth: 50,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    backgroundColor: 'white',
  },
  value: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212121',
  },
});

export default QuantitySelector;
