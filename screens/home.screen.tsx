import { FontAwesome } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { scale, verticalScale } from 'react-native-size-matters';

export default function HomeScreen() {
    let [fontLoaded, fontError] = useFonts({
        SegoeUI: require("../assets/fonts/Segoe-UI.ttf"),
    })
    if (!fontLoaded && !fontError) {
        return null;
    }
    return (
        <LinearGradient
            colors={['#250152', '#000000']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.container}
        >
            <StatusBar barStyle="light-content" />
            <Image
                source={require('@/assets/images/blur.png')}
                style={{
                    position: 'absolute', right: scale(-15), top: scale(0),
                    width: scale(240)
                }}
            />
            <Image
                source={require('@/assets/images/purple-blur.png')}
                style={{
                    position: 'absolute', left: scale(-15), bottom: verticalScale(100),
                    width: scale(210)
                }}
            />
            <View style={{ marginTop: verticalScale(-40) }}>
                <TouchableOpacity style={{
                    width: scale(110),
                    height: scale(110),
                    alignItems: 'center',
                    backgroundColor: '#fff',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    borderRadius: scale(100)

                }}>
                    <FontAwesome name="microphone" size={scale(50)} color="#2b3356" />
                </TouchableOpacity>
            </View>
            <View style={{
                alignItems: 'center', width: scale(350),
                position: 'absolute', bottom: verticalScale(90)
            }}>
                <Text style={{
                    color: '#fff', fontSize: scale(16), width: scale(269), textAlign: 'center',
                    fontFamily: 'SegoeUI',
                    lineHeight: scale(24)
                }}>
                    Press the button and start speaking!.
                </Text>
                <Text style={{
                    marginTop: verticalScale(100), color: '#fff',
                    fontSize: scale(12), fontWeight: '500'
                }}>VIORA</Text>
                <Text style={{ color: '#9A9999', fontSize: scale(10), fontFamily: 'SegoeUI', fontWeight: '400' }}>Ai Voice Assistant</Text>

            </View>

        </LinearGradient>
    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#131313'
    }
})