import React, { useState, useEffect } from 'react';
import studentService from '../../services/studentService';
import attendanceService from '../../services/attendanceService';
import { Check, X, Users, Save } from 'lucide-react';
import Loader from '../common/Loader';
import toast from 'react-hot-toast';

const TakeAttendance = ({ onAttendanceMarked }) => {
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchStudentsAndTodayAttendance();
    }, []);

    const fetchStudentsAndTodayAttendance = async () => {
        try {
            // Fetch students and today's attendance in parallel
            const [studentsResponse, todayAttendanceResponse] = await Promise.all([
                studentService.getAllStudents(),
                attendanceService.getTodayAttendance().catch(() => ({ attendance: [] }))
            ]);
            
            const studentList = studentsResponse.students || [];
            setStudents(studentList);
            
            // Create a map of today's attendance records by student ID
            // Response structure: attendance[0].records where each record has studentId (populated or id string)
            const attendanceData = todayAttendanceResponse.attendance || [];
            const todayRecords = attendanceData.length > 0 ? attendanceData[0]?.records || [] : [];
            const attendanceMap = {};
            todayRecords.forEach(record => {
                // studentId can be populated object with _id, or just the id string
                const studentId = record.studentId?._id || record.studentId;
                if (studentId) {
                    attendanceMap[studentId] = record.status;
                }
            });
            
            // Initialize attendance: use today's attendance if exists, otherwise default to absent
            const initialAttendance = {};
            studentList.forEach(student => {
                initialAttendance[student._id] = attendanceMap[student._id] || 'absent';
            });
            setAttendance(initialAttendance);
        } catch (error) {
            toast.error('Failed to fetch students');
        } finally {
            setLoading(false);
        }
    };

    const toggleAttendance = (studentId) => {
        setAttendance(prev => ({
            ...prev,
            [studentId]: prev[studentId] === 'present' ? 'absent' : 'present'
        }));
    };

    const markAllPresent = () => {
        const allPresent = {};
        students.forEach(student => {
            allPresent[student._id] = 'present';
        });
        setAttendance(allPresent);
    };

    const markAllAbsent = () => {
        const allAbsent = {};
        students.forEach(student => {
            allAbsent[student._id] = 'absent';
        });
        setAttendance(allAbsent);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const records = Object.entries(attendance).map(([studentId, status]) => ({
                studentId,
                status
            }));

            await attendanceService.takeAttendance({ records });
            toast.success('Attendance marked successfully!');
            if (onAttendanceMarked) onAttendanceMarked();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to mark attendance');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <Loader />;
    }

    if (students.length === 0) {
        return (
            <div className="text-center py-12">
                <Users className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">No students registered yet</p>
                <p className="text-gray-400 text-sm mt-2">Add students first to take attendance</p>
            </div>
        );
    }

    const presentCount = Object.values(attendance).filter(s => s === 'present').length;
    const absentCount = Object.values(attendance).filter(s => s === 'absent').length;

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <p className="text-sm text-gray-500">
                        <span className="text-green-600 font-medium">{presentCount} Present</span>
                        {' | '}
                        <span className="text-red-600 font-medium">{absentCount} Absent</span>
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={markAllPresent}
                        className="text-sm px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                    >
                        Mark All Present
                    </button>
                    <button
                        type="button"
                        onClick={markAllAbsent}
                        className="text-sm px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    >
                        Mark All Absent
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                    {students.map((student) => (
                        <div
                            key={student._id}
                            onClick={() => toggleAttendance(student._id)}
                            className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all ${
                                attendance[student._id] === 'present'
                                    ? 'bg-green-50 border border-green-200'
                                    : 'bg-red-50 border border-red-200'
                            }`}
                        >
                            <div className="flex items-center space-x-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                    attendance[student._id] === 'present'
                                        ? 'bg-green-100'
                                        : 'bg-red-100'
                                }`}>
                                    <span className={`font-medium ${
                                        attendance[student._id] === 'present'
                                            ? 'text-green-600'
                                            : 'text-red-600'
                                    }`}>
                                        {student.name.charAt(0)}
                                    </span>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-800">{student.name}</p>
                                    <p className="text-sm text-gray-500">ID: {student.studentId}</p>
                                </div>
                            </div>
                            <div className={`p-2 rounded-full ${
                                attendance[student._id] === 'present'
                                    ? 'bg-green-500'
                                    : 'bg-red-500'
                            }`}>
                                {attendance[student._id] === 'present' ? (
                                    <Check className="h-5 w-5 text-white" />
                                ) : (
                                    <X className="h-5 w-5 text-white" />
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full btn-success mt-6 py-3 flex items-center justify-center gap-2"
                >
                    {submitting ? (
                        <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <>
                            <Save className="h-5 w-5" />
                            Save Attendance
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default TakeAttendance;