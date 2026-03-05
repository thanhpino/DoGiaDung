import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Stage, Environment } from '@react-three/drei';

interface Product3DViewerProps {
    modelUrl: string;
}

const Model = ({ url }: { url: string }) => {
    const { scene } = useGLTF(url);
    // Tự động căn giữa model và tính toán scale phù hợp
    return <primitive object={scene} />;
};

export const Product3DViewer: React.FC<Product3DViewerProps> = ({ modelUrl }) => {
    return (
        <div className="w-full h-[400px] md:h-[500px] mt-10 bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-3xl overflow-hidden relative shadow-inner cursor-grab active:cursor-grabbing border border-gray-100 dark:border-gray-700">
            {/* Lớp phủ hướng dẫn cho UX dời xuống dưới giữa, tránh đụng nút Yêu thích */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 bg-white/80 dark:bg-black/50 backdrop-blur-md px-4 py-2 rounded-full text-sm font-semibold text-gray-600 dark:text-gray-300 pointer-events-none shadow-sm flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
                Kéo chuột để xoay 360°
            </div>

            {/* Thêm style để Canvas tự giãn 100% kích thước khối cha */}
            <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 5], fov: 45 }} style={{ width: '100%', height: '100%' }}>
                <Suspense fallback={null}>
                    <Environment preset="city" />

                    <Stage environment="city" intensity={0.6} adjustCamera={1.2}>
                        <Model url={modelUrl} />
                    </Stage>

                    <OrbitControls
                        autoRotate
                        autoRotateSpeed={1.5}
                        enableZoom={true}
                        enablePan={false}
                        minPolarAngle={Math.PI / 4} // Không cho lật ngửa nhìn từ dưới đáy quá nhiều
                        maxPolarAngle={Math.PI / 1.5}
                    />
                </Suspense>
            </Canvas>
        </div>
    );
};

// Cleanup GLTF cache on unmount (Optional but recommended for large models)
useGLTF.preload = (url: string) => useGLTF(url);
