const Student = require('../models/Student');
const { generateStudentListCSV } = require('../services/csvService');
const faceRecognitionService = require('../services/faceRecognitionService');
const fs = require('fs');
const path = require('path');

// @desc    Get all students
// @route   GET /api/students
// @access  Private
exports.getAllStudents = async (req, res) => {
    try {
        const students = await Student.find().sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            count: students.length,
            students
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching students', 
            error: error.message 
        });
    }
};

// @desc    Get single student
// @route   GET /api/students/:id
// @access  Private
exports.getStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        
        if (!student) {
            return res.status(404).json({ 
                success: false, 
                message: 'Student not found' 
            });
        }
        
        res.status(200).json({
            success: true,
            student
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching student', 
            error: error.message 
        });
    }
};

// @desc    Add new student
// @route   POST /api/students
// @access  Private
exports.addStudent = async (req, res) => {
    try {
        const { studentId, name, email, class: studentClass, section, faceImage } = req.body;

        // Check if student ID exists
        const existingStudent = await Student.findOne({ studentId });
        if (existingStudent) {
            return res.status(400).json({ 
                success: false, 
                message: 'Student ID already exists' 
            });
        }

        let faceEmbedding = [];
        let profilePhotoPath = '';

        // Handle profile photo from file upload
        if (req.file) {
            profilePhotoPath = `/uploads/profiles/${req.file.filename}`;
        }

        // If face image is provided, register with face recognition
        if (faceImage) {
            const faceResult = await faceRecognitionService.addStudent(studentId, name, faceImage);
            
            if (!faceResult.success) {
                return res.status(400).json({ 
                    success: false, 
                    message: faceResult.message || 'Failed to register face'
                });
            }
            
            faceEmbedding = faceResult.embedding || [];
            
            // Use face image as profile photo if no profile photo was uploaded
            if (!profilePhotoPath && faceImage) {
                try {
                    // Extract base64 data
                    const base64Data = faceImage.replace(/^data:image\/\w+;base64,/, '');
                    const buffer = Buffer.from(base64Data, 'base64');
                    
                    // Create unique filename
                    const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}.jpg`;
                    const filepath = path.join(__dirname, '../../uploads/profiles', filename);
                    
                    // Write file
                    fs.writeFileSync(filepath, buffer);
                    profilePhotoPath = `/uploads/profiles/${filename}`;
                } catch (saveError) {
                    console.error('Failed to save face image as profile photo:', saveError);
                }
            }
        }

        const student = await Student.create({
            studentId,
            name,
            email,
            class: studentClass || '',
            section: section || '',
            faceEmbedding,
            registeredBy: req.teacherId,
            profilePhoto: profilePhotoPath
        });

        res.status(201).json({
            success: true,
            message: 'Student added successfully',
            student
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error adding student', 
            error: error.message 
        });
    }
};

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private
exports.updateStudent = async (req, res) => {
    try {
        const student = await Student.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!student) {
            return res.status(404).json({ 
                success: false, 
                message: 'Student not found' 
            });
        }

        res.status(200).json({
            success: true,
            message: 'Student updated successfully',
            student
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error updating student', 
            error: error.message 
        });
    }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private
exports.deleteStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({ 
                success: false, 
                message: 'Student not found' 
            });
        }

        // Remove from face recognition database
        if (student.studentId) {
            try {
                await faceRecognitionService.removeStudent(student.studentId);
            } catch (faceError) {
                console.error('Failed to remove from face database:', faceError.message);
                // Continue with MongoDB deletion even if face removal fails
            }
        }

        await Student.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Student deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error deleting student', 
            error: error.message 
        });
    }
};

// @desc    Register face for existing student
// @route   POST /api/students/:id/register-face
// @access  Private
exports.registerFace = async (req, res) => {
    try {
        const { faceImage } = req.body;
        
        if (!faceImage) {
            return res.status(400).json({ 
                success: false, 
                message: 'Face image is required' 
            });
        }

        const student = await Student.findById(req.params.id);
        
        if (!student) {
            return res.status(404).json({ 
                success: false, 
                message: 'Student not found' 
            });
        }

        // Register with face recognition API
        const faceResult = await faceRecognitionService.addStudent(
            student.studentId, 
            student.name, 
            faceImage
        );
        
        if (!faceResult.success) {
            return res.status(400).json({ 
                success: false, 
                message: faceResult.message || 'Failed to register face'
            });
        }

        // Update student with face embedding
        if (faceResult.embedding) {
            student.faceEmbedding = faceResult.embedding;
        }

        // Also save face image as profile photo if student doesn't have one
        if (!student.profilePhoto && faceImage) {
            try {
                const base64Data = faceImage.replace(/^data:image\/\w+;base64,/, '');
                const buffer = Buffer.from(base64Data, 'base64');
                const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}.jpg`;
                const filepath = path.join(__dirname, '../../uploads/profiles', filename);
                fs.writeFileSync(filepath, buffer);
                student.profilePhoto = `/uploads/profiles/${filename}`;
            } catch (saveError) {
                console.error('Failed to save face image as profile photo:', saveError);
            }
        }

        await student.save();

        res.status(200).json({
            success: true,
            message: 'Face registered successfully',
            student
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error registering face', 
            error: error.message 
        });
    }
};

// @desc    Update profile photo
// @route   PUT /api/students/:id/profile-photo
// @access  Private
exports.updateProfilePhoto = async (req, res) => {
    try {
        const { faceImage } = req.body;
        
        if (!faceImage) {
            return res.status(400).json({ 
                success: false, 
                message: 'Image is required' 
            });
        }

        const student = await Student.findById(req.params.id);
        
        if (!student) {
            return res.status(404).json({ 
                success: false, 
                message: 'Student not found' 
            });
        }

        // Save image as profile photo
        try {
            const base64Data = faceImage.replace(/^data:image\/\w+;base64,/, '');
            const buffer = Buffer.from(base64Data, 'base64');
            const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}.jpg`;
            const filepath = path.join(__dirname, '../../uploads/profiles', filename);
            fs.writeFileSync(filepath, buffer);
            student.profilePhoto = `/uploads/profiles/${filename}`;
        } catch (saveError) {
            return res.status(500).json({ 
                success: false, 
                message: 'Failed to save profile photo' 
            });
        }

        await student.save();

        res.status(200).json({
            success: true,
            message: 'Profile photo updated successfully',
            student
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error updating profile photo', 
            error: error.message 
        });
    }
};

// @desc    Download students list as CSV
// @route   GET /api/students/download/csv
// @access  Private
exports.downloadStudentsCSV = async (req, res) => {
    try {
        const students = await Student.find().sort({ createdAt: -1 });
        const csvData = generateStudentListCSV(students);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=students_list.csv');
        res.status(200).send(csvData);
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error generating CSV', 
            error: error.message 
        });
    }
};