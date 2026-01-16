import { useState, useEffect } from 'react';
import axios from 'axios';
import { Mail, Phone, MapPin } from 'lucide-react';

export const CustomerManager = () => {
  const [customers, setCustomers] = useState<any[]>([]);

  useEffect(() => {
    axios.get('http://localhost:8081/api/users')
         .then(res => setCustomers(res.data))
         .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Danh Sách Khách Hàng</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {customers.map(user => (
              <div key={user.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
                  <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-xl">
                          {user.name.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                          <h4 className="font-bold text-gray-800">{user.name}</h4>
                          <p className="text-xs text-gray-400">ID: #{user.id} • Tham gia: {new Date(user.created_at).toLocaleDateString()}</p>
                      </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2"><Mail size={16}/> {user.email}</div>
                      <div className="flex items-center gap-2"><Phone size={16}/> {user.phone || 'Chưa cập nhật'}</div>
                      <div className="flex items-center gap-2"><MapPin size={16}/> {user.address || 'Chưa cập nhật'}</div>
                  </div>
              </div>
          ))}
      </div>
    </div>
  );
};