import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Medicine, MedicineIntake } from '../types/medicine';

interface MedicineListItemProps {
  medicine: Medicine;
  onDelete: () => void;
  onEdit: () => void;
  onAdjustIntakes: () => void;
}

export function MedicineListItem({ medicine, onDelete, onEdit, onAdjustIntakes }: MedicineListItemProps) {
  const [todayProgress, setTodayProgress] = useState({ taken: 0, total: 0 });

  useEffect(() => {
    loadTodayProgress();
  }, [medicine.id]);

  const loadTodayProgress = async () => {
    try {
      const intakesKey = `intakes_${medicine.id}`;
      const existingIntakes = await AsyncStorage.getItem(intakesKey);
      const intakes: MedicineIntake[] = existingIntakes ? JSON.parse(existingIntakes) : [];
      
      const today = new Date().toDateString();
      const todayIntakes = intakes.filter(intake => intake.date === today);
      
      setTodayProgress({
        taken: todayIntakes.length,
        total: medicine.scheduleTimes.length,
      });
    } catch (error) {
      console.error('Error loading today progress:', error);
    }
  };

  const formatTimes = (times: string[]) => {
    return times.map(time => {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    }).join(', ');
  };

  const formatDays = (days: string[]) => {
    if (days.length === 7) return 'Daily';
    if (days.length === 5 && !days.includes('Sat') && !days.includes('Sun')) {
      return 'Weekdays';
    }
    if (days.length === 2 && days.includes('Sat') && days.includes('Sun')) {
      return 'Weekends';
    }
    return days.join(', ');
  };

  return (
    <View style={styles.container}>
      <View style={styles.medicineInfo}>
        <View style={styles.header}>
          <Text style={styles.emoji}>{medicine.emoji}</Text>
          <View style={styles.textContainer}>
            <Text style={styles.medicineName}>{medicine.name}</Text>
            <Text style={styles.schedule}>
              {formatTimes(medicine.scheduleTimes)}
            </Text>
            <Text style={styles.days}>
              {formatDays(medicine.days)} • Every {medicine.repeatWeeks} week{medicine.repeatWeeks > 1 ? 's' : ''}
            </Text>
          </View>
        </View>
        
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Today: {todayProgress.taken}/{todayProgress.total}
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${todayProgress.total > 0 ? (todayProgress.taken / todayProgress.total) * 100 : 0}%` }
              ]} 
            />
          </View>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.editButton} onPress={onEdit}>
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.adjustButton} onPress={onAdjustIntakes}>
          <Text style={styles.adjustButtonText}>Adjust</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  medicineInfo: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  emoji: {
    fontSize: 32,
    marginRight: 12,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  medicineName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  schedule: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
    marginBottom: 2,
  },
  days: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
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
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    backgroundColor: '#10B981',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  adjustButton: {
    backgroundColor: '#F59E0B',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  adjustButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});