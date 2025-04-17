import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PropTypes from 'prop-types';

const StepItem = ({ 
  stepNumber, 
  instruction, 
  isCompleted,
  onToggleComplete,
  onEdit,
  onDelete,
  editable = false,
  timers = []
}) => {
  // Function to start a timer
  const handleStartTimer = (minutes) => {
    // Implementation would depend on how you want to manage timers
    console.log(`Starting timer for ${minutes} minutes`);
    // You could use a context or state management to track active timers
  };

  return (
    <View style={styles.container}>
      <View style={styles.stepNumberContainer}>
        <Text style={styles.stepNumber}>{stepNumber}</Text>
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={[
          styles.instruction,
          isCompleted && styles.completedInstruction
        ]}>
          {instruction}
        </Text>
        
        {/* Timer buttons for steps that have timers */}
        {timers.length > 0 && (
          <View style={styles.timersContainer}>
            {timers.map((timer, index) => (
              <TouchableOpacity 
                key={index}
                style={styles.timerButton}
                onPress={() => handleStartTimer(timer)}
              >
                <Ionicons name="timer-outline" size={16} color="#2196F3" />
                <Text style={styles.timerText}>{timer} min</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
      
      <View style={styles.actions}>
        {onToggleComplete && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onToggleComplete}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <Ionicons
              name={isCompleted ? 'checkbox' : 'square-outline'}
              size={22}
              color={isCompleted ? '#4CAF50' : '#757575'}
            />
          </TouchableOpacity>
        )}
        
        {editable && onEdit && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onEdit}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <Ionicons name="pencil" size={20} color="#2196F3" />
          </TouchableOpacity>
        )}
        
        {editable && onDelete && (
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

StepItem.propTypes = {
  stepNumber: PropTypes.number.isRequired,
  instruction: PropTypes.string.isRequired,
  isCompleted: PropTypes.bool,
  onToggleComplete: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  editable: PropTypes.bool,
  timers: PropTypes.arrayOf(PropTypes.number)
};

StepItem.defaultProps = {
  isCompleted: false,
  editable: false,
  timers: []
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: 'white',
  },
  stepNumberContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumber: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  contentContainer: {
    flex: 1,
  },
  instruction: {
    fontSize: 16,
    color: '#212121',
    lineHeight: 22,
  },
  completedInstruction: {
    textDecorationLine: 'line-through',
    color: '#757575',
  },
  timersContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  timerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  timerText: {
    color: '#2196F3',
    marginLeft: 4,
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  actionButton: {
    padding: 6,
    marginLeft: 4,
  },
});

export default StepItem;
