import {useEffect} from 'react';
import {Platform, PermissionsAndroid} from 'react-native';

export const useAndroidPermissions = () => {
  const requestPermissions = async () => {
    if (Platform.OS === 'android' && Platform.Version >= 31) {
      try {
        const result = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        ]);
        console.debug('[useAndroidPermissions] Permissions result:', result);
      } catch (err) {
        console.error(
          '[useAndroidPermissions] Error requesting permissions:',
          err,
        );
      }
    } else if (Platform.OS === 'android' && Platform.Version >= 23) {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        console.debug(
          '[useAndroidPermissions] Fine location permission:',
          granted,
        );
      } catch (err) {
        console.error('[useAndroidPermissions] Error:', err);
      }
    }
  };

  useEffect(() => {
    requestPermissions();
  }, []);
};
