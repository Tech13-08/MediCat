import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface WelcomeScreenProps {
  onComplete: () => void;
}

export function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  return (
    <LinearGradient colors={['#10B981', '#059669']} style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.brandText}>MediCat</Text>
        </View>
        
        <View style={styles.heroContainer}>
          <View style={styles.catCircle}>
            <Text style={styles.catEmoji}>🐱</Text>
          </View>
          <Text style={styles.welcomeTitle}>Welcome to MediCat!</Text>
          <Text style={styles.welcomeSubtitle}>
            Your purr-fect companion for tracking medicine schedules
          </Text>
        </View>

        <View style={styles.featuresContainer}>
          <View style={styles.feature}>
            <Text style={styles.featureEmoji}>⏰</Text>
            <Text style={styles.featureText}>Smart scheduling</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureEmoji}>📱</Text>
            <Text style={styles.featureText}>Easy tracking</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureEmoji}>🎯</Text>
            <Text style={styles.featureText}>Never miss a dose</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.getStartedButton} onPress={onComplete}>
          <Text style={styles.getStartedText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  logoContainer: {
    alignItems: 'center',
  },
  brandText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  heroContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  catCircle: {
    width: 150,
    height: 150,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  catEmoji: {
    fontSize: 64,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#D1FAE5',
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 40,
  },
  feature: {
    alignItems: 'center',
    flex: 1,
  },
  featureEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: '600',
  },
  getStartedButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 18,
    borderRadius: 25,
    alignItems: 'center',
  },
  getStartedText: {
    color: '#10B981',
    fontSize: 18,
    fontWeight: 'bold',
  },
});