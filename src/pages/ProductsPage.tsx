import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShoppingBag, Search, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

export const ProductsPage = () => {
  const navigate = useNavigate();
  
  // State dữ liệu & Phân trang
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
      page: 1,
      limit: 8,
      total: 0,
      totalPages: 1
  });

  // State Bộ lọc & Tìm kiếm
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  // Debounce search: đợi user gõ xong mới tìm 
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const categories = ['All', 'Kitchen', 'Cleaning', 'Cooling', 'Health', 'SmartHome', 'Beauty', 'Lighting'];

  // Xử lý Debounce cho Search
  useEffect(() => {
      const timer = setTimeout(() => {
          setDebouncedSearch(searchTerm);
          setPagination(prev => ({ ...prev, page: 1 })); // Reset về trang 1 khi tìm kiếm
      }, 500);
      return () => clearTimeout(timer);
  }, [searchTerm]);

  // GỌI API LẤY SẢN PHẨM
  useEffect(() => {
    setLoading(true);
    // Tạo query string
    const query = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        category: filter,
        search: debouncedSearch
    }).toString();

    axios.get(`http://localhost:8081/products?${query}`)
         .then(res => {
             setProducts(res.data.data); // Cập nhật danh sách sản phẩm
             setPagination(res.data.pagination);
             setLoading(false);
         })
         .catch(err => {
             console.error(err);
             setLoading(false);
         });
  }, [filter, debouncedSearch, pagination.page]); 

  const handlePageChange = (newPage: number) => {
      if (newPage >= 1 && newPage <= pagination.totalPages) {
          setPagination(prev => ({ ...prev, page: newPage }));
          window.scrollTo(0, 0); // Cuộn lên đầu trang
      }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="min-h-screen bg-[#FFFBF7] py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER & FILTER SECTION */}
        <div className="flex flex-col gap-6 mb-8">
           
           {/* Tiêu đề & Thanh tìm kiếm */}
           <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[#4a3b32] flex items-center gap-2">
                    <ShoppingBag className="text-orange-600"/> Tất cả sản phẩm
                    </h1>
                    <p className="text-gray-500 mt-1 text-sm">Hiển thị {products.length} trên tổng số {pagination.total} sản phẩm</p>
                </div>

                {/* SEARCH BAR */}
                <div className="relative w-full md:w-96">
                    <input 
                        type="text" 
                        placeholder="Tìm tên sản phẩm..." 
                        className="w-full pl-10 pr-4 py-3 rounded-full border border-orange-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-3.5 top-3.5 text-gray-400" size={20}/>
                </div>
           </div>
           
           {/* CATEGORY TABS */}
           <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
              <div className="flex items-center gap-2 bg-white p-1.5 rounded-full border border-orange-100 shadow-sm">
                  <span className="pl-3 pr-2 text-orange-600"><Filter size={18}/></span>
                  {categories.map(cat => (
                    <button 
                      key={cat}
                      onClick={() => { setFilter(cat); setPagination(prev => ({ ...prev, page: 1 })); }}
                      className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition ${filter === cat ? 'bg-orange-600 text-white shadow-md' : 'text-gray-600 hover:bg-orange-50'}`}
                    >
                      {cat === 'All' ? 'Tất cả' : cat}
                    </button>
                  ))}
              </div>
           </div>
        </div>

        {/* LOADING STATE */}
        {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="bg-white p-4 rounded-2xl h-80 animate-pulse border border-gray-100">
                        <div className="bg-gray-200 h-48 rounded-xl mb-4"></div>
                        <div className="bg-gray-200 h-4 w-3/4 rounded mb-2"></div>
                        <div className="bg-gray-200 h-4 w-1/2 rounded"></div>
                    </div>
                ))}
            </div>
        ) : (
            <>
                {/* PRODUCT GRID */}
                {products.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-xl font-bold text-gray-600">Không tìm thấy sản phẩm nào</h3>
                        <p className="text-gray-400">Thử tìm từ khóa khác hoặc chọn danh mục khác nhé.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {products.map((product) => (
                        <div 
                        key={product.id} 
                        className="bg-white p-4 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 group cursor-pointer flex flex-col" 
                        onClick={() => navigate(`/product/${product.id}`)}
                        >
                        <div className="relative mb-4 overflow-hidden rounded-xl h-48 bg-gray-50 flex items-center justify-center p-4">
                            {product.discount && (
                            <span className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full z-10 shadow-sm">{product.discount}</span>
                            )}
                            <img src={product.image_url || product.img} alt={product.name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition duration-500" />
                        </div>
                        
                        <div className="flex-1 flex flex-col">
                            <p className="text-xs text-gray-400 font-bold uppercase mb-1 tracking-wider">{product.category}</p>
                            <h3 className="font-bold text-lg mb-1 line-clamp-2 text-gray-800 flex-1 group-hover:text-orange-600 transition">{product.name}</h3>
                            
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-yellow-400 text-sm">★ {product.rating || 5}</span>
                                <span className="text-gray-300">|</span>
                                <span className="text-gray-400 text-xs">{product.review_count || 0} đã bán</span>
                            </div>

                            <div className="flex items-end justify-between mt-3 pt-3 border-t border-gray-50">
                                <div>
                                    <div className="text-red-600 font-bold text-xl">{formatCurrency(product.price)}</div>
                                    {product.old_price && (
                                        <div className="text-gray-400 text-sm line-through">{formatCurrency(product.old_price)}</div>
                                    )}
                                </div>
                                <button className="bg-orange-50 text-orange-600 p-2 rounded-lg hover:bg-orange-600 hover:text-white transition shadow-sm">
                                    <ShoppingBag size={20}/>
                                </button>
                            </div>
                        </div>
                        </div>
                    ))}
                    </div>
                )}

                {/* PAGINATION CONTROLS */}
                {products.length > 0 && pagination.totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4">
                        <button 
                            onClick={() => handlePageChange(pagination.page - 1)}
                            disabled={pagination.page === 1}
                            className="p-3 rounded-full bg-white border border-gray-200 hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
                        >
                            <ChevronLeft size={20}/>
                        </button>
                        
                        <div className="flex items-center gap-2">
                            {[...Array(pagination.totalPages)].map((_, i) => {
                                const pageNum = i + 1;
                                // Chỉ hiện trang đầu, cuối, và trang xung quanh trang hiện tại 
                                if (pageNum === 1 || pageNum === pagination.totalPages || (pageNum >= pagination.page - 1 && pageNum <= pagination.page + 1)) {
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => handlePageChange(pageNum)}
                                            className={`w-10 h-10 rounded-full font-bold text-sm transition shadow-sm ${
                                                pagination.page === pageNum 
                                                ? 'bg-orange-600 text-white scale-110' 
                                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-orange-50'
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                } else if (pageNum === pagination.page - 2 || pageNum === pagination.page + 2) {
                                    return <span key={pageNum} className="text-gray-400">...</span>;
                                }
                                return null;
                            })}
                        </div>

                        <button 
                            onClick={() => handlePageChange(pagination.page + 1)}
                            disabled={pagination.page === pagination.totalPages}
                            className="p-3 rounded-full bg-white border border-gray-200 hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
                        >
                            <ChevronRight size={20}/>
                        </button>
                    </div>
                )}
            </>
        )}
      </div>
    </div>
  );
};