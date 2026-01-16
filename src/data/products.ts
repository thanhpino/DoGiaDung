// src/data/products.ts

export interface Product {
  id: number;
  name: string;
  price: number;
  oldPrice?: number;
  discount?: string;
  rating: number;
  reviewCount: number;
  img: string;
  description: string;
  category: string; 
}

export const PRODUCTS: Product[] = [
  // --- NHÓM BẾP NÚC ---
  { 
    id: 1, 
    name: "Nồi Cơm Điện Tử Thông Minh 5L", 
    price: 850000, oldPrice: 1200000, discount: "-30%", rating: 4.8, reviewCount: 2450, 
    category: "Kitchen",
    img: "/images/noicom.jpg", 
    description: "Nấu cơm ngon chuẩn vị, giữ ấm 24h. Công nghệ cao tần IH giúp cơm chín đều."
  },
  { 
    id: 2, 
    name: "Máy Xay Sinh Tố Công Suất Lớn", 
    price: 1250000, oldPrice: 1565000, discount: "-20%", rating: 4.5, reviewCount: 120, 
    category: "Kitchen",
    img: "/images/mayxaysinhto.jpg",
    description: "Xay nhuyễn đá trong 3 giây. Lưỡi dao titan siêu bền."
  },
  { 
    id: 3, 
    name: "Nồi Chiên Không Dầu 6L", 
    price: 1890000, oldPrice: 2365000, discount: "-20%", rating: 4.9, reviewCount: 890, 
    category: "Kitchen",
    img: "/images/noichienkhongdau.jpg",
    description: "Giảm 80% lượng mỡ thừa, bảo vệ sức khỏe gia đình."
  },
  { 
    id: 4, 
    name: "Ấm Đun Siêu Tốc 1.7L", 
    price: 450000, oldPrice: 600000, discount: "-25%", rating: 4.7, reviewCount: 500, 
    category: "Kitchen",
    img: "/images/amdunsieutoc.jpg",
    description: "Đun sôi cực nhanh, tự ngắt khi sôi, an toàn tuyệt đối."
  },
  { 
    id: 5, 
    name: "Lò Vi Sóng Có Nướng 23L", 
    price: 2100000, oldPrice: 2500000, discount: "-16%", rating: 4.6, reviewCount: 320, 
    category: "Kitchen",
    img: "/images/lovisong.jpg",
    description: "Rã đông, hâm nóng, nướng thịt chỉ trong tích tắc."
  },
  { 
    id: 6, 
    name: "Máy Ép Trái Cây Chậm", 
    price: 3200000, oldPrice: 4000000, discount: "-20%", rating: 4.9, reviewCount: 150, 
    category: "Kitchen",
    img: "/images/mayepcham.jpg",
    description: "Giữ nguyên 99% vitamin, nước ép đậm đặc, không tách nước."
  },
  { 
    id: 7, 
    name: "Bộ Nồi Inox 5 Món Cao Cấp", 
    price: 1500000, oldPrice: 2000000, discount: "-25%", rating: 4.8, reviewCount: 600, 
    category: "Kitchen",
    img: "/images/bonoiinox.jpg",
    description: "Chất liệu Inox 304 sáng bóng, không gỉ, dùng được bếp từ."
  },
  
  // --- NHÓM ĐIỆN GIA DỤNG ---
  { 
    id: 8, 
    name: "Robot Hút Bụi Lau Nhà Thông Minh", 
    price: 6500000, oldPrice: 8000000, discount: "-18%", rating: 4.9, reviewCount: 1200, 
    category: "Cleaning",
    img: "/images/robothutbui.jpg",
    description: "Tự động lập bản đồ, tránh vật cản, lực hút siêu mạnh 4000Pa."
  },
  { 
    id: 9, 
    name: "Máy Lọc Không Khí Ion Âm", 
    price: 2800000, oldPrice: 3500000, discount: "-20%", rating: 4.7, reviewCount: 800, 
    category: "Health",
    img: "/images/maylokkhongkhi.jpg",
    description: "Lọc sạch bụi mịn PM2.5, khử mùi hôi, diệt khuẩn 99%."
  },
  { 
    id: 10, 
    name: "Quạt Đứng Điều Khiển Từ Xa", 
    price: 950000, oldPrice: 1200000, discount: "-21%", rating: 4.6, reviewCount: 450, 
    category: "Cooling",
    img: "/images/quatdung.jpg",
    description: "Gió êm ái, 5 cấp độ gió, hẹn giờ tắt thông minh."
  },
  { 
    id: 11, 
    name: "Bàn Ủi Hơi Nước Cầm Tay", 
    price: 650000, oldPrice: 890000, discount: "-27%", rating: 4.5, reviewCount: 900, 
    category: "Cleaning",
    img: "/images/banui.jpg",
    description: "Ủi phẳng quần áo trong 1 nốt nhạc, nhỏ gọn tiện mang đi du lịch."
  },
  { 
    id: 12, 
    name: "Máy Hút Bụi Cầm Tay Không Dây", 
    price: 1800000, oldPrice: 2500000, discount: "-28%", rating: 4.7, reviewCount: 300, 
    category: "Cleaning",
    img: "/images/mayhutbuicamtay.jpg",
    description: "Pin trâu 45 phút, đầu hút đa năng, trọng lượng siêu nhẹ."
  },

  // --- NHÓM TIỆN ÍCH ---
  { 
    id: 13, 
    name: "Đèn Bàn Học Chống Cận", 
    price: 350000, oldPrice: 500000, discount: "-30%", rating: 4.8, reviewCount: 150, 
    category: "Lighting",
    img: "/images/denban.jpg",
    description: "Ánh sáng vàng dịu nhẹ, không nhấp nháy, bảo vệ mắt."
  },
  { 
    id: 14, 
    name: "Ổ Cắm Điện Thông Minh Wifi", 
    price: 250000, oldPrice: 350000, discount: "-28%", rating: 4.6, reviewCount: 200, 
    category: "SmartHome",
    img: "/images/ocamdien.jpg",
    description: "Điều khiển bật tắt từ xa qua điện thoại, hẹn giờ tự động."
  },
  { 
    id: 15, 
    name: "Cân Sức Khỏe Điện Tử", 
    price: 180000, oldPrice: 250000, discount: "-28%", rating: 4.5, reviewCount: 500, 
    category: "Health",
    img: "/images/cansuckhoe.jpg",
    description: "Đo chính xác, mặt kính cường lực, kết nối app theo dõi cân nặng."
  },
  { 
    id: 16, 
    name: "Máy Sấy Tóc Ion Âm", 
    price: 450000, oldPrice: 650000, discount: "-30%", rating: 4.7, reviewCount: 600, 
    category: "Beauty",
    img: "/images/maysaytoc.jpg",
    description: "Sấy khô nhanh, không làm xơ tóc, bảo vệ da đầu."
  },
  { 
    id: 17, 
    name: "Quạt Điều Hòa Hơi Nước", 
    price: 3500000, oldPrice: 4200000, discount: "-16%", rating: 4.4, reviewCount: 200, 
    category: "Cooling",
    img: "/images/quatdieuhoa.jpg",
    description: "Làm mát diện rộng, bình chứa nước lớn 40L."
  },
  { 
    id: 18, 
    name: "Bếp Từ Đơn Siêu Mỏng", 
    price: 900000, oldPrice: 1200000, discount: "-25%", rating: 4.8, reviewCount: 300, 
    category: "Kitchen",
    img: "/images/beptu.jpg",
    description: "Nấu ăn nhanh, mặt kính chịu lực, cảm ứng nhạy."
  },
  { 
    id: 19, 
    name: "Máy Đánh Trứng Cầm Tay", 
    price: 350000, oldPrice: 450000, discount: "-22%", rating: 4.6, reviewCount: 150, 
    category: "Kitchen",
    img: "/images/maydanhtrung.jpg",
    description: "5 tốc độ đánh, que inox không gỉ, làm bánh cực dễ."
  },
  { 
    id: 20, 
    name: "Máy Làm Sữa Hạt Đa Năng", 
    price: 1900000, oldPrice: 2500000, discount: "-24%", rating: 4.9, reviewCount: 400, 
    category: "Kitchen",
    img: "/images/maylamsuahat.jpg",
    description: "Xay nấu tự động, làm sữa hạt, nấu cháo, xay sinh tố."
  },
];