import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import {ThemeProvider} from './context/ThemeContext';

// Import screens
import Index from './screens/Index';
import Auth from './screens/Auth';
import Home from './screens/Home';
import Reels from './screens/Reels';
import Sell from './screens/Sell';
import Messages from './screens/Messages';
import Profile from './screens/Profile';
import Chat from './screens/Chat';
import CreateAccount from './screens/CreateAccount';
import Categories from './screens/Categories';
import Notifications from './screens/Notifications';
import Settings from './screens/Settings';
import ReelComments from './screens/ReelComments';
import ShareSheet from './screens/ShareSheet';
import ProductDetail from './screens/ProductDetail';
import Search from './screens/Search';
import SellerProfile from './screens/SellerProfile';
import MyListings from './screens/MyListings';
import Favorites from './screens/Favorites';
import Reviews from './screens/Reviews';
import PrivacySecurity from './screens/PrivacySecurity';
import Location from './screens/Location';
import CategoryProducts from './screens/CategoryProducts';
import AdminReels from './screens/AdminReels';
import Saved from './screens/Saved';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <NavigationContainer>
          <Stack.Navigator 
            initialRouteName="Index"
            screenOptions={{
              headerShown: false,
              gestureEnabled: true,
            }}
          >
            <Stack.Screen name="Index" component={Index} />
            <Stack.Screen name="Auth" component={Auth} />
            <Stack.Screen name="CreateAccount" component={CreateAccount} />
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="Reels" component={Reels} />
            <Stack.Screen name="Sell" component={Sell} />
            <Stack.Screen name="Messages" component={Messages} />
            <Stack.Screen name="Chat" component={Chat} />
            <Stack.Screen name="Profile" component={Profile} />
            <Stack.Screen name="Categories" component={Categories} />
            <Stack.Screen name="Notifications" component={Notifications} />
            <Stack.Screen name="Settings" component={Settings} />
            <Stack.Screen name="ReelComments" component={ReelComments} />
            <Stack.Screen name="ShareSheet" component={ShareSheet} />
            <Stack.Screen name="ProductDetail" component={ProductDetail} />
            <Stack.Screen name="Search" component={Search} />
            <Stack.Screen name="SellerProfile" component={SellerProfile} />
            <Stack.Screen name="MyListings" component={MyListings} />
            <Stack.Screen name="Favorites" component={Favorites} />
            <Stack.Screen name="Reviews" component={Reviews} />
            <Stack.Screen name="PrivacySecurity" component={PrivacySecurity} />
            <Stack.Screen name="Location" component={Location} />
            <Stack.Screen name="CategoryProducts" component={CategoryProducts} />
            <Stack.Screen name="AdminReels" component={AdminReels} />
            <Stack.Screen name="Saved" component={Saved} />
          </Stack.Navigator>
        </NavigationContainer>
        <Toast />
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

export default App;