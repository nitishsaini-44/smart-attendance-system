import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, BookOpen, FileText, Edit3, Camera } from 'lucide-react';
import { Link } from 'react-router-dom';
import Loader from '../common/Loader';

const TeacherProfile = () => {
    const { teacher, loading } = useAuth();

    if (loading) {
        return <Loader />;
    }

    const profilePhotoUrl = teacher?.profilePhoto 
        ? `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${teacher.profilePhoto}`
        : null;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    {/* Header Banner */}
                    <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600"></div>
                    
                    {/* Profile Section */}
                    <div className="relative px-6 pb-6">
                        {/* Profile Photo */}
                        <div className="absolute -top-16 left-6">
                            <div className="relative">
                                {profilePhotoUrl ? (
                                    <img
                                        src={profilePhotoUrl}
                                        alt="Profile"
                                        className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-lg"
                                    />
                                ) : (
                                    <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center shadow-lg">
                                        <User className="h-16 w-16 text-gray-400" />
                                    </div>
                                )}
                                <Link
                                    to="/profile/edit"
                                    className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors shadow-md"
                                >
                                    <Camera className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>

                        {/* Edit Button */}
                        <div className="flex justify-end pt-4">
                            <Link
                                to="/profile/edit"
                                className="btn-primary flex items-center gap-2"
                            >
                                <Edit3 className="h-4 w-4" />
                                Edit Profile
                            </Link>
                        </div>

                        {/* Profile Info */}
                        <div className="mt-12">
                            <h1 className="text-2xl font-bold text-gray-800">{teacher?.name || 'Teacher'}</h1>
                            
                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Email */}
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Mail className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Email</p>
                                        <p className="font-medium text-gray-800">{teacher?.email}</p>
                                    </div>
                                </div>

                                {/* Subject */}
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <BookOpen className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Subject</p>
                                        <p className="font-medium text-gray-800">
                                            {teacher?.subject || 'Not specified'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="mt-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <FileText className="h-5 w-5 text-purple-600" />
                                    <h3 className="font-semibold text-gray-700">About Me</h3>
                                </div>
                                <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">
                                    {teacher?.description || 'No description added yet. Click Edit Profile to add one.'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link
                        to="/profile/edit"
                        className="card hover:shadow-lg transition-shadow flex items-center gap-3"
                    >
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <Edit3 className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800">Edit Profile</h3>
                            <p className="text-sm text-gray-500">Update your information</p>
                        </div>
                    </Link>
                    <Link
                        to="/change-password"
                        className="card hover:shadow-lg transition-shadow flex items-center gap-3"
                    >
                        <div className="p-3 bg-orange-100 rounded-lg">
                            <FileText className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800">Change Password</h3>
                            <p className="text-sm text-gray-500">Update your password</p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default TeacherProfile;