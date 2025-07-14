import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface TimeSelectorProps {
  time: string;
  onTimeChange: (time: string) => void;
  onRemove: () => void;
  canRemove: boolean;
}

export function TimeSelector({ time, onTimeChange, onRemove, canRemove }: TimeSelectorProps) {
  const [hours, minutes] = time.split(':');
  
  const adjustHour = (delta: number) => {
    const currentHour = parseInt(hours);
    const newHour = (currentHour + delta + 24) % 24;
    const newTime = `${newHour.toString().padStart(2, '0')}:${minutes}`;
    onTimeChange(newTime);
  };

  const adjustMinute = (delta: number) => {
    const currentMinute = parseInt(minutes);
    const newMinute = (currentMinute + delta + 60) % 60;
    const newTime = `${hours}:${newMinute.toString().padStart(2, '0')}`;
    onTimeChange(newTime);
  };

  const formatDisplayTime = () => {
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>{formatDisplayTime()}</Text>
        
        <View style={styles.controls}>
          <View style={styles.controlGroup}>
            <TouchableOpacity style={styles.controlButton} onPress={() => adjustHour(1)}>
              <Text style={styles.controlText}>+</Text>
            </TouchableOpacity>
            <Text style={styles.controlLabel}>Hour</Text>
            <TouchableOpacity style={styles.controlButton} onPress={() => adjustHour(-1)}>
              <Text style={styles.controlText}>-</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.controlGroup}>
            <TouchableOpacity style={styles.controlButton} onPress={() => adjustMinute(1)}>
              <Text style={styles.controlText}>+</Text>
            </TouchableOpacity>
            <Text style={styles.controlLabel}>Min</Text>
            <TouchableOpacity style={styles.controlButton} onPress={() => adjustMinute(-1)}>
              <Text style={styles.controlText}>-</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      {canRemove && (
        <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
          <Text style={styles.removeText}>×</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  timeContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  controls: {
    flexDirection: 'row',
    gap: 20,
  },
  controlGroup: {
    alignItems: 'center',
  },
  controlButton: {
    backgroundColor: '#10B981',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
  },
  controlText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  controlLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  removeButton: {
    backgroundColor: '#EF4444',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  removeText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});