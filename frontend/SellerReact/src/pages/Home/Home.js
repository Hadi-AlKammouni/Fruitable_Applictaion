import React, {useEffect, useState} from "react";
import './styles.css'
import constants from "../../constants";
import {useGrocery} from '../../context/grocery';
import { DataGrid } from '@mui/x-data-grid';
import Box from '@mui/material/Box';

const Home = () => {

  const token = localStorage.getItem('token')
  const grocery_id = localStorage.getItem('_id')
  const [data,setData] = useState([])
  const [rows,setRows] = useState([])

  const {
    setGroceryName, 
    setGroceryPhoneNumber, 
    setGroceryDescription, 
    setGroceryLatitude, 
    setGroceryLongitude, 
    setGroceryPicture, 
    setGroceryCategories,
    setGroceryItems, 
    setGroceryOrder,
    setGroceryReviews
  } = useGrocery()

  const columns = [
    { field: 'first_name', headerName: 'Name' },
    { field: 'rate', headerName: 'Rate' },
    { field: 'text', headerName: 'Review'},
  ];

  const veiwGrocery = async () => {
    try {
      const response = await fetch(`${constants.fetch_url}view_grocery?id=${grocery_id}`,{
        headers: {
          'x-access-token': token,
        }
      });
      const data = await response.json();
      if(data._id){
        setData(data)
        setGroceryName(data.name) 
        setGroceryPhoneNumber(data.phone_number) 
        setGroceryDescription(data.description) 
        setGroceryLatitude(data.latitude) 
        setGroceryLongitude(data.longitude) 
        setGroceryPicture(data.picture) 
        setGroceryCategories(data.categories)
        setGroceryItems(data.items) 
        setGroceryOrder(data.orders)
        setGroceryReviews(data.reviews)
      }
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    veiwGrocery()
  }, []);

  useEffect(()=>{
      setRows(data.reviews ?? [])
  }, [data])

  return (
      <Box sx={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5, 10, 15]}
          checkboxSelection
          disableSelectionOnClick
          getRowId={(row)=>row._id}
        />
      </Box>
  );
}
  
export default Home;  