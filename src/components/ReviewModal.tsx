import React, { useState } from 'react';
import { Star, X, Upload } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: any;
    userId: number;
    onSuccess: () => void; 
}

export const ReviewModal = ({ isOpen, onClose, product, userId, onSuccess }: ReviewModalProps) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('product_id', product.product_id);
        formData.append('user_id', userId.toString());
        formData.append('rating', rating.toString());
        formData.append('comment', comment);
        if (image) {
            formData.append('image', image);
        }

        try {
            await axios.post('${import.meta.env.VITE_API_URL}/api/reviews', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Cảm ơn bạn đã đánh giá!');
            
            onSuccess(); // <--- 2. GỌI HÀM NÀY KHI THÀNH CÔNG
            onClose();
        } catch (error) {
            toast.error('Lỗi khi gửi đánh giá');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={24}/></button>
                
                <h3 className="text-xl font-bold mb-4">Đánh giá sản phẩm</h3>
                <div className="flex items-center gap-3 mb-6 bg-gray-50 p-3 rounded-xl">
                    <img src={product.image_url} alt="" className="w-12 h-12 object-cover rounded-lg"/>
                    <p className="font-medium text-sm line-clamp-2">{product.name}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex justify-center gap-2 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button key={star} type="button" onClick={() => setRating(star)} className="transition transform hover:scale-110">
                                <Star size={32} fill={star <= rating ? "#ea8d35" : "none"} className={star <= rating ? "text-[#ea8d35]" : "text-gray-300"} />
                            </button>
                        ))}
                    </div>
                    <p className="text-center text-sm font-bold text-orange-600 mb-4">
                        {rating === 5 ? 'Tuyệt vời!' : rating === 4 ? 'Hài lòng' : rating === 3 ? 'Bình thường' : 'Tệ'}
                    </p>

                    <textarea 
                        className="w-full border p-3 rounded-xl focus:border-orange-500 outline-none h-24 resize-none bg-gray-50"
                        placeholder="Hãy chia sẻ cảm nhận của bạn về sản phẩm..."
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        required
                    ></textarea>

                    <div>
                        <input type="file" id="review-img" hidden accept="image/*" onChange={handleImageChange}/>
                        <label htmlFor="review-img" className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 p-3 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-orange-400 transition text-gray-500">
                            <Upload size={20}/> {image ? 'Đổi ảnh khác' : 'Thêm ảnh thực tế'}
                        </label>
                        {preview && (
                            <div className="mt-2 relative inline-block">
                                <img src={preview} alt="Preview" className="h-20 w-20 object-cover rounded-lg border"/>
                                <button type="button" onClick={() => {setImage(null); setPreview(null)}} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"><X size={12}/></button>
                            </div>
                        )}
                    </div>

                    <button disabled={isSubmitting} className="w-full bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700 transition disabled:bg-gray-400">
                        {isSubmitting ? 'Đang gửi...' : 'Gửi Đánh Giá'}
                    </button>
                </form>
            </div>
        </div>
    );
};