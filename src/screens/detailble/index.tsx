import {RouteProp, useRoute} from '@react-navigation/native';
import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {PeripheralInfo} from 'react-native-ble-manager';

export interface PeripheralDetailsProps
  extends Record<string, object | undefined> {
  PeripheralDetails: {
    peripheralData: PeripheralInfo;
  };
}

const DetailBLE = () => {
  const route =
    useRoute<RouteProp<PeripheralDetailsProps, 'PeripheralDetails'>>();
  const peripheralData = route.params.peripheralData;
  console.log('peripheralData:', JSON.stringify(peripheralData, null, 2));

  const renderCharacteristicsForService = (serviceUUID: string) => {
    const characteristics = peripheralData.characteristics ?? [];
    return characteristics
      .filter(char => char.service === serviceUUID)
      .map((char, index) => (
        <View key={index} style={styles.characteristicContainer}>
          <Text style={styles.characteristicTitle}>
            Characteristic: {char.characteristic}
          </Text>
          <Text>Properties: {Object.values(char.properties).join(', ')}</Text>
        </View>
      ));
  };

  return (
    <ScrollView
      style={styles.scrollViewStyle}
      contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Peripheral Details</Text>
      <Text style={styles.detail}>name: {peripheralData.name}</Text>
      <Text style={styles.detail}>id: {peripheralData.id}</Text>
      <Text style={styles.detail}>rssi: {peripheralData.rssi}</Text>

      <Text style={[styles.title, styles.titleWithMargin]}>Advertising</Text>
      <Text style={styles.detail}>
        localName: {peripheralData.advertising.localName}
      </Text>
      <Text style={styles.detail}>
        txPowerLevel: {peripheralData.advertising.txPowerLevel}
      </Text>
      <Text style={styles.detail}>
        isConnectable:{' '}
        {peripheralData.advertising.isConnectable ? 'true' : 'false'}
      </Text>
      <Text style={styles.detail}>
        serviceUUIDs: {peripheralData.advertising.serviceUUIDs}
      </Text>

      <Text style={[styles.title, styles.titleWithMargin]}>
        Services && Characteristics
      </Text>
      {peripheralData.services?.map((service, index) => (
        <View key={index} style={styles.serviceContainer}>
          <Text style={styles.serviceTitle}>Service: {service.uuid}</Text>
          {renderCharacteristicsForService(service.uuid)}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  titleWithMargin: {
    marginTop: 20,
  },
  detail: {
    marginTop: 5,
    fontSize: 16,
  },
  serviceContainer: {
    marginTop: 15,
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  characteristic: {
    fontSize: 16,
  },
  scrollViewStyle: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  characteristicContainer: {
    marginTop: 10,
  },
  characteristicTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  propertyText: {
    fontSize: 14,
    marginLeft: 10,
  },
});

export default DetailBLE;
