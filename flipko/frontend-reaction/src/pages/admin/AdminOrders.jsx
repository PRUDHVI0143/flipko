import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const response = await api.get('orders/');
      setOrders(response.data);
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      // Create a copy of the order to update just the status
      const orderToUpdate = orders.find(o => o.id === orderId);
      if (!orderToUpdate) return;
      
      await api.patch(`orders/${orderId}/`, { status: newStatus });
      fetchOrders(); // Refresh the list
    } catch (err) {
      console.error('Failed to update status', err);
      alert('Failed to update order status.');
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Orders Management</h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Customer Details</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Items</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Status / Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-blue-600">#{order.id}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{order.first_name} {order.last_name}</div>
                    <div className="text-xs text-gray-500">{order.email}</div>
                    <div className="text-xs text-gray-500">{order.phone}</div>
                    <div className="text-xs text-gray-400 mt-1 max-w-[200px] truncate" title={`${order.address}, ${order.city}, ${order.state} - ${order.pincode}`}>
                      {order.address}, {order.city}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">₹{order.total_amount}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {order.items?.length || 0} items
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <select 
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className={`text-sm rounded-lg px-3 py-1.5 border focus:ring-2 focus:outline-none font-medium
                        ${order.status === 'Delivered' ? 'bg-green-50 border-green-200 text-green-700 focus:ring-green-500' :
                          order.status === 'Shipped' ? 'bg-blue-50 border-blue-200 text-blue-700 focus:ring-blue-500' :
                          order.status === 'Cancelled' ? 'bg-red-50 border-red-200 text-red-700 focus:ring-red-500' :
                          'bg-yellow-50 border-yellow-200 text-yellow-700 focus:ring-yellow-500'}
                      `}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">No orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
