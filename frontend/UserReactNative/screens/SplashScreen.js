import { useEffect } from 'react';
import { Dimensions, StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import * as Animatable from 'react-native-animatable';

const SplashScreen = ({ navigation }) => {

    const launchApp = () => {
        setTimeout(function(){
            navigation.navigate('LoginScreen')
        }, 3000);
    }

    useEffect(() => {
    launchApp();
  }, []);

  return (
    <View style={styles.container}>

        <View style={styles.header}>
            <Animatable.Image animation="bounceIn" duration={3000} source={require('../assets/logo.png')} style={styles.logo} />
        </View>
    </View>
  );
}

export default SplashScreen;

const {height} = Dimensions.get("screen");
const height_logo = height * 0.28;

const styles = StyleSheet.create({
    container: {
        flex:1,
        backgroundColor: "#FDBE3B"
    },
    header: {
        flex:2,
        justifyContent: 'center',
        alignItems: 'center'
    },
    logo: {
        width: height_logo,
        height: height_logo
    },
})