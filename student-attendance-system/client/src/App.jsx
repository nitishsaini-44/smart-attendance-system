import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import PrivateRoute from './components/common/PrivateRoute';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ChangePassword from './components/Auth/ChangePassword';
import Dashboard from './components/Dashboard/Dashboard';
import StudentList from './components/Students/StudentList';
import AddStudent from './components/Students/AddStudent';
import Attendance from './pages/Attendance';
import TeacherProfile from './components/Profile/TeacherProfile';
import EditProfile from './components/Profile/EditProfile';

const App = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          <Route path="/students" element={
            <PrivateRoute>
              <StudentList />
            </PrivateRoute>
          } />
          <Route path="/students/add" element={
            <PrivateRoute>
              <AddStudent />
            </PrivateRoute>
          } />
          <Route path="/attendance" element={
            <PrivateRoute>
              <Attendance />
            </PrivateRoute>
          } />
          <Route path="/profile" element={
            <PrivateRoute>
              <TeacherProfile />
            </PrivateRoute>
          } />
          <Route path="/profile/edit" element={
            <PrivateRoute>
              <EditProfile />
            </PrivateRoute>
          } />
          <Route path="/change-password" element={
            <PrivateRoute>
              <ChangePassword />
            </PrivateRoute>
          } />
          
          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* 404 - Redirect to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;