// 테스트용 간단한 컴포넌트
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';

export const CreatePackageScreenTest = () => {
  console.log('🧪 CreatePackageScreenTest rendering...');
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>✅ CreatePackageScreen 로드 성공!</Text>
      <Text style={styles.subtitle}>이 화면이 보이면 import/export는 정상입니다</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});

export default CreatePackageScreenTest;
