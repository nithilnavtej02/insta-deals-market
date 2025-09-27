import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.b995b8ef44c44ebc836bc45692554ce0',
  appName: 'reown',
  webDir: 'dist',
  server: {
    url: 'https://b995b8ef-44c4-4ebc-836b-c45692554ce0.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#8B5CF6',
      showSpinner: false
    }
  }
};

export default config;