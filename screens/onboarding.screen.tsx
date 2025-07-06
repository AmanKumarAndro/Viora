import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useRef, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { onBoardingData } from "@/configs/constans";
import { scale, verticalScale } from "react-native-size-matters";
import { useFonts } from "expo-font";
import AntDesign from "@expo/vector-icons/AntDesign";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from "expo-router";

export default function OnBoardingScreen() {
  let [fontLoaded,fontError] = useFonts({
    SegoeUI: require("../assets/fonts/Segoe-UI.ttf"),
  })
  if (!fontLoaded && !fontError) {
    return null;
  }
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(
      contentOffsetX / event.nativeEvent.layoutMeasurement.width
    );
    setActiveIndex(currentIndex);
  };

  const handleSkip = async () => {
    const nextIndex = activeIndex + 1;

    if(nextIndex < onBoardingData.length){
      scrollViewRef.current?.scrollTo({
        x: Dimensions.get("window").width * nextIndex,
        animated: true,
      });
      setActiveIndex(nextIndex);
    } else {
       await AsyncStorage.setItem('onboarding', 'true');
       router.push("/(routes)/home");
    }
  }
  return (
    <LinearGradient
      colors={['#250152', '#000000']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    
    >
      <StatusBar barStyle="light-content" />
      <Pressable
        style={styles.skipContainer}
        onPress={handleSkip}
      >
        <Text style={styles.skipText}>Skip</Text>
        <AntDesign name="arrowright" size={scale(18)} color="white" />
      </Pressable>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        ref={scrollViewRef}
      >
      {onBoardingData.map(
        (item:onBoardingDataType, index:number) => (
          <View key = {index} style={styles.slide} >
            {item.image}
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </View>
        )
      )}
      </ScrollView>
          <View style={styles.paginationContainer}>
            {onBoardingData.map((item, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  {opacity: activeIndex === index ?1:0.3}
                ]}
              />
            ))}
        </View>
    </LinearGradient>
  )
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slide: {
    width: Dimensions.get('window').width,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    textAlign: 'center',
    fontSize: scale(23),
    fontWeight: '500',
    fontFamily: 'SegoeUI',

  },
  subtitle: {
    width: scale(290),
    marginHorizontal: 'auto',
    color: '#9A9999',
    textAlign: 'center',
    fontSize: scale(14),
    fontWeight: '400',
    fontFamily: 'SegoeUI',
    paddingTop: verticalScale(10),
  },
  paginationContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: verticalScale(70),
    justifyContent: 'center',
    alignItems: 'center',
    gap: scale(8),
  },
  paginationDot: {
    width: scale(8),
    height: scale(8),
    borderRadius: 100,
    marginHorizontal: scale(2),
    backgroundColor: '#fff',
  },
  skipContainer:{
    position: 'absolute',
    top: verticalScale(45),
    right: scale(20),
    flexDirection: 'row',
    gap: scale(5),
    alignItems: 'center',
    zIndex: 100,
   
  },
  skipText: {
    color: '#fff',
    fontSize: scale(14),
    fontWeight: '400',
    fontFamily: 'SegoeUI',
  }

});