import React, {useEffect, useState} from 'react';
import { SafeAreaView, View, Text, Alert, ActivityIndicator, Image, Animated, TouchableOpacity } from 'react-native';
import MapView, { Callout, Marker } from 'react-native-maps';
import constants from '../../constants/constants';
import {useGrocery} from '../../context/grocery';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '../../context/user';
import { MaterialIcons } from "@expo/vector-icons";
import { showMessage } from "react-native-flash-message";
import styles from './styles';

const HomeScreen = ( {navigation} ) => {

  const [userLatitude,setUserLatitude] = useState(null)
  const [userLongitude,setUserLongitude] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [groceries, setGroceries] = useState([])
  const {setGroceryId} = useGrocery()
  const {pickedItem,setPickedItem,userOrder,setUserOrder,checkOrderIdRelativeToGrocery,setCheckOrderIdRelativeToGrocery,setCartPrice,setCartQuantity,cartQuantity,setIsLocation} = useUser()
  
  // To get user live location:
  // 1.If user give access to get his location, 
  // the groceries near him will appear on map, 
  // and the map will open as initial region at his location
  // 2.Else all groceries will appear on map, 
  // and the map will open as initial region at Beirut
  async function getLocation(){
    try{
      let {status} = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission not granted",
          "Allow the app rto use location service.",
          [{text: "OK"}],
          {cancelable: false}
        )
      }
      let {coords} = await Location.getCurrentPositionAsync();
      if (coords) {
        const {latitude, longitude} = coords;
        let response = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        })
        let result = `lat: ${latitude} / long: ${longitude}`
        AsyncStorage.setItem('user_latitude',latitude.toString());
        AsyncStorage.setItem('user_longitude',longitude.toString());
        setUserLatitude(latitude)
        setUserLongitude(longitude)
        setIsLocation(true)
        setIsLoading(false)
        getGroceries(true)
        showMessage({
          message: "You are viewing the nearest grocereis.",
          type: "info",
        });
      }
    }catch(error){
      getGroceries(false)
      setIsLoading(false)
      showMessage({
        message: "You are viewing all grocereis.",
        type: "info",
      });
    }
  }

  // Funtion to get all groceries if user didn't give access to get his live location
  // Else it will give the near by groceries
  const getGroceries = async (state) => {
    try {
      const token = await AsyncStorage.getItem('token');

      if(state){
        const userId = await AsyncStorage.getItem('user_id');
        const userLatitude = await AsyncStorage.getItem('user_latitude');
        const userLongitude = await AsyncStorage.getItem('user_longitude');
    
        const response = await fetch(`${constants.fetch_url}find_nearby_groceries?id=${userId}`,{
          method: 'POST',
          headers: {
            'x-access-token': token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            latitude: parseFloat(userLatitude),
            longitude: parseFloat(userLongitude)
          })
        });
        const data = await response.json();
        setGroceries(data)

      }else{
        const response = await fetch(`${constants.fetch_url}get_groceries`,{
          headers: {
            'x-access-token': token,
            'Content-Type': 'application/json'
          },
        });
        const data = await response.json();
        setGroceries(data)
      }
      
    } catch (error) {
      showMessage({
        message: "Something went wrong.",
        type: "danger",
      });
    }
  };

   // Pop up to check if the user wants to dismiss his recent order
   const dismissPopUp = ()=>{
      Alert.alert(
          'You have picked items from another grocery.',
          'Choose what to do',
        [
          {
            text: 'Cancel',         
            onPress: () => null
          },
          {
            text: 'Dismiss & Create New Order',         
            // Reset cart and order then navigate
            onPress: () => { 
              setCheckOrderIdRelativeToGrocery(null)
              setUserOrder(null)
              setPickedItem(null)
              setCartPrice(0) // Reseting the order price
              setCartQuantity(0) // Reseting the order qauntity
              navigation.navigate('Grocery')
            }
          }
        ]
      )
   }

  useEffect(() => {
    getLocation();
  }, []);

  return (
    <SafeAreaView style={styles.container}>

      {/* HomeHeader */}
      <View style={styles.account}>
        <MaterialIcons name='account-circle' size={28} onPress={() => navigation.push('Account')} style={styles.account_icon}/>
        {/* This icon is related to the live tracking feature */}
        {/* <MaterialIcons name='track-changes' size={28} onPress={() => navigation.push('OrderTracking')} style={styles.trackIcon}/> */}
        <View> 
          <Text style={styles.header_text}>Fruitable</Text> 
        </View>
        <MaterialIcons name='shopping-cart' size={28} style={styles.cart_icon}
          onPress={() => {
            if(userOrder){
              navigation.push('Order')
            } else{
              showMessage({
                message: "Your cart is empty.",
                type: "warning",
              });
            }
          }}
        />
        <View style={styles.quantity_view}> 
          <Text style={styles.quantity_text}>{cartQuantity} </Text> 
        </View>
      </View>

      {
        isLoading ?  
        <View style={styles.activity}>
          <ActivityIndicator size={50}/>
        </View>:
        null 
      }

      {/* Show Groceries as markers on map */}
        <MapView
        style={styles.container}
        initialRegion={{
          latitude: userLatitude ? parseFloat(userLatitude) : parseFloat(33.888630),
          longitude: userLongitude ? parseFloat(userLongitude) : parseFloat(35.495480),
          latitudeDelta: 0.09,
          longitudeDelta: 0.04
        }}
        >  
        {groceries.map((item, key) => {
          var id = item._id
          return(
          <Marker 
          coordinate={{latitude: item.latitude, longitude: item.longitude}}
          title="{item.name}"
          description="{item.description}"
          key={key}
          >
            <Callout tooltip onPress={()=>{
                setGroceryId(id)
                if(checkOrderIdRelativeToGrocery && (id != checkOrderIdRelativeToGrocery)){
                  dismissPopUp()
                }else{
                  navigation.navigate('Grocery')
                }
            }
            }>
              <View>
                  <View style={styles.marker_tooltip}>
                    <Text style={styles.marker_title}>{item.name}</Text>
                    <Text>{item.description}</Text>
                  </View>
                <View style={styles.arrow_border}/>
                <View style={styles.arrow}/>
              </View>
            </Callout>
          </Marker>
        )})}
      </MapView>

      {/* Show Groceries as horizontal scrollable view on map */}
        <Animated.ScrollView
          horizontal
          scrollEventThrottle={1}
          showsHorizontalScrollIndicator={false}
          style={styles.card_scroll_view}
        >
          {groceries.map((item, key) => {
            return(
              <TouchableOpacity 
              key={key} 
              onPress={()=>{
                setGroceryId(item._id)
                if(checkOrderIdRelativeToGrocery && (item._id != checkOrderIdRelativeToGrocery)){
                  dismissPopUp()
                }else{
                  navigation.navigate('Grocery')
                }
              }}>
                <View style={styles.card_view} >
                  <Image
                    source={{uri: item.picture}}
                    resizeMode='cover'
                    style={styles.card_image}
                  />
                  <View style={{flex:2,padding:10}}>
                    <Text numberOfLines={1} style={styles.title}>{item.name}</Text>
                    <Text numberOfLines={1} style={styles.description}>{item.description}</Text>
                    <View style={styles.card_inner_view}>
                    </View>
                  </View>
                </View>
            </TouchableOpacity>
          )})}
        </Animated.ScrollView>

    </SafeAreaView>
  );
}

export default HomeScreen;