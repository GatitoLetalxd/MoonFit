import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { theme } from '../../theme';
import { ArrowLeft } from 'lucide-react-native';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightAction,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {showBack ? (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <ArrowLeft size={22} color="#fff" />
          </TouchableOpacity>
        ) : (
          <Image
            source={require('../../../assets/logo.png')}
            style={styles.logo}
            resizeMode="cover"
          />
        )}
        <View style={styles.titleContainer}>
          {title ? (
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
          ) : (
            <Text style={styles.brandTitle}>
              MOON<Text style={{ color: theme.colors.primary }}>FIT</Text>
            </Text>
          )}
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>
      {rightAction ? <View style={styles.right}>{rightAction}</View> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: 'rgba(11, 15, 23, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderSubtle,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: theme.radius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 10,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  titleContainer: {
    flex: 1,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1.5,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  subtitle: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 1,
  },
  right: {
    marginLeft: 10,
  },
});
