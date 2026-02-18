const express = require('express');
const { 
    getAllStudents, 
    getStudent, 
    addStudent, 
    updateStudent, 
    deleteStudent,
    downloadStudentsCSV,
    registerFace,
    updateProfilePhoto
} = require('../controllers/studentController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(protect);

// Middleware to handle optional file upload
const optionalUpload = (req, res, next) => {
    upload.single('profilePhoto')(req, res, (err) => {
        if (err) {
            console.error('Upload error:', err.message);
            // Continue without file if there's an error (e.g., JSON request)
        }
        next();
    });
};

router.route('/')
    .get(getAllStudents)
    .post(optionalUpload, addStudent);

router.get('/download/csv', downloadStudentsCSV);

router.route('/:id')
    .get(getStudent)
    .put(updateStudent)
    .delete(deleteStudent);

router.post('/:id/register-face', registerFace);
router.put('/:id/profile-photo', updateProfilePhoto);

module.exports = router;