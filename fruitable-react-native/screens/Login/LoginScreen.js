import React, {useState} from 'react';
import { Text, View, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Animatable from 'react-native-animatable';
import TextInputField from '../../components/TextInputField';
import PasswordInputField from '../../components/PasswordInputField';
import ButtonComponent from '../../components/ButtonComponent';
import constants from '../../constants/constants';
import {useUser} from '../../context/user';
import { showMessage } from "react-native-flash-message";
import styles from './styles';

const LoginScreen = ({navigation}) => {

  const {
    setUserId,
    setUserFirstname,
    setUserLastName,
    setUserEmail,
    setToken,
    setUserGender,
    setUserLatitude,
    setUserLongitude,
    setUserProfilePicture
  } = useUser()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const LogIn = async () => {
    try{
        const response = await fetch(`${constants.fetch_url}login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });
        const data = await response.json();

        // Store the user info in UserContext
        if(data._id){
          setUserId(data._id)
          setUserFirstname(data.first_name)
          setUserLastName(data.last_name)
          setUserEmail(data.email)
          setToken(data.token)
          setUserGender(data.gender)
          setUserLatitude(data.latitude)
          setUserLongitude(data.longitude)
          setUserProfilePicture(data.profile_picture)
          await AsyncStorage.setItem('token',data.token);
          await AsyncStorage.setItem('user_id',data._id);
          await AsyncStorage.setItem('first_name',data.first_name);
          await AsyncStorage.setItem('last_name',data.last_name);
          await AsyncStorage.setItem('profile_picture',data.profile_picture);
        }
    } catch (error) {
      showMessage({
        message: "Wrong email and / or password.",
        type: "danger",
      });
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor='#FDBE3B' barStyle="light-content" />
      <View style={styles.header}>
        <Animatable.Image animation="bounceIn" duration={3000} source={require('../../assets/logo3.png')} style={styles.logo} />
        <Text style={styles.text_header}>Log In</Text>
      </View>

      <Animatable.View style={styles.footer} animation="fadeInUpBig">
        {/* Email Field */}
        <TextInputField
          label="Email"
          main_icon={require("../../assets/icons/icons8-mail-account-32.png")}
          placeholder="Enter Your Email"
          helper_icon={require("../../assets/icons/icons8-checkmark-32.png")}
          setState={setEmail}
        />

        {/* Password Field */}
        <PasswordInputField
        label="Password"
          main_icon={require("../../assets/icons/icons8-lock-32.png")}
          placeholder="Enter Your Password"
          helper_icon1={require("../../assets/icons/icons8-eye-32.png")}
          helper_icon2={require("../../assets/icons/icons8-closed-eye-32.png")}
          setState={setPassword}
        />

        {/* Log In Button */}
        {(!email || !password) ? 
        <ButtonComponent 
          onPress={() => showMessage({
            message: "All fields are required.",
            type: "info",
          })}
          touchable_style={styles.disable_button}
          border_color="#AAA8A8"
          text_style={styles.text_sign}
          text_color="#FFFFFF"
          text="Continue"
        />
        :
        <ButtonComponent
          onPress={() => LogIn()}
          touchable_style={styles.button}
          border_color="#FDBE3B"
          text_style={styles.text_sign}
          text_color="#FFFFFF"
          text="Log In"
        />
        }

        {/* Create Account Button */}
        <ButtonComponent
          onPress={() => navigation.navigate('SignupScreenOne')}
          touchable_style={styles.sign_in}
          border_color="#FDBE3B"
          text_style={styles.text_sign}
          text_color="#FDBE3B"
          text="New? Create an Account"
        />
      </Animatable.View>
    </View>
  );
}

export default LoginScreen;