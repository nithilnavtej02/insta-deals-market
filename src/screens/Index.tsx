import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Button from '../components/ui/Button';

const Index = () => {
  const navigation = useNavigation();

  return (
    <LinearGradient
      colors={['#A78BFA', '#7C3AED']}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="#7C3AED" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>
              Re<Text style={styles.titleAccent}>O</Text>wn
            </Text>
            <Text style={styles.subtitle}>MARKETPLACE</Text>
            <Text style={styles.tagline}>Buy, Sell, Connect</Text>
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title="Get Started"
              onPress={() => navigation.navigate('CreateAccount' as never)}
              variant="reown-white"
              size="lg"
              style={styles.button}
            />
            
            <Button
              title="Sign In"
              onPress={() => navigation.navigate('Auth' as never)}
              variant="reown-outline"
              size="lg"
              style={styles.button}
            />
          </View>

          <View style={styles.indicator} />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 64,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: -1,
    marginBottom: 16,
  },
  titleAccent: {
    opacity: 0.9,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '300',
    color: '#FFFFFF',
    letterSpacing: 4,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 18,
    fontWeight: '500',
    color: '#FFFFFF',
    opacity: 0.9,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 320,
  },
  button: {
    marginBottom: 16,
  },
  indicator: {
    position: 'absolute',
    bottom: 20,
    width: 128,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
  },
});

export default Index;