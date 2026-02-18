import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import studentService from '../../services/studentService';
import attendanceService from '../../services/attendanceService';
import { 
    Users, 
    ClipboardCheck, 
    UserPlus, 
    Download,
    Calendar,
    TrendingUp,
    Clock
} from 'lucide-react';
import Loader from '../common/Loader';

const Dashboard = () => {
    const { teacher } = useAuth();
    const [stats, setStats] = useState({
        totalStudents: 0,
        todayAttendance: 0,
        presentCount: 0,
        absentCount: 0
    });
    const [recentAttendance, setRecentAttendance] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [studentsRes, attendanceRes] = await Promise.all([
                studentService.getAllStudents(),
                attendanceService.getTodayAttendance()
            ]);

            const students = studentsRes.students || [];
            const attendance = attendanceRes.attendance || [];
            
            let presentCount = 0;
            let absentCount = 0;
            let records = [];

            if (attendance.length > 0) {
                records = attendance[0]?.records || [];
                records.forEach(record => {
                    if (record.status === 'present') presentCount++;
                    else absentCount++;
                });
            }

            setStats({
                totalStudents: students.length,
                todayAttendance: records.length,
                presentCount,
                absentCount
            });

            setRecentAttendance(records.slice(0, 5));
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Loader />;
    }

    const statCards = [
        {
            title: 'Total Students',
            value: stats.totalStudents,
            icon: Users,
            color: 'bg-blue-500',
            link: '/students'
        },
        {
            title: "Today's Attendance",
            value: stats.todayAttendance,
            icon: ClipboardCheck,
            color: 'bg-green-500',
            link: '/attendance'
        },
        {
            title: 'Present Today',
            value: stats.presentCount,
            icon: TrendingUp,
            color: 'bg-emerald-500',
            link: '/attendance'
        },
        {
            title: 'Absent Today',
            value: stats.absentCount,
            icon: Clock,
            color: 'bg-red-500',
            link: '/attendance'
        }
    ];

    const quickActions = [
        {
            title: 'Take Attendance',
            description: 'Mark attendance for students',
            icon: ClipboardCheck,
            link: '/attendance',
            color: 'text-green-600 bg-green-100'
        },
        {
            title: 'Add Student',
            description: 'Register a new student',
            icon: UserPlus,
            link: '/students/add',
            color: 'text-blue-600 bg-blue-100'
        },
        {
            title: 'View Students',
            description: 'See all registered students',
            icon: Users,
            link: '/students',
            color: 'text-purple-600 bg-purple-100'
        },
        {
            title: 'Download Report',
            description: "Download today's attendance",
            icon: Download,
            link: '/attendance',
            color: 'text-orange-600 bg-orange-100'
        }
    ];

    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
                <h1 className="text-2xl font-bold">
                    Welcome back, {teacher?.name || 'Teacher'}!
                </h1>
                <p className="mt-1 text-blue-100">
                    {new Date().toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })}
                </p>
                {teacher?.subject && (
                    <p className="mt-2 text-sm text-blue-200">
                        Subject: {teacher.subject}
                    </p>
                )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <Link
                            key={index}
                            to={stat.link}
                            className="card hover:shadow-lg transition-shadow cursor-pointer"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">{stat.title}</p>
                                    <p className="text-3xl font-bold text-gray-800 mt-1">
                                        {stat.value}
                                    </p>
                                </div>
                                <div className={`p-3 rounded-full ${stat.color}`}>
                                    <Icon className="h-6 w-6 text-white" />
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <div className="card">
                <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {quickActions.map((action, index) => {
                        const Icon = action.icon;
                        return (
                            <Link
                                key={index}
                                to={action.link}
                                className="p-4 border rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
                            >
                                <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center mb-3`}>
                                    <Icon className="h-5 w-5" />
                                </div>
                                <h3 className="font-medium text-gray-800">{action.title}</h3>
                                <p className="text-sm text-gray-500 mt-1">{action.description}</p>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Recent Attendance */}
            <div className="card">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Recent Attendance</h2>
                    <Link to="/attendance" className="text-blue-600 hover:text-blue-700 text-sm">
                        View All
                    </Link>
                </div>
                
                {recentAttendance.length > 0 ? (
                    <div className="space-y-3">
                        {recentAttendance.map((record, index) => (
                            <div 
                                key={index}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                        <span className="text-blue-600 font-medium">
                                            {record.studentName?.charAt(0) || 'S'}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">
                                            {record.studentName}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            ID: {record.studentRollNo}
                                        </p>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    record.status === 'present' 
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-red-100 text-red-700'
                                }`}>
                                    {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p>No attendance records for today</p>
                        <Link 
                            to="/attendance" 
                            className="text-blue-600 hover:text-blue-700 text-sm mt-2 inline-block"
                        >
                            Take attendance now
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;