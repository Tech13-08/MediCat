import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Medicine, MedicineIntake } from '../types/medicine';

interface MedicineCardProps {
  medicine: Medicine;
  scheduleTime: string;
  onTake: () => void;
}

export function MedicineCard({ medicine, scheduleTime, onTake }: MedicineCardProps) {
  const [progress, setProgress] = useState({ taken: 0, total: 0 });

  useEffect(() => {
    loadProgress();
  }, [medicine.id]);

  const loadProgress = async () => {
    try {
      const intakesKey = `intakes_${medicine.id}`;
      const existingIntakes = await AsyncStorage.getItem(intakesKey);
      const intakes: MedicineIntake[] = existingIntakes ? JSON.parse(existingIntakes) : [];
      
      const today = new Date().toDateString();
      const todayIntakes = intakes.filter(intake => intake.date === today);
      
      setProgress({
        taken: todayIntakes.length,
        total: medicine.scheduleTimes.length,
      });
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onTake}>
      <View style={styles.medicineInfo}>
        <View style={styles.medicineHeader}>
          <Text style={styles.emoji}>{medicine.emoji}</Text>
          <View style={styles.medicineText}>
            <Text style={styles.medicineName}>{medicine.name}</Text>
            <Text style={styles.scheduleTime}>{formatTime(scheduleTime)}</Text>
          </View>
        </View>
        
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {progress.taken}/{progress.total} today
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${(progress.taken / progress.total) * 100}%` }
              ]} 
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#10B981',
  },
  medicineInfo: {
    flex: 1,
  },
  medicineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  emoji: {
    fontSize: 32,
    marginRight: 12,
  },
  medicineText: {
    flex: 1,
  },
  medicineName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  scheduleTime: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  progressContainer: {
    marginLeft: 44,
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '600',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 2,
  },
});