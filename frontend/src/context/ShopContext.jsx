import { createContext, useState, useEffect } from 'react'
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
export const ShopContext = createContext()

const ShopContextProvider = (props) => {

    const currency = '$';
    const delivery_fee = 10;
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [search, setSearch] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [cartItems, setCartItems] = useState({});
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [token, setToken] = useState('');

    const addToCart = async (itemId, size) => {
        if  (!size) {
            toast.error('Seleccione una talla');
            return;
        }
      
        let cartData = structuredClone(cartItems);

        if (cartData[itemId]) {
           if (!cartData[itemId][size]) {
                cartData[itemId][size] = 1;
           }else {
            cartData[itemId][size] += 1;
           }
        } 
        else {
            cartData[itemId] = {};
            cartData[itemId][size] = 1;
        }

        setCartItems(cartData);

        if (token) {
            try {
                await axios.post(
                    `${backendUrl}/api/cart/add`, 
                    {itemId, size}, 
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );
            } catch (error) {
                console.error('Error al agregar al carrito:', error);
                if (error.response?.status !== 401) {
                    toast.error('Error al agregar al carrito');
                }
            }
        }
    }

    const getCartCount = () => {
        let totalCount = 0;
        for (const items in cartItems) {
            for (const item in cartItems[items]) {
               try {
                  if (cartItems[items][item] > 0) {
                    totalCount += cartItems[items][item];
                  } 
               } catch (error) {
              
              }
            }
        }
      return totalCount;
    }


    const updateQuantity = async (itemId, size, quantity) => {
        let cartData = structuredClone(cartItems);
        cartData[itemId][size] = quantity;
        setCartItems(cartData);
        
        if (token) {
            await axios.post(
                `${backendUrl}/api/cart/update`, {itemId, size, quantity}, {headers: {token}}
            );
        }
    }

    const getCartAmount = () => {
        let totalAmount = 0;
        for (const items in cartItems) {
            let itemInfo = products.find(product => product._id === items);
            for (const item in cartItems[items]) {
                try {
                    if (cartItems[items][item] > 0) {
                        totalAmount += itemInfo.price * cartItems[items][item];
                    }
                } catch (error) {
                    
                }
            }
        }
        return totalAmount;
    }

    const getProductsData = async () => {
        try{
            const response = await axios.get(backendUrl + '/api/product/list');
            if (response.data.success) {
                setProducts(response.data.products);
            } else {
                toast.error(response.data.message);
            }
        }catch(error){
            console.log(error);
            toast.error(error.response?.data?.message || 'Error al obtener los productos');
        }
    }

    const getUserCart = async (userToken) => {
        try {
            const response = await axios.post(
                `${backendUrl}/api/cart/get`, 
                {}, 
                {
                    headers: {
                        'Authorization': `Bearer ${userToken}`
                    }
                }
            );
            
            if (response.data.success) {
                setCartItems(response.data.cartData);
            }
        } catch (error) {
            if (error.response?.status === 401 || error.response?.status === 404) {
                setCartItems({});
                return;
            }
            console.error('Error al obtener el carrito:', error);
            toast.error('Error al obtener el carrito');
        }
    }

    useEffect(() => {
        getProductsData();
        
        const storedToken = localStorage.getItem('token');
        if (storedToken && !token) {
            setToken(storedToken);
            getUserCart(storedToken);
        }
    }, []);

    useEffect(() => {
        const syncCart = async () => {
            if (token) {
                try {
                    const response = await axios.post(
                        `${backendUrl}/api/cart/get`,
                        {},
                        {
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        }
                    );
                    if (response.data.success) {
                        setCartItems(response.data.cartData);
                    }
                } catch (error) {
                    if (error.response?.status === 401 || error.response?.status === 404) {
                        setCartItems({});
                        return;
                    }
                    console.error('Error al sincronizar el carrito:', error);
                    toast.error('Error al sincronizar el carrito');
                }
            }
        };

        if (token) {
            syncCart();
        }
    }, [token]);

    const value = {
        products , currency , delivery_fee, 
        search, setSearch, showSearch, setShowSearch,
        cartItems, addToCart, setCartItems,
        getCartCount, updateQuantity,
        getCartAmount, navigate, backendUrl,
        token, setToken,
    }

  return (
    <ShopContext.Provider value={value}>
      {props.children}
    </ShopContext.Provider>
  )
}

export default ShopContextProvider