import React, { useState, useEffect } from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View, FlatList, Image, Modal, Button, Alert } from "react-native";
import constants from '../constants/constants';
import { useGrocery } from "../context/grocery";
import { useUser } from "../context/user";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { showMessage } from "react-native-flash-message";

const ViewItems = () => {

    const {
        groceryItems,
        groceryOrder,
        groceryId,
    } = useGrocery()

    const {userOrder,setUserOrder,token,setToken,setPickedItem,setCheckOrderIdRelativeToGrocery,cartPrice,setCartPrice,cartQuantity,setCartQuantity,isLocation,setIsLocation,setUserLatitude,setUserLongitude} = useUser()

    const [fetchedItems,setFetchedItems] = useState([])
    const [items,setItems] = useState([])
    const elements = []
    // To show and hide item popup
    const [show, setShow] = useState(false)
    const [selectedItem, setSelectedItem] = useState({}) // To open the popup upon click

    // Get items of specific grocery
    const getItems = async () => {
        try{
            const token = await AsyncStorage.getItem('token')
            for (const item in groceryItems) {
                const response = await fetch(`${constants.fetch_url}get_item?id=${groceryItems[item]}`,{
                    headers: {
                        'x-access-token': token,
                        'Content-Type': 'application/json'
                    },
                });
                const result = await response.json();
                elements.push(result)
            }
            setFetchedItems(elements)
            setItems(elements)
        } catch (error) {
            showMessage({
                message: "Something went wrong.",
                type: "danger",
            });
        }
    }

    // Pop up to veiw each item and add to order
    const ItemPopUp = ({item})=>{
        return (
            <View style={styles.item_container}>
                <Modal transparent={true} visible={show}>
                    <View style={styles.item_main_screen}>
                        <View style={styles.item_popup}>
                            <View style={{flex:1}}>
                                <Image style={styles.item_picture} source={{uri: item.picture}}/>
                                <Text style={styles.item_info}>{item.name}</Text>
                                <Text style={styles.item_price}>LBP {item.price} for {item.quantity} Kg</Text>
                            </View>
                            <View style={styles.cart_button}>
                                <Button title="Add To Cart" color={"#FDBE3B"} 
                                    onPress={() => {
                                        if(!userOrder){
                                            isOrder(item.name,item.price,item.picture,item.quantity)
                                            setShow(false)
                                        }else{
                                            addToCart(item.name,item.price,item.picture,item.quantity) 
                                            setShow(false)
                                        }
                                    }} />
                            </View>
                            <Button title="Close" color={"#000"} onPress={() => setShow(false)} />
                        </View>
                    </View>
                </Modal>
            </View>
        )
    }

    // Displaying items
    const renderItem = ({ item, index })  =>{
        const handleOpen = () =>{
            setSelectedItem(item)
            setShow(true)
        }
        return(
            <TouchableOpacity onPress={handleOpen}>
                <View key={index} style={styles.item} >
                    <Text style={styles.item_body}>
                        <Text style={styles.item_name}>
                            {item.name}
                        </Text>
                        <Text style={styles.item_price}>
                            {"\n"}{"\n"}LBP {item.price} - {item.quantity} Kg
                        </Text>
                    </Text>
                    <Image style={styles.item_img} source={{uri: item.picture}}/>
                </View>
            </TouchableOpacity>
        )
    }

    // Adding separator between items
    const separator = () => {
        return <View style={{height: 1, backgroundColor: '#f1f1f1'}}/>
    }

    // Create order then add the item to it after checking if the user gave permission to get his location
    const isOrder = async (name,price,picture,quantity) => {
        try {
            if(!isLocation){
                getLocation()
            } else{
                const token = await AsyncStorage.getItem('token');
                const user_id = await AsyncStorage.getItem('user_id');
                const username = await AsyncStorage.getItem('first_name');

                setToken(token)   

                const response = await fetch(`${constants.fetch_url}create_order`, {
                    method: 'POST',
                    headers: {
                        'x-access-token': token,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        user: user_id,
                        grocery: groceryId,
                        username: username
                    })
                });

                const data = await response.json();

                if(data._id){
                    const order = await AsyncStorage.setItem('order',data._id);
                    setUserOrder(data._id)
                    setCheckOrderIdRelativeToGrocery(groceryId)
                    setCartPrice(0)
                    setCartQuantity(0)
                    addToCart(name,price,picture,quantity)
                }
            }

        } catch (error) {
            showMessage({
                message: "Something went wrong during adding to cart.",
                type: "danger",
            });
        }
    };

    // Geet location of the user upon ordering if he dindn't do that at first
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
            showMessage({
                message: "Now feel free to pick any item.",
                type: "success",
            });
          }
        }catch(error){
            showMessage({
                message: "Sorry item can't be added to your cart.",
                type: "danger",
            });
        }
    }

    // Adding item to the recent order
    const addToCart = async (name,price,picture,quantity) => {
        try {
            const token = await AsyncStorage.getItem('token');
            const order = await AsyncStorage.getItem('order');
            const response = await fetch(`${constants.fetch_url}add_to_order`, {
                method: 'POST',
                headers: {
                    'x-access-token': token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    order: order,
                    name: name,
                    price: price,
                    picture: picture,
                    quantity: quantity
                })
            });
            const data = await response.json();
            if(data.status === "200"){
                setPickedItem(true) // To show the View Cart button
                var total = parseFloat(cartPrice) + parseFloat(price) // Calculate the total price of the order
                var qauntity = parseFloat(cartQuantity) + 1 // Calculate the quantity of items added to order
                setCartPrice(total)
                setCartQuantity(qauntity)
                showMessage({
                    message: data.message,
                    type: "success",
                });
            }
      
        } catch (error) {
            showMessage({
                message: "Something went wrong during adding to cart.",
                type: "danger",
            });
        }
    };

    useEffect(() => {
        getItems();
    }, [groceryItems,groceryOrder])

    return(
        <View style={styles.container}>
            <FlatList 
                data={items} 
                keyExtractor={(e, item) => item.toString()} 
                renderItem={renderItem}
                ItemSeparatorComponent={separator}
            />
            <ItemPopUp item={selectedItem}/>
        </View>
    )
}

export default ViewItems;

const styles = StyleSheet.create ({
    container: {
        flex: 1,
        paddingHorizontal: 10,
        justifyContent: 'center'
    },
    item: {
        flex: 1,
        flexDirection: 'row',
        padding: 5
    },
    item_img: {
        width: 80,
        height: 80
    },
    item_body: {
        flex: 1,
        paddingHorizontal: 10,
        justifyContent: 'center'
    },
    item_name: {
        fontWeight: 'bold',
        fontSize: 20
    },
    item_price: {
        fontSize: 16,
    },
    item_container: {
        flex:1,
    },
    item_main_screen: {
        flex:1,
        backgroundColor:"#000000aa"
    },
    item_popup: {
        backgroundColor:"#fff", 
        margin:20, 
        padding:10, 
        borderRadius:10, 
        flex:1
    },
    item_picture: {
        height: 250,
    },
    item_info: {
        fontSize: 25,
        fontWeight: 'bold',
        marginTop: 40
    },
    item_price: {
        fontSize: 20,
        marginTop: 30
    },
    cart_button: {
        marginTop: 20,
        marginBottom: 20
    },
})