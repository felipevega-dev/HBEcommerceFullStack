import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets';
import LoadingSpinner from '../components/LoadingSpinner';
import { useLocation } from 'react-router-dom';

const Profile = () => {
  const { token, navigate, backendUrl } = useContext(ShopContext);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    billingAddresses: []
  });
  const [currentAddress, setCurrentAddress] = useState({
    firstname: '',
    lastname: '',
    phone: '',
    street: '',
    city: '',
    region: '',
    postalCode: '',
    country: '',
    isDefault: false
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const fetchProfile = async () => {
      const storedToken = localStorage.getItem('token');
      
      if (!token && !storedToken) {
        navigate('/login', { state: { from: '/profile' } });
        return;
      }

      try {
        const response = await axios.get(`${backendUrl}/api/user/profile`, {
          headers: {
            'Authorization': `Bearer ${storedToken || token}`
          }
        });

        if (response.data.success) {
          const { user, recentOrders } = response.data;
          setUser(user);
          setRecentOrders(recentOrders);
          setFormData({
            name: user.name,
            billingAddresses: user.billingAddresses || []
          });
        }
      } catch (error) {
        if (error.response?.status === 401) {
          navigate('/login', { state: { from: '/profile' } });
        } else {
          toast.error('Error al cargar el perfil');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token, backendUrl, navigate]);

  const handleAddNewAddress = () => {
    console.log('Iniciando handleAddNewAddress');
    
    // Verificar si ya tiene el máximo de direcciones permitidas (2)
    if (user.billingAddresses && user.billingAddresses.length >= 2) {
        toast.warning('Solo puedes tener hasta 2 direcciones guardadas');
        return;
    }

    // Preparar nueva dirección
    const newAddress = {
        firstname: '',
        lastname: '',
        phone: '',
        street: '',
        city: '',
        region: '',
        postalCode: '',
        country: '',
        // Si es la primera dirección, será predeterminada
        isDefault: !user.billingAddresses || user.billingAddresses.length === 0
    };

    setIsAddingNew(true);
    setIsEditing(false);
    setCurrentAddress(newAddress);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        // Crear copia del array de direcciones actual o inicializarlo si no existe
        let updatedAddresses = [...(user.billingAddresses || [])];
        
        if (isAddingNew) {
            // Validar campos requeridos
            if (!currentAddress.firstname || !currentAddress.street || !currentAddress.city) {
                toast.error('Por favor complete los campos requeridos');
                return;
            }

            // Verificar límite de direcciones
            if (updatedAddresses.length >= 2) {
                toast.error('Ya tienes el máximo de direcciones permitidas');
                return;
            }

            // Añadir nueva dirección
            updatedAddresses.push(currentAddress);
        } else if (isEditing) {
            // Actualizar dirección existente
            const editIndex = updatedAddresses.findIndex(addr => 
                addr.street === currentAddress.street && addr.city === currentAddress.city
            );
            if (editIndex !== -1) {
                updatedAddresses[editIndex] = currentAddress;
            }
        }

        // Actualizar en el servidor
        const response = await axios.put(
            `${backendUrl}/api/user/profile`,
            {
                billingAddresses: updatedAddresses
            },
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        if (response.data.success) {
            setUser(response.data.user);
            setIsEditing(false);
            setIsAddingNew(false);
            toast.success(isAddingNew ? 'Dirección añadida correctamente' : 'Dirección actualizada correctamente');
            
            // Recargar los datos del usuario
            const profileResponse = await axios.get(`${backendUrl}/api/user/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (profileResponse.data.success) {
                setUser(profileResponse.data.user);
            }
        }
    } catch (error) {
        console.error('Error al actualizar:', error);
        toast.error('Error al actualizar el perfil');
    }
  };

  const handleEditAddress = (address) => {
    setIsEditing(true);
    setIsAddingNew(false);
    setCurrentAddress(address);
    setTimeout(() => {
      document.getElementById('address-form')?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'center'
      });
    }, 100);
  };

  const handleSetDefaultAddress = async (addressIndex) => {
    try {
      const updatedAddresses = user.billingAddresses.map((addr, idx) => ({
        ...addr,
        isDefault: idx === addressIndex
      }));

      const response = await axios.put(
        `${backendUrl}/api/user/profile`,
        { billingAddresses: updatedAddresses },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setUser(response.data.user);
        toast.success('Dirección predeterminada actualizada');
      }
    } catch (error) {
      toast.error('Error al actualizar la dirección predeterminada');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
        // Convertir la imagen a base64
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            try {
                // Subir la imagen a Cloudinary
                const uploadResponse = await axios.post(
                    `${backendUrl}/api/upload`,
                    { image: reader.result },
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );

                if (uploadResponse.data.success) {
                    // Actualizar el perfil del usuario con la nueva URL
                    const response = await axios.put(
                        `${backendUrl}/api/user/profile`,
                        { profileImage: uploadResponse.data.url },
                        {
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        }
                    );

                    if (response.data.success) {
                        setUser(response.data.user);
                        toast.success('Foto de perfil actualizada');
                    }
                }
            } catch (error) {
                toast.error('Error al actualizar la foto de perfil');
            }
        };
    } catch (error) {
        toast.error('Error al procesar la imagen');
    }
  };

  return (
    <motion.div 
      className="max-w-4xl mx-auto p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h1 className='text-3xl font-medium mb-8'>Mi Cuenta</h1>

      {loading ? <LoadingSpinner /> : (
        <div className="grid md:grid-cols-2 gap-8">
          {/* Información Personal */}
          <motion.div 
            className="bg-white p-6 rounded-lg shadow-sm"
            initial={{ y: 20 }}
            animate={{ y: 0 }}
          >
            {/* Imagen de perfil con animación */}
            <motion.div 
              className="mb-6 flex flex-col items-center"
              whileHover={{ scale: 1.02 }}
            >
              <div className="relative">
                <img
                  src={user?.profileImage || assets.profiledefault}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover"
                />
                <label className="absolute bottom-0 right-0 bg-black text-white p-2 rounded-full cursor-pointer hover:bg-gray-800 transition-colors">
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </label>
              </div>
            </motion.div>

            {/* Resto del contenido con animaciones */}
            <AnimatePresence mode='wait'>
              {!isEditing ? (
                <motion.div
                  key="view"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-medium">Información Personal</h3>
                    <div className="flex gap-2">
                      {!isEditing && !isAddingNew && (!user.billingAddresses || user.billingAddresses.length < 2) && (
                        <button
                          onClick={handleAddNewAddress}
                          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                        >
                          Añadir dirección
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p><span className="font-medium">Nombre:</span> {user.name}</p>
                    <p><span className="font-medium">Email:</span> {user.email}</p>
                    
                    <div className="border-t pt-4 mt-4">
                      <h4 className="font-medium mb-2">Direcciones de Facturación</h4>
                      {user.billingAddresses?.length > 0 ? (
                        <div className="space-y-6">
                          {user.billingAddresses.map((address, index) => (
                            <div key={index} className="p-4 border rounded-lg relative">
                              {address.isDefault && (
                                <span className="absolute top-2 right-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                  Predeterminada
                                </span>
                              )}
                              <div className="space-y-2">
                                <p><span className="text-gray-600">Nombre completo:</span> {address.firstname} {address.lastname}</p>
                                <p><span className="text-gray-600">Teléfono:</span> {address.phone}</p>
                                <p><span className="text-gray-600">Dirección:</span> {address.street}</p>
                                <p><span className="text-gray-600">Ciudad:</span> {address.city}</p>
                                <p><span className="text-gray-600">Región:</span> {address.region}</p>
                                <p><span className="text-gray-600">Código Postal:</span> {address.postalCode}</p>
                                <p><span className="text-gray-600">País:</span> {address.country}</p>
                              </div>
                              <div className="mt-3 flex gap-2">
                                <button
                                  onClick={() => handleEditAddress(address)}
                                  className="text-sm text-blue-600 hover:text-blue-800"
                                >
                                  Editar
                                </button>
                                {!address.isDefault && (
                                  <button
                                    onClick={() => handleSetDefaultAddress(index)}
                                    className="text-sm text-blue-600 hover:text-blue-800"
                                  >
                                    Establecer como predeterminada
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">No hay direcciones guardadas</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.form
                  key="edit"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-medium">Información Personal</h3>
                    <div className="flex gap-2">
                      {!isEditing && !isAddingNew && (!user.billingAddresses || user.billingAddresses.length < 2) && (
                        <button
                          onClick={handleAddNewAddress}
                          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                        >
                          Añadir dirección
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p><span className="font-medium">Nombre:</span> {user.name}</p>
                    <p><span className="font-medium">Email:</span> {user.email}</p>
                    
                    <div className="border-t pt-4 mt-4">
                      <h4 className="font-medium mb-2">Direcciones de Facturación</h4>
                      {user.billingAddresses?.length > 0 ? (
                        <div className="space-y-6">
                          {user.billingAddresses.map((address, index) => (
                            <div key={index} className="p-4 border rounded-lg relative">
                              {address.isDefault && (
                                <span className="absolute top-2 right-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                  Predeterminada
                                </span>
                              )}
                              <div className="space-y-2">
                                <p><span className="text-gray-600">Nombre completo:</span> {address.firstname} {address.lastname}</p>
                                <p><span className="text-gray-600">Teléfono:</span> {address.phone}</p>
                                <p><span className="text-gray-600">Dirección:</span> {address.street}</p>
                                <p><span className="text-gray-600">Ciudad:</span> {address.city}</p>
                                <p><span className="text-gray-600">Región:</span> {address.region}</p>
                                <p><span className="text-gray-600">Código Postal:</span> {address.postalCode}</p>
                                <p><span className="text-gray-600">País:</span> {address.country}</p>
                              </div>
                              <div className="mt-3 flex gap-2">
                                <button
                                  onClick={() => handleEditAddress(address)}
                                  className="text-sm text-blue-600 hover:text-blue-800"
                                >
                                  Editar
                                </button>
                                {!address.isDefault && (
                                  <button
                                    onClick={() => handleSetDefaultAddress(index)}
                                    className="text-sm text-blue-600 hover:text-blue-800"
                                  >
                                    Establecer como predeterminada
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">No hay direcciones guardadas</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">
                      {isAddingNew ? 'Nueva dirección de facturación' : 'Editar dirección de facturación'}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Nombre</label>
                        <input
                          type="text"
                          value={currentAddress.firstname}
                          onChange={(e) => setCurrentAddress({
                            ...currentAddress,
                            firstname: e.target.value
                          })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Apellido</label>
                        <input
                          type="text"
                          value={currentAddress.lastname}
                          onChange={(e) => setCurrentAddress({
                            ...currentAddress,
                            lastname: e.target.value
                          })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                        <input
                          type="tel"
                          value={currentAddress.phone}
                          onChange={(e) => setCurrentAddress({
                            ...currentAddress,
                            phone: e.target.value
                          })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Dirección</label>
                        <input
                          type="text"
                          value={currentAddress.street}
                          onChange={(e) => setCurrentAddress({
                            ...currentAddress,
                            street: e.target.value
                          })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Ciudad</label>
                        <input
                          type="text"
                          value={currentAddress.city}
                          onChange={(e) => setCurrentAddress({
                            ...currentAddress,
                            city: e.target.value
                          })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Región</label>
                        <input
                          type="text"
                          value={currentAddress.region}
                          onChange={(e) => setCurrentAddress({
                            ...currentAddress,
                            region: e.target.value
                          })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Código Postal</label>
                        <input
                          type="text"
                          value={currentAddress.postalCode}
                          onChange={(e) => setCurrentAddress({
                            ...currentAddress,
                            postalCode: e.target.value
                          })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">País</label>
                        <input
                          type="text"
                          value={currentAddress.country}
                          onChange={(e) => setCurrentAddress({
                            ...currentAddress,
                            country: e.target.value
                          })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800"
                    >
                      {isAddingNew ? 'Añadir dirección' : 'Guardar cambios'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setIsAddingNew(false);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Pedidos Recientes */}
          <motion.div 
            className="bg-white p-6 rounded-lg shadow-sm"
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-medium">Pedidos Recientes</h3>
              <button
                onClick={() => navigate('/orders')}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Ver todos los pedidos 
              </button>
            </div>
            
            {recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order._id} className="border-b pb-4">
                    <p className="font-medium">Orden #{order._id}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(order.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm">Total: ${order.amount}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          order.status === 'pending' ? 'bg-yellow-500' :
                          order.status === 'processing' ? 'bg-blue-500' :
                          order.status === 'shipped' ? 'bg-green-500' :
                          'bg-gray-500'
                        }`}></span>
                        <span className="text-sm">{order.status}</span>
                      </div>
                      <button
                        onClick={() => navigate(`/orders?highlight=${order._id}`)}
                        className="text-sm text-gray-600 hover:text-gray-800"
                      >
                        Ver detalles →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No hay pedidos recientes</p>
            )}
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default Profile;