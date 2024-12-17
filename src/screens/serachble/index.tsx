import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  StatusBar,
  FlatList,
  Pressable,
} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import {Peripheral} from 'react-native-ble-manager';
import {useAndroidPermissions} from '../../hooks/permission.hook';
import {useBluetoothManager} from '../../hooks/blemodule.hook';

const SearchBLE = () => {
  useAndroidPermissions();
  const {
    isScanning,
    peripherals,
    startScan,
    togglePeripheralConnection,
    btState,
    enableBluetooth,
  } = useBluetoothManager();

  const renderItem = ({item}: {item: Peripheral}) => (
    <Pressable onPress={() => togglePeripheralConnection(item)}>
      <View style={styles.row}>
        {item.connecting ? (
          <Text style={styles.peripheralName}>Connecting...</Text>
        ) : (
          <>
            <Text style={styles.peripheralName}>{item.name || 'NO NAME'}</Text>
            <Text style={styles.rssi}>RSSI: {item.rssi}</Text>
            <Text style={styles.peripheralId}>{item.id}</Text>
            <Text style={styles.peripheralId}>
              {item.advertising.isConnectable
                ? 'Connectable'
                : 'Not Connectable'}
            </Text>
          </>
        )}
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.body}>
      <StatusBar />
      <View style={styles.buttonGroup}>
        <Pressable
          style={styles.scanButton}
          onPress={() => {
            btState === 'on' ? startScan() : enableBluetooth();
          }}>
          <Text style={styles.scanButtonText}>
            {btState === 'off'
              ? 'Enabled Bluetooth'
              : isScanning
              ? 'Scanning...'
              : 'Scan Bluetooth'}
          </Text>
        </Pressable>
      </View>
      <FlatList
        data={Array.from(peripherals.values())}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
    </SafeAreaView>
  );
};

const boxShadow = {
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
  elevation: 5,
};

const styles = StyleSheet.create({
  engine: {
    position: 'absolute',
    right: 10,
    bottom: 0,
    color: Colors.black,
  },
  buttonGroup: {
    flexDirection: 'row',
    width: '100%',
  },
  scanButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#0a398a',
    margin: 10,
    borderRadius: 12,
    flex: 1,
    ...boxShadow,
  },
  scanButtonText: {
    fontSize: 16,
    letterSpacing: 0.25,
    color: Colors.white,
  },
  body: {
    backgroundColor: '#0082FC',
    flex: 1,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
  },
  highlight: {
    fontWeight: '700',
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
  },
  peripheralName: {
    fontSize: 16,
    textAlign: 'center',
    padding: 10,
  },
  rssi: {
    fontSize: 12,
    textAlign: 'center',
    padding: 2,
  },
  peripheralId: {
    fontSize: 12,
    textAlign: 'center',
    padding: 2,
  },
  row: {
    minHeight: 100,
    marginLeft: 10,
    marginRight: 10,
    marginVertical: 10,
    backgroundColor: '#0a398a',
    ...boxShadow,
  },
  noPeripherals: {
    margin: 10,
    textAlign: 'center',
    color: Colors.white,
  },
});

export default SearchBLE;
