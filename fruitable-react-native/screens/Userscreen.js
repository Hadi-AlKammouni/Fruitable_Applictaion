import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from './Home/HomeScreen';
import OrdersScreen from "./Order/OrdersScreen";
import AccountScreen from "./Account/AccountScreen";
import GroceryScreen from "./Grocery/GroceryScreen";
// import OrderTracking from "./OrderTracking/OrderTracking";

const RootStack = createStackNavigator();

const Userscreen = () => {
  return(
    <RootStack.Navigator>
        <RootStack.Screen name="Home" component={HomeScreen} 
        options={({headerShown: false})}
        />
        <RootStack.Screen name="Order" component={OrdersScreen} 
        options={({headerShown: false})}
        />
        <RootStack.Screen name="Account" component={AccountScreen}
        options={({headerShown: false})}
        />
        <RootStack.Screen name="Grocery" component={GroceryScreen} 
        options={({headerShown: false})}
        />
        {/* <RootStack.Screen name="OrderTracking" component={OrderTracking} 
        /> */}
    </RootStack.Navigator>
  )
}

export default Userscreen;