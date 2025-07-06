import { Redirect } from 'expo-router';
import React, { useState } from 'react';

export default function index() {
  const [isOnboarding, setIsOnboarding] = useState(true);
  // useEffect(() => {
    
  // }, [])
  return (
    <Redirect href="(routes)/onboarding" />
  )
}