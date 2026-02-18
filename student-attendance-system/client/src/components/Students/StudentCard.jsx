import React, { useState, useRef, useCallback } from 'react';
import { User, Mail, BookOpen, Trash2, Camera, X, Check, Scan, ImagePlus } from 'lucide-react';
import studentService from '../../services/studentService';
import toast from 'react-hot-toast';

const StudentCard = ({ student, onDelete, onFaceRegistered }) => {
    const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    const [showFaceCapture, setShowFaceCapture] = useState(false);
    const [cameraStream, setCameraStream] = useState(null);
    const [capturing, setCapturing] = useState(false);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const hasFaceRegistered = student.faceEmbedding && student.faceEmbedding.length > 0;
    const needsProfilePhoto = hasFaceRegistered && !student.profilePhoto;

    const startCamera = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
            });
            setCameraStream(stream);
            setShowFaceCapture(true);
            
            // Wait for next tick to ensure video element is rendered
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.play().catch(console.error);
                }
            }, 100);
        } catch (error) {
            toast.error('Failed to access camera. Please allow camera permissions.');
        }
    }, []);

    const stopCamera = useCallback(() => {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            setCameraStream(null);
        }
        setShowFaceCapture(false);
    }, [cameraStream]);

    const captureFace = useCallback(async () => {
        if (!videoRef.current || !canvasRef.current) return;
        
        const video = videoRef.current;
        
        // Check if video is ready
        if (video.readyState < 2) {
            toast.error('Camera not ready. Please wait a moment and try again.');
            return;
        }
        
        setCapturing(true);
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Use actual video dimensions
        const width = video.videoWidth || 640;
        const height = video.videoHeight || 480;
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(video, 0, 0, width, height);

        const imageData = canvas.toDataURL('image/jpeg', 0.9);
        
        try {
            await studentService.registerFace(student._id, imageData);
            toast.success('Face registered successfully!');
            stopCamera();
            if (onFaceRegistered) onFaceRegistered();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to register face');
        } finally {
            setCapturing(false);
        }
    }, [student._id, stopCamera, onFaceRegistered]);

    const handleFaceImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }
        
        setCapturing(true);
        
        const reader = new FileReader();
        reader.onload = async (event) => {
            const imageData = event.target.result;
            try {
                await studentService.registerFace(student._id, imageData);
                toast.success('Face registered successfully!');
                if (onFaceRegistered) onFaceRegistered();
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to register face');
            } finally {
                setCapturing(false);
            }
        };
        reader.onerror = () => {
            toast.error('Failed to read image file');
            setCapturing(false);
        };
        reader.readAsDataURL(file);
    };

    const handleProfilePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }
        
        setCapturing(true);
        
        const reader = new FileReader();
        reader.onload = async (event) => {
            const imageData = event.target.result;
            try {
                await studentService.updateProfilePhoto(student._id, imageData);
                toast.success('Profile photo updated!');
                if (onFaceRegistered) onFaceRegistered();
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to update profile photo');
            } finally {
                setCapturing(false);
            }
        };
        reader.onerror = () => {
            toast.error('Failed to read image file');
            setCapturing(false);
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="bg-white border rounded-xl p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                            {student.profilePhoto ? (
                                <img 
                                    src={`${BASE_URL}${student.profilePhoto}`} 
                                    alt={student.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <User className="h-6 w-6 text-blue-600" />
                            )}
                        </div>
                        {hasFaceRegistered && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                <Scan className="h-2.5 w-2.5 text-white" />
                            </div>
                        )}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-800">{student.name}</h3>
                        <p className="text-sm text-gray-500">ID: {student.studentId}</p>
                    </div>
                </div>
                <div className="flex gap-1">
                    {!hasFaceRegistered && (
                        <>
                            <button
                                onClick={startCamera}
                                disabled={capturing}
                                className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Capture Face"
                            >
                                <Camera className="h-4 w-4" />
                            </button>
                            <label className={`p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors cursor-pointer ${capturing ? 'opacity-50 pointer-events-none' : ''}`} title="Upload Face Image">
                                <ImagePlus className="h-4 w-4" />
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFaceImageUpload}
                                    disabled={capturing}
                                    className="hidden"
                                />
                            </label>
                        </>
                    )}
                    {needsProfilePhoto && (
                        <label className={`p-2 text-gray-400 hover:text-purple-500 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer ${capturing ? 'opacity-50 pointer-events-none' : ''}`} title="Add Profile Photo">
                            <ImagePlus className="h-4 w-4" />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleProfilePhotoUpload}
                                disabled={capturing}
                                className="hidden"
                            />
                        </label>
                    )}
                    <button
                        onClick={() => onDelete(student._id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div className="mt-4 space-y-2">
                {student.email && (
                    <div className="flex items-center text-sm text-gray-600">
                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        {student.email}
                    </div>
                )}
                {(student.class || student.section) && (
                    <div className="flex items-center text-sm text-gray-600">
                        <BookOpen className="h-4 w-4 mr-2 text-gray-400" />
                        {student.class}{student.section && ` - Section ${student.section}`}
                    </div>
                )}
                {!hasFaceRegistered && (
                    <div className="flex items-center text-sm text-orange-600">
                        <Camera className="h-4 w-4 mr-2" />
                        Face not registered
                    </div>
                )}
            </div>

            {/* Face Capture Modal */}
            {showFaceCapture && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Register Face - {student.name}</h3>
                            <button onClick={stopCamera} className="text-gray-500 hover:text-gray-700">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        
                        <div className="rounded-lg overflow-hidden bg-black mb-4">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-64 object-cover"
                            />
                        </div>
                        
                        <canvas ref={canvasRef} className="hidden" />
                        
                        <div className="flex gap-3">
                            <button
                                onClick={stopCamera}
                                className="btn-secondary flex-1"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={captureFace}
                                disabled={capturing}
                                className="btn-primary flex-1 flex items-center justify-center gap-2"
                            >
                                {capturing ? (
                                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Check className="h-4 w-4" />
                                        Capture & Register
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentCard;