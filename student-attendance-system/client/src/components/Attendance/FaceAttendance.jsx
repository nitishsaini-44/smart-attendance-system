import React, { useState, useRef, useEffect } from 'react';
import attendanceService from '../../services/attendanceService';
import { Camera, CameraOff, Users, User, CheckCircle, AlertCircle, Scan } from 'lucide-react';
import toast from 'react-hot-toast';

const FaceAttendance = ({ onAttendanceMarked }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [isCameraOn, setIsCameraOn] = useState(false);
    const [loading, setLoading] = useState(false);
    const [faceApiStatus, setFaceApiStatus] = useState(null);
    const [mode, setMode] = useState('single'); // 'single' or 'multiple'
    const [lastResult, setLastResult] = useState(null);

    useEffect(() => {
        checkFaceApiStatus();
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const checkFaceApiStatus = async () => {
        try {
            const status = await attendanceService.checkFaceApiStatus();
            setFaceApiStatus(status.success);
        } catch (error) {
            setFaceApiStatus(false);
        }
    };

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { 
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                }
            });
            
            setStream(mediaStream);
            setIsCameraOn(true);
            
            // Wait for next tick to ensure video element is rendered
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                    videoRef.current.play().catch(console.error);
                }
            }, 100);
        } catch (error) {
            toast.error('Failed to access camera. Please allow camera permissions.');
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setStream(null);
        setIsCameraOn(false);
    };

    const captureAndRecognize = async () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        
        // Check if video is ready
        if (video.readyState < 2) {
            toast.error('Camera not ready. Please wait a moment and try again.');
            return;
        }

        setLoading(true);
        setLastResult(null);

        try {
            const canvas = canvasRef.current;
            
            // Use actual video dimensions
            const width = video.videoWidth || 1280;
            const height = video.videoHeight || 720;
            
            canvas.width = width;
            canvas.height = height;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, width, height);
            
            const imageBase64 = canvas.toDataURL('image/jpeg', 0.8);

            let result;
            if (mode === 'single') {
                result = await attendanceService.takeFaceAttendance(imageBase64);
            } else {
                result = await attendanceService.takeMultipleFaceAttendance(imageBase64);
            }

            setLastResult(result);

            if (result.success) {
                if (mode === 'single') {
                    if (result.alreadyMarked) {
                        toast.success(`${result.student.name} already marked present!`);
                    } else {
                        toast.success(`Attendance marked for ${result.student.name}`);
                    }
                } else {
                    toast.success(result.message);
                }
                if (onAttendanceMarked) onAttendanceMarked();
            } else {
                toast.error(result.message || 'Face not recognized');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to recognize face');
            setLastResult({ success: false, message: error.response?.data?.message || 'Error' });
        } finally {
            setLoading(false);
        }
    };

    if (faceApiStatus === false) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="h-16 w-16 mx-auto text-orange-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Face Recognition API Not Available
                </h3>
                <p className="text-gray-500 mb-4">
                    The Python Face Recognition server is not running.
                </p>
                <div className="bg-gray-100 rounded-lg p-4 max-w-md mx-auto text-left">
                    <p className="text-sm text-gray-600 mb-2">To start the Face API:</p>
                    <code className="text-xs bg-gray-200 px-2 py-1 rounded block">
                        cd logic && python api_server.py
                    </code>
                </div>
                <button
                    onClick={checkFaceApiStatus}
                    className="btn-primary mt-4"
                >
                    Retry Connection
                </button>
            </div>
        );
    }

    return (
        <div>
            {/* Mode Selection */}
            <div className="flex gap-2 mb-4">
                <button
                    onClick={() => setMode('single')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg transition-colors ${
                        mode === 'single'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                    <User className="h-5 w-5" />
                    Single Face
                </button>
                <button
                    onClick={() => setMode('multiple')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg transition-colors ${
                        mode === 'multiple'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                    <Users className="h-5 w-5" />
                    Multiple Faces
                </button>
            </div>

            {/* Camera Preview */}
            <div className="relative bg-gray-900 rounded-xl overflow-hidden aspect-video mb-4">
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover ${!isCameraOn ? 'hidden' : ''}`}
                />
                
                {!isCameraOn && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                        <CameraOff className="h-16 w-16 mb-4 text-gray-400" />
                        <p className="text-gray-400">Camera is off</p>
                    </div>
                )}

                {loading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="text-center text-white">
                            <Scan className="h-12 w-12 mx-auto mb-2 animate-pulse" />
                            <p>Scanning faces...</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Hidden canvas for capture */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Controls */}
            <div className="flex gap-3">
                {!isCameraOn ? (
                    <button
                        onClick={startCamera}
                        className="flex-1 btn-primary flex items-center justify-center gap-2"
                    >
                        <Camera className="h-5 w-5" />
                        Start Camera
                    </button>
                ) : (
                    <>
                        <button
                            onClick={stopCamera}
                            className="btn-secondary flex items-center gap-2"
                        >
                            <CameraOff className="h-5 w-5" />
                            Stop
                        </button>
                        <button
                            onClick={captureAndRecognize}
                            disabled={loading}
                            className="flex-1 btn-success flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Scan className="h-5 w-5" />
                                    {mode === 'single' ? 'Mark Attendance' : 'Scan All Faces'}
                                </>
                            )}
                        </button>
                    </>
                )}
            </div>

            {/* Result Display */}
            {lastResult && (
                <div className={`mt-4 p-4 rounded-lg ${
                    lastResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}>
                    <div className="flex items-start gap-3">
                        {lastResult.success ? (
                            <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                        ) : (
                            <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
                        )}
                        <div>
                            <p className={`font-medium ${lastResult.success ? 'text-green-800' : 'text-red-800'}`}>
                                {lastResult.message}
                            </p>
                            
                            {lastResult.success && mode === 'single' && lastResult.student && (
                                <p className="text-sm text-green-600 mt-1">
                                    Student: {lastResult.student.name} (ID: {lastResult.student.studentId})
                                    <br />
                                    Confidence: {(lastResult.student.confidence * 100).toFixed(1)}%
                                </p>
                            )}

                            {lastResult.success && mode === 'multiple' && (
                                <div className="mt-2 text-sm">
                                    <p className="text-green-600">
                                        Total faces detected: {lastResult.totalFaces}
                                    </p>
                                    {lastResult.markedStudents && lastResult.markedStudents.length > 0 && (
                                        <div className="mt-1">
                                            <p className="text-green-700 font-medium">Marked Present:</p>
                                            <ul className="list-disc list-inside">
                                                {lastResult.markedStudents.map((s, i) => (
                                                    <li key={i}>{s.name} ({(s.confidence * 100).toFixed(1)}%)</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {lastResult.alreadyMarkedStudents && lastResult.alreadyMarkedStudents.length > 0 && (
                                        <p className="text-orange-600 mt-1">
                                            Already marked: {lastResult.alreadyMarkedStudents.map(s => s.name).join(', ')}
                                        </p>
                                    )}
                                    {lastResult.unrecognizedCount > 0 && (
                                        <p className="text-gray-600 mt-1">
                                            Unrecognized faces: {lastResult.unrecognizedCount}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FaceAttendance;
