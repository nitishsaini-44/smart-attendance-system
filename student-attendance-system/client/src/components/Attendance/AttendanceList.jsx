import React, { useEffect, useState } from 'react';
import attendanceService from '../../services/attendanceService';
import { Calendar, Clock, Download, ClipboardList, Trash2 } from 'lucide-react';
import Loader from '../common/Loader';
import toast from 'react-hot-toast';

const AttendanceList = () => {
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTodayAttendance();
    }, []);

    const fetchTodayAttendance = async () => {
        try {
            const response = await attendanceService.getTodayAttendance();
            setAttendance(response.attendance || []);
        } catch (error) {
            toast.error('Failed to fetch attendance');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        try {
            const blob = await attendanceService.downloadTodayAttendanceCSV();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `attendance_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.success('CSV downloaded successfully');
        } catch (error) {
            toast.error('Failed to download CSV. Make sure attendance is marked first.');
        }
    };

    const handleReset = async () => {
        if (!window.confirm('Are you sure you want to reset today\'s attendance? This action cannot be undone.')) {
            return;
        }
        
        try {
            const response = await attendanceService.resetTodayAttendance();
            toast.success(response.message);
            setAttendance([]);
        } catch (error) {
            toast.error('Failed to reset attendance');
        }
    };

    if (loading) {
        return <Loader />;
    }

    const records = attendance.length > 0 ? attendance[0]?.records || [] : [];
    const presentCount = records.filter(r => r.status === 'present').length;
    const absentCount = records.filter(r => r.status === 'absent').length;

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full">
                        Present: {presentCount}
                    </span>
                    <span className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded-full">
                        Absent: {absentCount}
                    </span>
                </div>
                {records.length > 0 && (
                    <div className="flex gap-2">
                        <button
                            onClick={handleDownload}
                            className="btn-secondary flex items-center gap-2"
                        >
                            <Download className="h-4 w-4" />
                            Download CSV
                        </button>
                        <button
                            onClick={handleReset}
                            className="btn-danger flex items-center gap-2"
                        >
                            <Trash2 className="h-4 w-4" />
                            Reset Attendance
                        </button>
                    </div>
                )}
            </div>

            {records.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">S.No</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Student ID</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Name</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.map((record, index) => (
                                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-3 px-4 text-sm text-gray-600">{index + 1}</td>
                                    <td className="py-3 px-4 text-sm text-gray-600">{record.studentRollNo}</td>
                                    <td className="py-3 px-4 text-sm font-medium text-gray-800">{record.studentName}</td>
                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            record.status === 'present'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-red-100 text-red-700'
                                        }`}>
                                            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-sm text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {new Date(record.markedAt).toLocaleTimeString()}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-12">
                    <ClipboardList className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 text-lg">No attendance marked for today</p>
                    <p className="text-gray-400 text-sm mt-2">Go to "Take Attendance" tab to mark attendance</p>
                </div>
            )}
        </div>
    );
};

export default AttendanceList;