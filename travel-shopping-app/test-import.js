// CreatePackageScreen import 테스트
const testImport = () => {
  try {
    const module = require('./src/screens/CreatePackageScreen.tsx');
    console.log('✅ Module loaded:', module);
    console.log('✅ Named export (CreatePackageScreen):', typeof module.CreatePackageScreen);
    console.log('✅ Default export:', typeof module.default);
    
    if (module.CreatePackageScreen) {
      console.log('✅ Named export exists!');
    } else {
      console.log('❌ Named export NOT found!');
    }
    
    if (module.default) {
      console.log('✅ Default export exists!');
    } else {
      console.log('❌ Default export NOT found!');
    }
  } catch (error) {
    console.error('❌ Import failed:', error.message);
  }
};

testImport();
