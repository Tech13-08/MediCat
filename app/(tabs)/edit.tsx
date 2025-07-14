import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Medicine } from '../../types/medicine';
import { TimeSelector } from '../../components/TimeSelector';
import { DaySelector } from '../../components/DaySelector';

export default function EditMedicineScreen() {
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 900;
  const { medicineId } = useLocalSearchParams<{ medicineId: string }>();
  const [medicine, setMedicine] = useState<Medicine | null>(null);
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

  useEffect(() => {
    loadMedicine();
  }, [medicineId]);

  const loadMedicine = async () => {
    try {
      const storedMedicines = await AsyncStorage.getItem('medicines');
      if (storedMedicines) {
        const medicines: Medicine[] = JSON.parse(storedMedicines);
        const foundMedicine = medicines.find((med) => med.id === medicineId);
        if (foundMedicine) {
          setMedicine(foundMedicine);
          setMedicineName(foundMedicine.name);
          setSelectedEmoji(foundMedicine.emoji);
          setScheduleTimes(foundMedicine.scheduleTimes);
          setSelectedDays(foundMedicine.days);
          setRepeatWeeks(foundMedicine.repeatWeeks);
        }
      }
    } catch (error) {
      console.error('Error loading medicine:', error);
      Alert.alert('Error', 'Failed to load medicine');
    }
  };

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
    if (!medicineName.trim()) {
      Alert.alert('Error', 'Please enter a medicine name');
      return;
    }

    if (selectedDays.length === 0) {
      Alert.alert('Error', 'Please select at least one day');
      return;
    }

    try {
      const storedMedicines = await AsyncStorage.getItem('medicines');
      const medicines: Medicine[] = storedMedicines
        ? JSON.parse(storedMedicines)
        : [];

      const updatedMedicine: Medicine = {
        ...medicine!,
        name: medicineName.trim(),
        emoji: selectedEmoji,
        scheduleTimes: scheduleTimes,
        days: selectedDays,
        repeatWeeks: repeatWeeks,
      };

      const updatedMedicines = medicines.map((med) =>
        med.id === medicineId ? updatedMedicine : med
      );

      await AsyncStorage.setItem('medicines', JSON.stringify(updatedMedicines));

      Alert.alert('Success', 'Medicine updated successfully! 🐱', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Error saving medicine:', error);
      Alert.alert('Error', 'Failed to save medicine');
    }
  };

  if (!medicine) {
    return (
      <LinearGradient colors={['#10B981', '#059669']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#10B981', '#059669']} style={[styles.container, isLargeScreen && styles.containerLarge]}>
      <ScrollView
        style={[styles.scrollView, isLargeScreen && styles.scrollViewLarge]}
        contentContainerStyle={[styles.scrollContent, isLargeScreen && styles.scrollContentLarge]}
      >
        <View style={[styles.header, isLargeScreen && styles.headerLarge]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() =>
              router.push({
                pathname: '/(tabs)/medicines',
                params: { medicineId },
              })
            }
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Edit Medicine</Text>
          <Text style={styles.subtitle}>Update your medicine details 🐱</Text>
        </View>

        <View style={[styles.form, isLargeScreen && styles.formLarge]}>
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

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Days of Week</Text>
            <DaySelector
              selectedDays={selectedDays}
              onDaysChange={setSelectedDays}
            />
          </View>

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

          <TouchableOpacity style={styles.saveButton} onPress={saveMedicine}>
            <Text style={styles.saveButtonText}>Update Medicine</Text>
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
  containerLarge: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 700,
    paddingVertical: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewLarge: {
    width: 600,
    alignSelf: 'center',
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginVertical: 32,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  scrollContentLarge: {
    padding: 32,
    paddingBottom: 100,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 32,
    alignItems: 'center',
  },
  headerLarge: {
    paddingTop: 32,
    paddingBottom: 24,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
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
  formLarge: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 24,
    padding: 32,
    marginBottom: 32,
    // boxShadow is not supported in React Native
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
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
