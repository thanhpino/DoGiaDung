import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageGalleryProps {
    images: { id: number; image_url: string; sort_order: number; is_primary: number }[];
    mainImage?: string; // fallback image_url từ product
    productName: string;
}

export const ImageGallery = ({ images, mainImage, productName }: ImageGalleryProps) => {
    // Tạo danh sách ảnh: nếu có multi-images thì dùng, không thì dùng mainImage
    const allImages = images && images.length > 0
        ? images.map(img => img.image_url)
        : mainImage ? [mainImage] : ['https://placehold.co/600x600?text=No+Image'];

    const [selectedIndex, setSelectedIndex] = useState(0);

    const goToPrev = () => setSelectedIndex(prev => (prev === 0 ? allImages.length - 1 : prev - 1));
    const goToNext = () => setSelectedIndex(prev => (prev === allImages.length - 1 ? 0 : prev + 1));

    return (
        <div className="space-y-3">
            {/* Ảnh chính */}
            <div className="relative group rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                <img
                    src={allImages[selectedIndex]}
                    alt={`${productName} - ${selectedIndex + 1}`}
                    className="w-full h-[400px] object-contain transition-transform duration-300 group-hover:scale-105"
                />
                {allImages.length > 1 && (
                    <>
                        <button onClick={goToPrev}
                            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 dark:bg-gray-800/80 rounded-full shadow-md hover:bg-white transition opacity-0 group-hover:opacity-100 cursor-pointer">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button onClick={goToNext}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 dark:bg-gray-800/80 rounded-full shadow-md hover:bg-white transition opacity-0 group-hover:opacity-100 cursor-pointer">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-3 py-1 rounded-full">
                            {selectedIndex + 1} / {allImages.length}
                        </div>
                    </>
                )}
            </div>

            {/* Thumbnail strip */}
            {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {allImages.map((url, idx) => (
                        <button key={idx} onClick={() => setSelectedIndex(idx)}
                            className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition cursor-pointer ${idx === selectedIndex ? 'border-orange-500 shadow-md' : 'border-transparent hover:border-gray-300'
                                }`}>
                            <img src={url} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
