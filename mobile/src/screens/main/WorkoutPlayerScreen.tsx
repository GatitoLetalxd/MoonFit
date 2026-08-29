import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { WorkoutPlayer } from '../../components/routines/WorkoutPlayer';

export const WorkoutPlayerScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation,
}) => {
  const { routine } = route.params;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0F17" />
      <WorkoutPlayer
        routine={routine}
        onFinish={() => navigation.goBack()}
        onCancel={() => navigation.goBack()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F17',
  },
});
