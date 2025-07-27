import React from 'react';
import {View, TouchableOpacity, Text, StyleSheet} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';

const BottomNavigation = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const navItems = [
    {icon: 'home', label: 'Home', screen: 'Home'},
    {icon: 'play', label: 'Reels', screen: 'Reels'},
    {icon: 'plus', label: 'Sell', screen: 'Sell'},
    {icon: 'message-circle', label: 'Messages', screen: 'Messages'},
    {icon: 'user', label: 'Profile', screen: 'Profile'},
  ];

  return (
    <View style={styles.container}>
      {navItems.map(item => {
        const isActive = route.name === item.screen;
        const isSell = item.screen === 'Sell';

        return (
          <TouchableOpacity
            key={item.screen}
            style={[styles.navItem, isSell && styles.sellButton]}
            onPress={() => navigation.navigate(item.screen as never)}
            activeOpacity={0.7}
          >
            <Icon
              name={item.icon}
              size={24}
              color={
                isSell
                  ? '#FFFFFF'
                  : isActive
                  ? '#8B5CF6'
                  : '#9CA3AF'
              }
            />
            <Text
              style={[
                styles.navLabel,
                isSell && styles.sellLabel,
                isActive && !isSell && styles.activeLabel,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingVertical: 8,
    paddingHorizontal: 16,
    justifyContent: 'space-around',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 64,
  },
  sellButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 32,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  navLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9CA3AF',
    marginTop: 4,
  },
  sellLabel: {
    color: '#FFFFFF',
  },
  activeLabel: {
    color: '#8B5CF6',
  },
});

export default BottomNavigation;