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

    const addToCart = async (itemId, size, quantity = 1) => {
        if (!size) {
            toast.error('Seleccione una talla');
            return;
        }

        if (token) {
            try {
                const response = await axios.post(
                    `${backendUrl}/api/cart/add`,
                    { itemId, size, quantity },
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
                console.error('Error al agregar al carrito:', error);
                toast.error('Error al agregar al carrito');
            }
        } else {
            let cartData = structuredClone(cartItems);
            if (!cartData[itemId]) {
                cartData[itemId] = {};
            }
            cartData[itemId][size] = (cartData[itemId][size] || 0) + quantity;
            setCartItems(cartData);
        }
    };

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
        if (token) {
            try {
                const response = await axios.post(
                    `${backendUrl}/api/cart/update`,
                    { itemId, size, quantity },
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
                console.error('Error al actualizar el carrito:', error);
                toast.error('Error al actualizar el carrito');
            }
        } else {
            let cartData = structuredClone(cartItems);
            if (quantity === 0) {
                if (cartData[itemId]) {
                    delete cartData[itemId][size];
                    if (Object.keys(cartData[itemId]).length === 0) {
                        delete cartData[itemId];
                    }
                }
            } else {
                if (!cartData[itemId]) cartData[itemId] = {};
                cartData[itemId][size] = quantity;
            }
            setCartItems(cartData);
        }
    };

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
                setCartItems(response.data.cartData || {});
            }
        } catch (error) {
            if (error.response?.status === 401 || error.response?.status === 404) {
                return;
            }
            console.error('Error al obtener el carrito:', error);
        }
    }

    useEffect(() => {
        const initializeApp = async () => {
            try {
                await getProductsData();
                
                const storedToken = localStorage.getItem('token');
                if (storedToken) {
                    setToken(storedToken);
                    const cartResponse = await axios.post(
                        `${backendUrl}/api/cart/get`,
                        {},
                        {
                            headers: {
                                'Authorization': `Bearer ${storedToken}`
                            }
                        }
                    );
                    
                    if (cartResponse.data.success) {
                        setCartItems(cartResponse.data.cartData || {});
                    }
                }
            } catch (error) {
                console.error('Error en la inicialización:', error);
                if (error.response?.status === 401) {
                    localStorage.removeItem('token');
                    setToken('');
                }
            }
        };

        initializeApp();
    }, [backendUrl]);

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
                        setCartItems(response.data.cartData || {});
                    }
                } catch (error) {
                    console.error('Error al sincronizar el carrito:', error);
                }
            }
        };

        syncCart();
    }, [token, backendUrl]);

    const updateToken = (newToken) => {
        setToken(newToken);
        if (newToken) {
            localStorage.setItem('token', newToken);
        } else {
            localStorage.removeItem('token');
            setCartItems({});
        }
    };

    const value = {
        products , currency , delivery_fee, 
        search, setSearch, showSearch, setShowSearch,
        cartItems, addToCart, setCartItems,
        getCartCount, updateQuantity,
        getCartAmount, navigate, backendUrl,
        token, setToken: updateToken,
    }

  return (
    <ShopContext.Provider value={value}>
      {props.children}
    </ShopContext.Provider>
  )
}

export default ShopContextProvider