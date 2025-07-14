import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface DaySelectorProps {
  selectedDays: string[];
  onDaysChange: (days: string[]) => void;
}

const DAYS = [
  { short: 'Mon', full: 'Monday' },
  { short: 'Tue', full: 'Tuesday' },
  { short: 'Wed', full: 'Wednesday' },
  { short: 'Thu', full: 'Thursday' },
  { short: 'Fri', full: 'Friday' },
  { short: 'Sat', full: 'Saturday' },
  { short: 'Sun', full: 'Sunday' },
];

export function DaySelector({ selectedDays, onDaysChange }: DaySelectorProps) {
  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      onDaysChange(selectedDays.filter(d => d !== day));
    } else {
      onDaysChange([...selectedDays, day]);
    }
  };

  const selectAllDays = () => {
    onDaysChange(DAYS.map(d => d.short));
  };

  const selectWeekdays = () => {
    onDaysChange(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  };

  const selectWeekends = () => {
    onDaysChange(['Sat', 'Sun']);
  };

  return (
    <View style={styles.container}>
      <View style={styles.quickButtons}>
        <TouchableOpacity style={styles.quickButton} onPress={selectAllDays}>
          <Text style={styles.quickButtonText}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickButton} onPress={selectWeekdays}>
          <Text style={styles.quickButtonText}>Weekdays</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickButton} onPress={selectWeekends}>
          <Text style={styles.quickButtonText}>Weekends</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.daysContainer}>
        {DAYS.map((day) => (
          <TouchableOpacity
            key={day.short}
            style={[
              styles.dayButton,
              selectedDays.includes(day.short) && styles.selectedDayButton,
            ]}
            onPress={() => toggleDay(day.short)}
          >
            <Text
              style={[
                styles.dayText,
                selectedDays.includes(day.short) && styles.selectedDayText,
              ]}
            >
              {day.short}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 16,
  },
  quickButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  quickButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  quickButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedDayButton: {
    backgroundColor: '#10B981',
  },
  dayText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  selectedDayText: {
    color: '#ffffff',
  },
});