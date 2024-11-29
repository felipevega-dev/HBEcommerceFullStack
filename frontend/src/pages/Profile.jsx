import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import Title from '../components/Title';

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
            'Authorization': `Bearer ${token || storedToken}`
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
    if (user.billingAddresses && user.billingAddresses.length >= 2) {
      toast.warning('Solo puedes tener hasta 2 direcciones guardadas');
      return;
    }
    setIsAddingNew(true);
    setCurrentAddress({
      firstname: '',
      lastname: '',
      phone: '',
      street: '',
      city: '',
      region: '',
      postalCode: '',
      country: '',
      isDefault: formData.billingAddresses.length === 0 // Primera dirección será predeterminada
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let updatedAddresses = [...(user.billingAddresses || [])];
      
      if (isAddingNew) {
        // Añadir nueva dirección
        updatedAddresses.push(currentAddress);
      } else if (isEditing) {
        // Actualizar dirección existente
        const editIndex = updatedAddresses.findIndex(addr => 
          addr.street === currentAddress.street && addr.city === currentAddress.city
        );
        if (editIndex !== -1) {
          updatedAddresses[editIndex] = currentAddress;
        } else {
          // Si no encontramos la dirección exacta, actualizar por índice
          const addressIndex = updatedAddresses.findIndex(addr => 
            addr.isDefault === currentAddress.isDefault
          );
          if (addressIndex !== -1) {
            updatedAddresses[addressIndex] = currentAddress;
          }
        }
      }

      const response = await axios.put(
        `${backendUrl}/api/user/profile`,
        {
          name: formData.name,
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
        setFormData({
          ...formData,
          billingAddresses: response.data.user.billingAddresses
        });
        toast.success('Perfil actualizado correctamente');
        
        // Recargar los datos del usuario
        const profileResponse = await axios.get(`${backendUrl}/api/user/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (profileResponse.data.success) {
          setUser(profileResponse.data.user);
          setRecentOrders(profileResponse.data.recentOrders);
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

  if (loading) {
    return <div className="p-4">Cargando...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="text-2xl mb-8">
        <Title text1="MI" text2="CUENTA" />
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Información Personal */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-medium">Información Personal</h3>
            <div className="flex gap-2">
              {!isEditing && !isAddingNew && user.billingAddresses?.length < 2 && (
                <button
                  onClick={handleAddNewAddress}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Añadir dirección
                </button>
              )}
            </div>
          </div>

          {!isEditing ? (
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
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isAddingNew && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                  />
                </div>
              )}

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
            </form>
          )}
        </div>

        {/* Pedidos Recientes */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-medium mb-4">Pedidos Recientes</h3>
          {recentOrders.length > 0 ? (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order._id} className="border-b pb-4">
                  <p className="font-medium">Orden #{order._id}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(order.date).toLocaleDateString()}
                  </p>
                  <p className="text-sm">Total: ${order.amount}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`w-2 h-2 rounded-full ${
                      order.status === 'pending' ? 'bg-yellow-500' :
                      order.status === 'processing' ? 'bg-blue-500' :
                      order.status === 'shipped' ? 'bg-green-500' :
                      'bg-gray-500'
                    }`}></span>
                    <span className="text-sm">{order.status}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No hay pedidos recientes</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;