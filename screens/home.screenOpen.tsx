import Regenerate from '@/assets/svgs/regenerate';
import Reload from '@/assets/svgs/reload';
import { AntDesign, FontAwesome } from '@expo/vector-icons';
import axios from 'axios';
import { Audio } from 'expo-av';
import { useFonts } from 'expo-font';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from "expo-speech";
import LottieView from "lottie-react-native";
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Image, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { scale, verticalScale } from 'react-native-size-matters';
export default function HomeScreen() {
    let [fontLoaded, fontError] = useFonts({
        SegoeUI: require("../assets/fonts/Segoe-UI.ttf"),
    })
    if (!fontLoaded && !fontError) {
        return null;
    }


    const [text, setText] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [loading, setLoading] = useState(false);
    const [recording, setRecording] = useState<Audio.Recording>();
    const [AIResponse, setAIResponse] = useState(false);
    const lottieRef = useRef<LottieView>(null);
    const [AISpeaking, setAISpeaking] = useState(false);



    const getMicrophonePermission = async () => {
        try {
            const { granted } = await Audio.requestPermissionsAsync();

            if (!granted) {
                Alert.alert('Microphone Permission Required', 'Please allow access to the microphone to use this feature.', [{ text: 'OK' }]);
                return false;
            }
            return true;
        } catch (error) {
            console.error('Error requesting microphone permission:', error);
            return false;
        }
    }
    const recordingOptions: any = {
        android: {
            extension: ".wav",
            outPutFormat: Audio.AndroidOutputFormat.MPEG_4,
            androidEncoder: Audio.AndroidAudioEncoder.AAC,
            sampleRate: 44100,
            numberOfChannels: 2,
            bitRate: 128000,
        },
        ios: {
            extension: ".wav",
            audioQuality: Audio.IOSAudioQuality.HIGH,
            sampleRate: 44100,
            numberOfChannels: 2,
            bitRate: 128000,
            linearPCMBitDepth: 16,
            linearPCMIsBigEndian: false,
            linearPCMIsFloat: false,
        },
    };


    const startRecording = async () => {
        const hasPermission = await getMicrophonePermission();
        if (!hasPermission) return;
        try {
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });
            setIsRecording(true);
            const { recording } = await Audio.Recording.createAsync(recordingOptions);
            setRecording(recording);
        } catch (error) {
            console.log("Failed to start Recording", error);
            Alert.alert("Error", "Failed to start recording");
        }
    };
    const stopRecording = async () => {
        try {
            setIsRecording(false);
            setLoading(true);
            await recording?.stopAndUnloadAsync();
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
            });

            const uri = recording?.getURI();

            const transcript = await sendAudioToWhisper(uri!);

            setText(transcript);

            await sendToGpt(transcript);
        } catch (error) {
            console.log("Failed to stop Recording", error);
            Alert.alert("Error", "Failed to stop recording");
        }
    };
    const sendAudioToWhisper = async (uri: string) => {
        try {
            const formData: any = new FormData();
            formData.append("file", {
                uri,
                type: "audio/wav",
                name: "recording.wav",
            });
            formData.append("model", "whisper-1");

            const response = await axios.post(
                "https://api.openai.com/v1/audio/transcriptions",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${process.env.EXPO_PUBLIC_API_KEY}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            console.log(response.data);
            return response.data.text;
        } catch (error) {
            console.log(error);
        }
    };
    const sendToGpt = async (text: string) => {
        try {
            const response = await axios.post(
                "https://api.openai.com/v1/chat/completions",
                {
                    model: "gpt-4",
                    messages: [
                        {
                            role: "system",
                            content:
                                "You are Viora, a friendly AI assistant who responds naturally and referes to yourself as Viora when asked for your name. You are a helpful assistant who can answer questions and help with tasks. You must always respond in English, no matter the input language,and provide helpful, clear answers",
                        },
                        {
                            role: "user",
                            content: text,
                        },
                    ],
                },
                {
                    headers: {
                        Authorization: `Bearer ${process.env.EXPO_PUBLIC_API_KEY}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            setText(response.data.choices[0].message.content);
            console.log(response.data);
            setLoading(false);
            setAIResponse(true);
            await speakText(response.data.choices[0].message.content);
            return response.data.choices[0].message.content;
        } catch (error) {
            console.log("Error sending text to GPT-4", error);
        }
    };

    const speakText = async (text: string) => {
        setAISpeaking(true);
        const options = {
            voice: "com.apple.ttsbundle.Samantha-compact",
            language: "en-US",
            pitch: 1.5,
            rate: 1,
            onDone: () => {
                setAISpeaking(false);
            },
        };
        Speech.speak(text, options);
    };

    useEffect(() => {
        if (AISpeaking) {
            lottieRef.current?.play();
        } else {
            lottieRef.current?.reset();
        }
    }, [AISpeaking]);

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

            {AIResponse && (
                <TouchableOpacity
                    style={{
                        position: "absolute",
                        top: verticalScale(50),
                        left: scale(20),
                    }}
                    onPress={() => {
                        setIsRecording(false);
                        setAIResponse(false);
                        setText("");
                    }}
                >
                    <AntDesign name="arrowleft" size={scale(20)} color="#fff" />
                </TouchableOpacity>
            )}
            <View style={{ marginTop: verticalScale(-40) }}>
                {loading ? (
                    <TouchableOpacity>
                        <LottieView
                            source={require("@/assets/animations/loading.json")}
                            autoPlay
                            loop
                            speed={1.3}
                            style={{ width: scale(270), height: scale(270) }}
                        />
                    </TouchableOpacity>
                ) : (
                    <>
                        {!isRecording ? (
                            <>
                                {AIResponse ? (
                                    <View>
                                        <LottieView
                                            ref={lottieRef}
                                            source={require("@/assets/animations/ai-speaking.json")}
                                            autoPlay={false}
                                            loop={false}
                                            style={{ width: scale(250), height: scale(250) }}
                                        />
                                    </View>
                                ) : (
                                    <TouchableOpacity
                                        style={{
                                            width: scale(110),
                                            height: scale(110),
                                            backgroundColor: "#fff",
                                            flexDirection: "row",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            borderRadius: scale(100),
                                        }}
                                        onPress={startRecording}
                                    >
                                        <FontAwesome
                                            name="microphone"
                                            size={scale(50)}
                                            color="#2b3356"
                                        />
                                    </TouchableOpacity>
                                )}
                            </>
                        ) : (
                            <TouchableOpacity onPress={stopRecording}>
                                <LottieView
                                    source={require("@/assets/animations/animation.json")}
                                    autoPlay
                                    loop
                                    speed={1.3}
                                    style={{ width: scale(250), height: scale(250) }}
                                />
                            </TouchableOpacity>
                        )}
                    </>
                )}
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
                    {loading ? 'Listening...' : text || 'Press the button and start speaking!...'}
                </Text>
                <Text style={{
                    marginTop: verticalScale(25), color: '#fff',
                    fontSize: scale(12), fontWeight: '500'
                }}>VIORA</Text>
                <Text style={{ color: '#9A9999', fontSize: scale(10), fontFamily: 'SegoeUI', fontWeight: '400' }}>Ai Voice Assistant</Text>

            </View>
            {AIResponse && (
                <View
                    style={{
                        position: "absolute",
                        bottom: verticalScale(40),
                        left: 0,
                        paddingHorizontal: scale(30),
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        width: scale(360),
                    }}
                >
                    <TouchableOpacity onPress={() => sendToGpt(text)}>
                        <Regenerate />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => speakText(text)}>
                        <Reload />
                    </TouchableOpacity>
                </View>
            )}

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