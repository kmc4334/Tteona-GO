// 앱 실행 전 빠른 검증 스크립트
const fs = require('fs');
const path = require('path');

console.log('🔍 앱 파일 구조 검증 중...\n');

const requiredFiles = [
  'App.tsx',
  'index.ts',
  'package.json',
  'src/navigation/AppNavigator.tsx',
  'src/navigation/BottomTabNavigator.tsx',
  'src/screens/HomeScreen.tsx',
  'src/store/AuthContext.tsx',
  'src/store/CartContext.tsx',
  'src/store/PackageContext.tsx',
  'src/store/ActivityContext.tsx',
  'src/store/NotificationContext.tsx',
  'src/store/BudgetContext.tsx',
  'src/store/WeatherContext.tsx',
  'src/store/ScheduleContext.tsx',
];

let allGood = true;

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ 누락: ${file}`);
    allGood = false;
  }
});

console.log('\n' + '='.repeat(50));

if (allGood) {
  console.log('✅ 모든 필수 파일이 존재합니다!');
  console.log('\n다음 명령으로 앱을 실행하세요:');
  console.log('  npm start');
} else {
  console.log('❌ 일부 파일이 누락되었습니다.');
  console.log('누락된 파일을 생성한 후 다시 시도하세요.');
  process.exit(1);
}
