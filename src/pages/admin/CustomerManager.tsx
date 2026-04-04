import { useState, useEffect, useMemo } from 'react';
import api from '../../utils/axiosConfig';
import { Mail, Phone, MapPin, Search, Users, UserPlus, ChevronDown, ChevronUp } from 'lucide-react';

// Gradient avatars dựa theo tên
const AVATAR_GRADIENTS = [
  'from-orange-400 to-pink-500',
  'from-blue-400 to-indigo-500',
  'from-green-400 to-emerald-500',
  'from-purple-400 to-violet-500',
  'from-rose-400 to-red-500',
  'from-amber-400 to-orange-500',
  'from-cyan-400 to-blue-500',
  'from-teal-400 to-cyan-500',
  'from-fuchsia-400 to-purple-500',
  'from-lime-400 to-green-500',
];

function getGradient(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}

function timeAgo(dateStr: string) {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return 'Vừa xong';
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)} ngày trước`;
  if (diff < 31536000) return `${Math.floor(diff / 2592000)} tháng trước`;
  return `${Math.floor(diff / 31536000)} năm trước`;
}

type SortKey = 'name' | 'created_at';
type SortDir = 'asc' | 'desc';

export const CustomerManager = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/api/users')
      .then(res => setCustomers(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Filter & Sort
  const filtered = useMemo(() => {
    const result = customers.filter(u => {
      const q = search.toLowerCase();
      return (
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.phone?.includes(q)
      );
    });

    result.sort((a, b) => {
      const valA = sortKey === 'created_at' ? new Date(a[sortKey]).getTime() : (a[sortKey] || '').toLowerCase();
      const valB = sortKey === 'created_at' ? new Date(b[sortKey]).getTime() : (b[sortKey] || '').toLowerCase();
      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [customers, search, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortKey }) => {
    if (sortKey !== field) return <ChevronDown size={14} className="text-gray-300" />;
    return sortDir === 'asc' ? <ChevronUp size={14} className="text-orange-500" /> : <ChevronDown size={14} className="text-orange-500" />;
  };

  // Stats
  const now = new Date();
  const thisMonth = customers.filter(u => {
    const d = new Date(u.created_at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });


  return (
    <div className="space-y-6 animate-fade-in">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Quản Lý Khách Hàng</h2>
          <p className="text-gray-500 mt-1">Theo dõi và quản lý thông tin khách hàng</p>
        </div>
      </div>

      {/* STATS MINI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition group">
          <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
            <Users size={22} />
          </div>
          <div>
            <p className="text-gray-400 text-xs font-medium">Tổng Khách Hàng</p>
            <p className="text-2xl font-extrabold text-gray-800">{customers.length}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition group">
          <div className="w-11 h-11 bg-green-100 rounded-xl flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
            <UserPlus size={22} />
          </div>
          <div>
            <p className="text-gray-400 text-xs font-medium">Mới Tháng Này</p>
            <p className="text-2xl font-extrabold text-gray-800">{thisMonth.length}</p>
          </div>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo tên, email, số điện thoại..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition"
          />
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
          <button onClick={() => toggleSort('name')} className="flex items-center gap-1 hover:text-gray-600 transition">
            Sắp xếp theo tên <SortIcon field="name" />
          </button>
          <button onClick={() => toggleSort('created_at')} className="flex items-center gap-1 hover:text-gray-600 transition">
            Theo ngày tham gia <SortIcon field="created_at" />
          </button>
          <span className="ml-auto">{filtered.length} kết quả</span>
        </div>
      </div>

      {/* CUSTOMER LIST */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Users size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">Không tìm thấy khách hàng</p>
          <p className="text-sm">Thử thay đổi từ khóa tìm kiếm</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(user => (
            <div
              key={user.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-orange-200 transition-all duration-300 overflow-hidden group"
            >
              {/* Card top accent bar */}
              <div className={`h-1.5 bg-gradient-to-r ${getGradient(user.name || 'U')}`} />

              <div className="p-5">
                {/* Avatar + Name + Role */}
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${getGradient(user.name || 'U')} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:scale-110 transition-transform duration-300`}>
                    {(user.name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-gray-800 truncate">{user.name}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${user.role === 'admin'
                          ? 'bg-purple-100 text-purple-600'
                          : 'bg-blue-50 text-blue-500'
                        }`}>
                        {user.role === 'admin' ? '👑 Admin' : 'Khách hàng'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Tham gia {timeAgo(user.created_at)}
                    </p>
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-2.5 text-sm">
                  <div className="flex items-center gap-3 text-gray-600 group/item hover:text-orange-600 transition-colors">
                    <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center group-hover/item:bg-orange-50 transition-colors">
                      <Mail size={15} />
                    </div>
                    <span className="truncate">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600 group/item hover:text-orange-600 transition-colors">
                    <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center group-hover/item:bg-orange-50 transition-colors">
                      <Phone size={15} />
                    </div>
                    <span>{user.phone || <span className="text-gray-300 italic">Chưa cập nhật</span>}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600 group/item hover:text-orange-600 transition-colors">
                    <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center group-hover/item:bg-orange-50 transition-colors">
                      <MapPin size={15} />
                    </div>
                    <span className="truncate">{user.address || <span className="text-gray-300 italic">Chưa cập nhật</span>}</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-[11px] text-gray-400">
                  <span>ID: #{user.id}</span>
                  <span>{new Date(user.created_at).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};