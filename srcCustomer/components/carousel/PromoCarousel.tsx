import React, { useState } from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import BannerItem, { BannerData } from './BannerItem';
import { useTheme } from '../../../ThemeContext';

const width = Dimensions.get('window').width;

interface PromoCarouselProps {
  data: BannerData[];
}

const PromoCarousel = ({ data }: PromoCarouselProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors, isDark);

  return (
    <View style={styles.wrapper}>
      <Carousel
        loop
        width={width - 32} // Account for 16px horizontal padding
        height={200}
        style={styles.carouselStyle}
        autoPlay={true}
        autoPlayInterval={3000}
        data={data}
        scrollAnimationDuration={1000}
        onSnapToItem={index => setActiveIndex(index)}
        renderItem={({ item }) => <BannerItem item={item} />}
      />

      {/* Pagination Dots */}
      {data.length > 1 && (
        <View style={styles.pagination}>
          {data.map((_, index) => {
            const isActive = activeIndex === index;
            return (
              <View
                key={index}
                style={[
                  styles.dot,
                  isActive ? styles.activeDot : styles.inactiveDot,
                ]}
              />
            );
          })}
        </View>
      )}
    </View>
  );
};

// --- Themed Styles ---

const makeStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    wrapper: {
      alignItems: 'center',
      marginVertical: 16,
      backgroundColor: 'transparent',
    },
    carouselStyle: {
      borderRadius: 12,
      backgroundColor: colors.surface,
      // Add shadow for light mode to lift the carousel off the background
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0 : 0.1,
      shadowRadius: 8,
      elevation: isDark ? 0 : 5,
    },
    pagination: {
      flexDirection: 'row',
      position: 'absolute',
      bottom: 12, // Position dots inside the carousel overlay
      zIndex: 10,
    },
    dot: {
      height: 6,
      borderRadius: 3,
      marginHorizontal: 4,
    },
    activeDot: {
      width: 20, // Expanded width for active indicator
      backgroundColor: 'white', // White is best for high-contrast over image banners
    },
    inactiveDot: {
      width: 6,
      backgroundColor: 'rgba(255, 255, 255, 0.4)',
    },
  });

export default PromoCarousel;
