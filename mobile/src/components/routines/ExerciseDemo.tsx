import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { Image } from 'expo-image';
import { getExerciseSource } from '../../utils/exerciseMedia';
import { theme } from '../../theme';

interface ExerciseDemoProps {
  exerciseName: string;
  size?: 'sm' | 'md' | 'lg';
  style?: any;
}

export const ExerciseDemo: React.FC<ExerciseDemoProps> = ({
  exerciseName,
  size = 'md',
  style,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const source = getExerciseSource(exerciseName);

  const getDimensions = () => {
    switch (size) {
      case 'sm':
        return { width: 72, height: 72, radius: theme.radius.sm };
      case 'lg':
        return { width: '100%' as any, height: 260, radius: theme.radius.lg };
      case 'md':
      default:
        return { width: '100%' as any, height: 180, radius: theme.radius.md };
    }
  };

  const dims = getDimensions();

  return (
    <View style={[styles.container, { width: dims.width, height: dims.height, borderRadius: dims.radius }, style]}>
      <Image
        source={source}
        style={[styles.image, { borderRadius: dims.radius }]}
        contentFit="cover"
        transition={200}
        onLoadStart={() => setLoading(true)}
        onLoad={() => setLoading(false)}
        autoplay={true}
      />
      {loading && (
        <View style={[styles.loaderOverlay, { borderRadius: dims.radius }]}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0F172A',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
