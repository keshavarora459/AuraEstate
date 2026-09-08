import React from 'react';
import { Redirect, useLocalSearchParams } from 'expo-router';

export default function Explore() {
  const params = useLocalSearchParams();
  return <Redirect href={{ pathname: '/(tabs)/explore', params: params as any }} />;
}
