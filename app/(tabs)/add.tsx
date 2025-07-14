import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Medicine } from '../../types/medicine';
import { TimeSelector } from '../../components/TimeSelector';
import { DaySelector } from '../../components/DaySelector';

export default function AddMedicineScreen() {
  const [medicineName, setMedicineName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('💊');
  const [scheduleTimes, setScheduleTimes] = useState<string[]>(['08:00']);
  const [selectedDays, setSelectedDays] = useState<string[]>([
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri',
    'Sat',
    'Sun',
  ]);
  const [repeatWeeks, setRepeatWeeks] = useState(1);
  const [status, setStatus] = useState<string>('');

  const emojiOptions = [
    '💊',
    '🔴',
    '🟠',
    '🟡',
    '🟢',
    '🔵',
    '🟣',
    '⚪',
    '⚫',
    '🩹',
  ];

  const addTime = () => {
    setScheduleTimes([...scheduleTimes, '12:00']);
  };

  const updateTime = (index: number, time: string) => {
    const newTimes = [...scheduleTimes];
    newTimes[index] = time;
    setScheduleTimes(newTimes);
  };

  const removeTime = (index: number) => {
    if (scheduleTimes.length > 1) {
      const newTimes = scheduleTimes.filter((_, i) => i !== index);
      setScheduleTimes(newTimes);
    }
  };

  const saveMedicine = async () => {
    setStatus('');
    if (!medicineName.trim()) {
      setStatus('Please enter a medicine name');
      return;
    }
    if (scheduleTimes.length === 0 || scheduleTimes.some((t) => !t)) {
      setStatus('Please add at least one valid time');
      return;
    }
    if (selectedDays.length === 0) {
      setStatus('Please select at least one day');
      return;
    }
    try {
      const newMedicine: Medicine = {
        id: Date.now().toString(),
        name: medicineName.trim(),
        emoji: selectedEmoji,
        scheduleTimes: scheduleTimes,
        days: selectedDays,
        repeatWeeks: repeatWeeks,
        createdAt: new Date().toISOString(),
      };
      const existingMedicines = await AsyncStorage.getItem('medicines');
      const medicines: Medicine[] = existingMedicines
        ? JSON.parse(existingMedicines)
        : [];
      medicines.push(newMedicine);
      await AsyncStorage.setItem('medicines', JSON.stringify(medicines));
      setStatus('Medicine added successfully! 🐱');
      // Clear all fields
      setMedicineName('');
      setSelectedEmoji('💊');
      setScheduleTimes(['08:00']);
      setSelectedDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
      setRepeatWeeks(1);
    } catch (error) {
      console.error('Error saving medicine:', error);
      setStatus('Failed to save medicine');
    }
  };

  return (
    <LinearGradient colors={['#10B981', '#059669']} style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Add Medicine</Text>
          <Text style={styles.subtitle}>
            Help your furry friend stay healthy! 🐱
          </Text>
        </View>
        {status ? (
          <View style={{ alignItems: 'center', marginBottom: 16 }}>
            <Text
              style={{
                color: status.includes('successfully') ? '#22c55e' : '#ef4444',
                fontSize: 16,
              }}
            >
              {status}
            </Text>
          </View>
        ) : null}
        <View style={styles.form}>
          {/* ...existing code... */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Medicine Name</Text>
            <TextInput
              style={styles.input}
              value={medicineName}
              onChangeText={setMedicineName}
              placeholder="Enter medicine name"
              placeholderTextColor="#94A3B8"
            />
          </View>
          {/* ...existing code... */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Choose Icon</Text>
            <View style={styles.emojiContainer}>
              {emojiOptions.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  style={[
                    styles.emojiButton,
                    selectedEmoji === emoji && styles.selectedEmojiButton,
                  ]}
                  onPress={() => setSelectedEmoji(emoji)}
                >
                  <Text style={styles.emojiText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          {/* ...existing code... */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Schedule Times</Text>
            {scheduleTimes.map((time, index) => (
              <TimeSelector
                key={index}
                time={time}
                onTimeChange={(newTime) => updateTime(index, newTime)}
                onRemove={() => removeTime(index)}
                canRemove={scheduleTimes.length > 1}
              />
            ))}
            <TouchableOpacity style={styles.addTimeButton} onPress={addTime}>
              <Text style={styles.addTimeText}>+ Add Time</Text>
            </TouchableOpacity>
          </View>
          {/* ...existing code... */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Days of Week</Text>
            <DaySelector
              selectedDays={selectedDays}
              onDaysChange={setSelectedDays}
            />
          </View>
          {/* ...existing code... */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Repeat Every</Text>
            <View style={styles.repeatContainer}>
              {[1, 2, 3, 4].map((weeks) => (
                <TouchableOpacity
                  key={weeks}
                  style={[
                    styles.repeatButton,
                    repeatWeeks === weeks && styles.selectedRepeatButton,
                  ]}
                  onPress={() => setRepeatWeeks(weeks)}
                >
                  <Text
                    style={[
                      styles.repeatText,
                      repeatWeeks === weeks && styles.selectedRepeatText,
                    ]}
                  >
                    {weeks} week{weeks > 1 ? 's' : ''}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          {/* ...existing code... */}
          <TouchableOpacity style={styles.saveButton} onPress={saveMedicine}>
            <Text style={styles.saveButtonText}>Save Medicine</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#D1FAE5',
    textAlign: 'center',
  },
  form: {
    paddingHorizontal: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1F2937',
  },
  emojiContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  emojiButton: {
    width: 50,
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedEmojiButton: {
    backgroundColor: '#ffffff',
    borderColor: '#059669',
  },
  emojiText: {
    fontSize: 24,
  },
  addTimeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  addTimeText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  repeatContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  repeatButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedRepeatButton: {
    backgroundColor: '#ffffff',
  },
  repeatText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  selectedRepeatText: {
    color: '#10B981',
  },
  saveButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    color: '#10B981',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
