import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
    LayoutDashboard, 
    Users, 
    ClipboardCheck, 
    User, 
    LogOut, 
    Menu, 
    X,
    GraduationCap
} from 'lucide-react';

const Navbar = () => {
    const { teacher, logout, isAuthenticated } = useAuth();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Don't show navbar on login/register pages or when not authenticated
    if (!isAuthenticated || location.pathname === '/login' || location.pathname === '/register') {
        return null;
    }

    const navLinks = [
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/students', label: 'Students', icon: Users },
        { to: '/attendance', label: 'Attendance', icon: ClipboardCheck },
        { to: '/profile', label: 'Profile', icon: User },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/dashboard" className="flex items-center space-x-2">
                            <GraduationCap className="h-8 w-8 text-blue-600" />
                            <span className="text-xl font-bold text-gray-800">
                                Attendance System
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-4">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            return (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                                        isActive(link.to)
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    <Icon className="h-5 w-5" />
                                    <span>{link.label}</span>
                                </Link>
                            );
                        })}
                        
                        <div className="flex items-center space-x-3 ml-4 pl-4 border-l">
                            <span className="text-sm text-gray-600">
                                {teacher?.name}
                            </span>
                            <button
                                onClick={logout}
                                className="flex items-center space-x-1 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <LogOut className="h-5 w-5" />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
                        >
                            {mobileMenuOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            return (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                                        isActive(link.to)
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    <Icon className="h-5 w-5" />
                                    <span>{link.label}</span>
                                </Link>
                            );
                        })}
                        <button
                            onClick={() => {
                                setMobileMenuOpen(false);
                                logout();
                            }}
                            className="w-full flex items-center space-x-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                            <LogOut className="h-5 w-5" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;