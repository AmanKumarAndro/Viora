import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect } from 'expo-router';
import React, { useEffect, useState } from 'react';

export default function index() {
  const [isOnboarding, setIsOnboarding] = useState(true);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const checkOnboarding = async () => {
      const onboarding = await AsyncStorage.getItem('onboarding');
      if (onboarding) {
        setIsOnboarding(!onboarding);
      }
      setLoading(false);
    }

    checkOnboarding();

  }, [])
  if (loading) {
    return null;
  }
  return (
    <Redirect href={isOnboarding ? '/(routes)/onboarding' : '/(routes)/home'} />
  )
}