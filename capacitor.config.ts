import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.zonse247.pos',
  appName: 'ionic-app-base',
  webDir: 'dist',
  // Transparent background to allow camera to show through
  backgroundColor: '#00000000',
  server: {
    androidScheme: 'http'
  },
  plugins: {
    StatusBar: {
      overlaysWebView: false,
      style: "LIGHT",
      backgroundColor: "#ffffff",
    },
    CapacitorHttp: {
      enabled: true,
    },
    CapacitorSQLite: {
      iosDatabaseLocation: 'Library/CapacitorDatabase',
      iosIsEncryption: true,
      iosKeychainPrefix: 'ionic-app-base',
      iosBiometric: {
        biometricAuth: false,
        biometricTitle: "Biometric login for capacitor sqlite"
      },
      androidIsEncryption: true,
      androidBiometric: {
        biometricAuth: false,
        biometricTitle: "Biometric login for capacitor sqlite",
        biometricSubTitle: "Log in using your biometric"
      },
      electronIsEncryption: true,
      electronWindowsLocation: "C:\\ProgramData\\CapacitorDatabases",
      electronMacLocation: "/Volumes/Development_Lacie/Development/Databases",
      electronLinuxLocation: "Databases"
    },
    // ML Kit Barcode Scanner configuration - optimized for speed
    MLKitBarcodeScanner: {
      // Only include essential retail barcode formats for faster scanning
      // Fewer formats = faster detection
      formats: ['EAN_13', 'EAN_8', 'UPC_A', 'UPC_E', 'CODE_128'],
    },
    // Google Barcode Scanner uses Google Play Services for faster ML processing
    GoogleBarcodeScannerModule: {
      // Pre-download ML models for faster first scan
      installGoogleBarcodeScannerModule: true,
    }
  }
};

export default config;
