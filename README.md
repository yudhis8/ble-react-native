# BLE Module Hook

This module provides a custom React hook for managing Bluetooth Low Energy (BLE) peripherals using the `react-native-ble-manager` and `notifee` libraries. It includes functions to scan, connect, disconnect, and manage the state of BLE peripherals.

## Installation

To use this hook, you need to install the following dependencies:

```sh
npm install react-native-ble-manager @notifee/react-native
```

# Usage

## Importing the Hook

```sh
import useBluetoothManager from './src/hooks/blemodule.hook';
```

## Example

```sh
import React from 'react';
import { View, Text, Pressable, FlatList } from 'react-native';
import useBluetoothManager from './src/hooks/blemodule.hook';

const App = () => {
  const {
    isScanning,
    peripherals,
    startScan,
    stopScan,
    enableBluetooth,
    connectPeripheral,
    disconnectPeripheral,
    togglePeripheralConnection,
  } = useBluetoothManager();

  const renderItem = ({ item }) => (
    <Pressable onPress={() => togglePeripheralConnection(item)}>
      <View>
        <Text>{item.name || 'NO NAME'}</Text>
        <Text>{item.id}</Text>
        <Text>{item.connected ? 'Connected' : 'Disconnected'}</Text>
      </View>
    </Pressable>
  );

  return (
    <View>
      <Pressable onPress={startScan}>
        <Text>{isScanning ? 'Scanning...' : 'Start Scan'}</Text>
      </Pressable>
      <FlatList
        data={Array.from(peripherals.values())}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
    </View>
  );
};

export default App;
```

## Hook API

`useBluetoothManager`

This hook provides the following state and functions:

- State:

  - `isScanning`: A boolean indicating if the scan is in progress.
  - `peripherals`: A map of discovered peripherals.
  - `btState`: The current Bluetooth state.

- Functions:
  - `startScan()`: Starts scanning for BLE peripherals.
  - `stopScan()`: Stops scanning for BLE peripherals.
  - `enableBluetooth()`: Enables Bluetooth on the device.
  - `connectPeripheral(peripheral: Peripheral)`: Connects to a specified peripheral.
  - `disconnectPeripheral(peripheral: Peripheral)`: Disconnects from a specified peripheral.
  - `togglePeripheralConnection(peripheral: Peripheral)`: Toggles the connection state of a specified peripheral.

## Functions

`startScan`
Starts scanning for BLE peripherals.

```sh
const startScan = async () => {
  handleNotification('Start Scan', 'Start scanning for peripherals');
  if (!isScanning) {
    setPeripherals(new Map());
    setIsScanning(true);
    BleManager.scan([], 3, true)
      .then(() => console.debug('[startScan] Scanning started'))
      .catch(err => console.error('[startScan] Error:', err));
  }
};
```

`stopScan`
Stops scanning for BLE peripherals.

```sh
const stopScan = useCallback(() => {
  handleNotification('Stop Scan', 'Stop scanning for peripherals');
  setIsScanning(false);
  console.debug('[stopScan] Scanning stopped');
}, []);
```

`connectPeripheral`
Connects to a BLE peripheral and updates its state.

```sh
const connectPeripheral = async (peripheral: Peripheral) => {
  try {
    if (peripheral) {
      handleNotification('Connecting', `Connecting to ${peripheral.id}`);
      setPeripherals(map => {
        let p = map.get(peripheral.id);
        if (p) {
          p.connecting = true;
          return new Map(map.set(p.id, p));
        }
        return map;
      });

      await BleManager.connect(peripheral.id);
      console.debug(`[connectPeripheral] Connected to ${peripheral.id}`);
      setPeripherals(map => {
        let p = map.get(peripheral.id);
        if (p) {
          p.connecting = false;
          p.connected = true;
          return new Map(map.set(p.id, p));
        }
        return map;
      });
    }
  } catch (err) {
    console.error('[connectPeripheral] Error:', err);
  }
};
```

`disconnectPeripheral`
Disconnects from a BLE peripheral and updates its state.

```sh
const disconnectPeripheral = async (peripheral: Peripheral) => {
  try {
    handleNotification('Disconnecting', `Disconnecting from ${peripheral.id}`);
    await BleManager.disconnect(peripheral.id);
    console.debug(`[disconnectPeripheral] Disconnected from ${peripheral.id}`);
    setPeripherals(prev => {
      const updated = new Map(prev);
      const p = updated.get(peripheral.id);
      if (p) {
        p.connected = false;
        updated.set(peripheral.id, p);
      }
      return updated;
    });
    handleNotification('Disconnected', `Disconnected from ${peripheral.id}`);
  } catch (err) {
    console.error('[disconnectPeripheral] Error:', err);
  }
};
```

`togglePeripheralConnection`
Toggles the connection state of a BLE peripheral.

```sh
const togglePeripheralConnection = async (peripheral: Peripheral) => {
  if (peripheral.connected) {
    await disconnectPeripheral(peripheral);
  } else {
    await connectPeripheral(peripheral);
  }
};
```

`enableBluetooth`
Enables Bluetooth on the device.

```sh
const enableBluetooth = async () => {
   try {
      await BleManager.enableBluetooth();
      console.debug('[enableBluetooth] Bluetooth enabled');
      checkBluetoothState();
    } catch (err) {
      console.error('[enableBluetooth] Error:', err);
    }
```

`checkBluetoothState`
Checks the Bluetooth state and updates the state accordingly.

```sh
const checkBluetoothState = async () => {
    try {
      const state = await BleManager.checkState();
      setBtState(state);
      console.debug('[checkBluetoothState] Bluetooth state:', state);
    } catch (err) {
      console.error('[checkBluetoothState] Error:', err);
    }
  };
```

`handleNotification`
Handles notifications and updates the state accordingly.

```sh
const handleNotification = async (title: string, body: string) => {
    const channelId = await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
    });

    await notifee.displayNotification({
      id: '999',
      title,
      body,
      android: {
        channelId,
      },
    });
  };
```

`togglePeripheralConnection`
Toggles the connection state of a BLE peripheral.

```sh
const togglePeripheralConnection = async (peripheral: Peripheral) => {
  if (peripheral.connected) {
    await disconnectPeripheral(peripheral);
  } else {
    await connectPeripheral(peripheral);
  }
};
```

`handleDiscoverPeripheral`
Handles the discovery of a BLE peripheral.

```sh
const handleDiscoverPeripheral = (peripheral: Peripheral) => {
  if (!peripheral.name) peripheral.name = 'NO NAME';
  setPeripherals(prev => new Map(prev.set(peripheral.id, peripheral)));
};
```

`handleDiscoverPeripheral`
Handles the discovery of a BLE peripheral.

```sh
const handleDiscoverPeripheral = (peripheral: Peripheral) => {
  if (!peripheral.name) peripheral.name = 'NO NAME';
  setPeripherals(prev => new Map(prev.set(peripheral.id, peripheral)));
};
```

`handleDisconnectedPeripheral`
Handles the disconnection of a BLE peripheral.

```sh
const handleDisconnectedPeripheral = (event: BleDisconnectPeripheralEvent) => {
  setPeripherals(prev => {
    const updated = new Map(prev);
    const p = updated.get(event.peripheral);
    if (p) {
      p.connected = false;
      updated.set(event.peripheral, p);
    }
    return updated;
  });
};
```

License
This project is licensed under the MIT License. ```
