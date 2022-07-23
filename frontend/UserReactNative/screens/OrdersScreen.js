import React, {useEffect, useState} from 'react';
import { StyleSheet, Text, SafeAreaView, ScrollView, Image, View } from 'react-native';
import ViewCart from '../components/ViewCart';
import ButtonComponent from '../components/ButtonComponent';
import constants from '../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OrdersScreen = ({route}) => {

  const {orderId,grocery} = route.params;

  const [cartItems,setCartItems] = useState([])

  const viewCart = async () => {
    try {
      const token = await AsyncStorage.getItem('token');

      const response = await fetch(`${constants.fetch_url}view_cart?id=${orderId}`,{
        headers: {
          'x-access-token': token,
        }
      });
      const data = await response.json();
      setCartItems(data)
      
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    viewCart();
  }, [orderId,grocery]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.major_info}> {grocery.name} - {grocery.phone_number} </Text>
        <Text style={styles.description}> {grocery.description}</Text>
        <ViewCart items={cartItems.items}/>
        <ButtonComponent 
          onPress={() => alert("Hello World!") }
          touchable_style={styles.button}
          border_color="#FDBE3B"
          text_style={styles.textSign}
          text_color="#FDBE3B"
          text="Order Now"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

export default OrdersScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    backgroundColor: '#ffffff',
    marginHorizontal: 10,
  },
  major_info: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginTop: 25,
    marginBottom: 25
  },
  description: {
    textAlign: 'center'
  },
});