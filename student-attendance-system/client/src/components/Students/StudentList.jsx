import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import studentService from '../../services/studentService';
import StudentCard from './StudentCard';
import { UserPlus, Search, Download, Users } from 'lucide-react';
import Loader from '../common/Loader';
import toast from 'react-hot-toast';

const StudentList = () => {
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchStudents();
    }, []);

    useEffect(() => {
        const filtered = students.filter(student =>
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredStudents(filtered);
    }, [searchTerm, students]);

    const fetchStudents = async () => {
        try {
            const response = await studentService.getAllStudents();
            setStudents(response.students || []);
            setFilteredStudents(response.students || []);
        } catch (error) {
            toast.error('Failed to fetch students');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this student?')) {
            try {
                await studentService.deleteStudent(id);
                toast.success('Student deleted successfully');
                fetchStudents();
            } catch (error) {
                toast.error('Failed to delete student');
            }
        }
    };

    const handleDownloadCSV = async () => {
        try {
            const blob = await studentService.downloadStudentsCSV();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'students_list.csv';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.success('CSV downloaded successfully');
        } catch (error) {
            toast.error('Failed to download CSV');
        }
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Students</h1>
                    <p className="text-gray-500">{students.length} registered students</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleDownloadCSV}
                        className="btn-secondary flex items-center gap-2"
                    >
                        <Download className="h-4 w-4" />
                        Export CSV
                    </button>
                    <Link to="/students/add" className="btn-primary flex items-center gap-2">
                        <UserPlus className="h-4 w-4" />
                        Add Student
                    </Link>
                </div>
            </div>

            <div className="card">
                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name or student ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-field pl-10"
                    />
                </div>

                {filteredStudents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredStudents.map(student => (
                            <StudentCard 
                                key={student._id} 
                                student={student} 
                                onDelete={handleDelete}
                                onFaceRegistered={fetchStudents}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Users className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg">No students found</p>
                        <Link 
                            to="/students/add" 
                            className="text-blue-600 hover:text-blue-700 mt-2 inline-block"
                        >
                            Add your first student
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentList;