import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/useAuthStore';
import LoginScreen from '../screens/loginScreen/LoginScreen';
import RegistrationStatusScreen from '../screens/loginScreen/RegistrationStatusScreen';
import { CustomerTabNavigator } from './CustomerTabNavigator';
import CreateAccountScreen from '../screens/CreateAccount/CreateAccountScreen';
import LoadingScreen from '../components/LoadingScreen';
import { BusinessDetailsScreen } from '../screens/CreateAccount/BusinessDetailsScreen';
import { AddContactsScreen } from '../screens/CreateAccount/AddContactsScreen';
import { KYCUploadsScreen } from '../screens/CreateAccount/KycUploadScreen';
import { FinancialInfoScreen } from '../screens/CreateAccount/FinancialInfoScreen';
import { ReviewSubmitScreen } from '../screens/CreateAccount/ReviewSubmitScreen';
import SearchStack from './SearchStack';
import LegalDocScreen from '../screens/profile/LegalDocsScreen';


export type RootStackParamList = {
  HomeScreen: undefined;
  Login: undefined;
  CreateAccount: undefined;
  BusinessDetails: undefined;
  AddContacts: undefined;
  KycUploads: undefined;
  FinancialInfo: undefined;
  ReviewScreen: undefined;
  RegistrationStatus:undefined;
  LegalDocScreen: { docType: any };
  SearchStack:
    | {
        screen: 'VoiceSearchScreen';
        params: {
          results?: any[];
          term: string;
          isGlobalSearch?: boolean;
        };
      }
    | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
  
const MainNavigator = () => {
  const [isLoggedIn,setIsLoggedIn]= useState<any>(null)
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  useEffect(() => {
    setIsLoggedIn(isAuthenticated);
  }, [isAuthenticated]);


if (isLoggedIn == null) {
  return <LoadingScreen />
}

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="HomeScreen" component={CustomerTabNavigator} />
          {/* <Stack.Screen name="SearchStack" component={SearchStack} /> */}
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="RegistrationStatus" component={RegistrationStatusScreen} />
          
          <Stack.Screen name="CreateAccount" component={CreateAccountScreen} />
          <Stack.Screen
            name="BusinessDetails"
            component={BusinessDetailsScreen}
          />
          <Stack.Screen name="AddContacts" component={AddContactsScreen} />
          <Stack.Screen name="KycUploads" component={KYCUploadsScreen} />
          <Stack.Screen name="FinancialInfo" component={FinancialInfoScreen} />
          <Stack.Screen name="ReviewScreen" component={ReviewSubmitScreen} />
          <Stack.Screen name="LegalDocScreen" component={LegalDocScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default MainNavigator;
