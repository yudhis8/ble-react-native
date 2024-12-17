import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useState, useEffect, useCallback} from 'react';
import notifee from '@notifee/react-native';

import BleManager, {
  BleDisconnectPeripheralEvent,
  BleManagerDidUpdateValueForCharacteristicEvent,
  Peripheral,
} from 'react-native-ble-manager';
import {PeripheralDetailsProps} from '../screens/detailble';

declare module 'react-native-ble-manager' {
  // enrich local contract with custom state properties needed by App.tsx
  interface Peripheral {
    connected?: boolean;
    connecting?: boolean;
  }
}

type NavigationProp = NativeStackNavigationProp<
  PeripheralDetailsProps,
  'PeripheralDetails'
>;

export const useBluetoothManager = () => {
  const navigation = useNavigation<NavigationProp>();
  const [isScanning, setIsScanning] = useState(false);
  const [btState, setBtState] = useState('off');
  const [peripherals, setPeripherals] = useState(new Map<string, Peripheral>());

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

  const stopScan = useCallback(() => {
    handleNotification('Stop Scan', 'Stop scanning for peripherals');
    setIsScanning(false);
    console.debug('[stopScan] Scanning stopped');
  }, []);

  function sleep(ms: number) {
    return new Promise<void>(resolve => setTimeout(resolve, ms));
  }

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
        await sleep(900);
        const peripheralData = await BleManager.retrieveServices(peripheral.id);
        console.debug(
          `[connectPeripheral][${peripheral.id}] retrieved peripheral services`,
          peripheralData,
        );

        setPeripherals(map => {
          let p = map.get(peripheral.id);
          if (p) {
            return new Map(map.set(p.id, p));
          }
          return map;
        });
        const rssi = await BleManager.readRSSI(peripheral.id);
        console.debug(
          `[connectPeripheral][${peripheral.id}] retrieved current RSSI value: ${rssi}.`,
        );

        if (peripheralData.characteristics) {
          for (const characteristic of peripheralData.characteristics) {
            if (characteristic.descriptors) {
              for (const descriptor of characteristic.descriptors) {
                try {
                  let data = await BleManager.readDescriptor(
                    peripheral.id,
                    characteristic.service,
                    characteristic.characteristic,
                    descriptor.uuid,
                  );
                  console.debug(
                    `[connectPeripheral][${peripheral.id}] ${characteristic.service} ${characteristic.characteristic} ${descriptor.uuid} descriptor read as:`,
                    data,
                  );
                } catch (error) {
                  console.error(
                    `[connectPeripheral][${peripheral.id}] failed to retrieve descriptor ${descriptor} for characteristic ${characteristic}:`,
                    error,
                  );
                }
              }
            }
          }
        }

        setPeripherals(map => {
          let p = map.get(peripheral.id);
          if (p) {
            p.rssi = rssi;
            return new Map(map.set(p.id, p));
          }
          return map;
        });
        handleNotification('Connected', `Connected to ${peripheral.id}`);
        navigation.navigate('PeripheralDetails', {
          peripheralData: peripheralData,
        });
      }
    } catch (err) {
      console.error('[connectPeripheral] Error:', err);
    }
  };

  const disconnectPeripheral = async (peripheral: Peripheral) => {
    try {
      handleNotification(
        'Disconnecting',
        `Disconnecting from ${peripheral.id}`,
      );
      await BleManager.disconnect(peripheral.id);
      console.debug(
        `[disconnectPeripheral] Disconnected from ${peripheral.id}`,
      );
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

  const togglePeripheralConnection = async (peripheral: Peripheral) => {
    if (peripheral.connected) {
      await disconnectPeripheral(peripheral);
    } else {
      await connectPeripheral(peripheral);
    }
  };

  const handleDiscoverPeripheral = (peripheral: Peripheral) => {
    if (!peripheral.name) peripheral.name = 'NO NAME';
    setPeripherals(prev => new Map(prev).set(peripheral.id, peripheral));
  };

  const handleDisconnectedPeripheral = (
    event: BleDisconnectPeripheralEvent,
  ) => {
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

  const handleUpdateValueForCharacteristic = (
    event: BleManagerDidUpdateValueForCharacteristicEvent,
  ) => {
    console.debug(
      `[handleUpdateValueForCharacteristic] Data from ${event.peripheral}:`,
      event.value,
    );
  };

  const checkBluetoothState = async () => {
    try {
      const state = await BleManager.checkState();
      setBtState(state);
      console.debug('[checkBluetoothState] Bluetooth state:', state);
    } catch (err) {
      console.error('[checkBluetoothState] Error:', err);
    }
  };

  const enableBluetooth = async () => {
    try {
      await BleManager.enableBluetooth();
      console.debug('[enableBluetooth] Bluetooth enabled');
      checkBluetoothState();
    } catch (err) {
      console.error('[enableBluetooth] Error:', err);
    }
  };

  useEffect(() => {
    BleManager.start({showAlert: false}).catch(err =>
      console.error('[BleManager] Error starting:', err),
    );
    checkBluetoothState();

    const discoverListener = BleManager.onDiscoverPeripheral(
      handleDiscoverPeripheral,
    );
    const disconnectListener = BleManager.onDisconnectPeripheral(
      handleDisconnectedPeripheral,
    );
    const updateListener = BleManager.onDidUpdateValueForCharacteristic(
      handleUpdateValueForCharacteristic,
    );
    const stopScanListener = BleManager.onStopScan(stopScan);

    return () => {
      discoverListener.remove();
      disconnectListener.remove();
      updateListener.remove();
      stopScanListener.remove();
    };
  }, [stopScan]);

  return {
    isScanning,
    peripherals,
    btState,
    startScan,
    stopScan,
    enableBluetooth,
    connectPeripheral,
    disconnectPeripheral,
    togglePeripheralConnection,
  };
};
