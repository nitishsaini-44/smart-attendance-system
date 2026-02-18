import React, { useState } from 'react';
import { ClipboardCheck, ClipboardList, Download, Scan } from 'lucide-react';
import TakeAttendance from '../components/Attendance/TakeAttendance';
import AttendanceList from '../components/Attendance/AttendanceList';
import DownloadAttendance from '../components/Attendance/DownloadAttendance';
import FaceAttendance from '../components/Attendance/FaceAttendance';

const Attendance = () => {
    const [activeTab, setActiveTab] = useState('face');
    const [refreshKey, setRefreshKey] = useState(0);

    const handleAttendanceMarked = () => {
        // Refresh attendance list after marking
        setRefreshKey(prev => prev + 1);
    };

    const tabs = [
        { id: 'face', label: 'Face Recognition', icon: Scan },
        { id: 'take', label: 'Manual', icon: ClipboardCheck },
        { id: 'view', label: 'Today\'s Attendance', icon: ClipboardList },
        { id: 'download', label: 'Download', icon: Download },
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Attendance Management</h1>

                {/* Tabs */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="border-b border-gray-200">
                        <div className="flex">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                                            activeTab === tab.id
                                                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        <Icon className="h-5 w-5" />
                                        <span className="hidden sm:inline">{tab.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        {activeTab === 'face' && (
                            <FaceAttendance onAttendanceMarked={handleAttendanceMarked} />
                        )}
                        {activeTab === 'take' && (
                            <TakeAttendance onAttendanceMarked={handleAttendanceMarked} />
                        )}
                        {activeTab === 'view' && (
                            <AttendanceList key={refreshKey} />
                        )}
                        {activeTab === 'download' && (
                            <DownloadAttendance />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Attendance;
