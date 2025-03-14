import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { Friends } from '../screens/Friends';
import { Groups } from '../screens/Groups';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

export function MainTabs({ activeTab }) {
  const { colors } = useTheme();
  const slideAnim = useRef(new Animated.Value(0)).current;
  const prevTabRef = useRef(activeTab);

  useEffect(() => {
    // Determine direction of animation based on tab order
    const tabOrder = ['friends', 'groups', 'activity'];
    const prevIndex = tabOrder.indexOf(prevTabRef.current);
    const currentIndex = tabOrder.indexOf(activeTab);
    const direction = prevIndex < currentIndex ? 1 : -1;

    // Reset position if going right
    if (direction === 1) {
      slideAnim.setValue(width);
    } else {
      slideAnim.setValue(-width);
    }

    // Animate to center
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();

    prevTabRef.current = activeTab;
  }, [activeTab]);

  const renderContent = () => {
    switch (activeTab) {
      case 'friends':
        return <Friends />;
      case 'groups':
        return <Groups />;
      case 'activity':
        return (
          <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Placeholder para a tela de Atividade */}
          </View>
        );
      default:
        return <Friends />;
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.animatedContainer,
          {
            transform: [{ translateX: slideAnim }],
          }
        ]}
      >
        {renderContent()}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  animatedContainer: {
    flex: 1,
    width: '100%',
  },
}); 