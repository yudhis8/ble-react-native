import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
import SearchBLE from './src/screens/serachble';
import DetailBLE from './src/screens/detailble';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="ScanDevices" component={SearchBLE} />
        <Stack.Screen name="PeripheralDetails" component={DetailBLE} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
