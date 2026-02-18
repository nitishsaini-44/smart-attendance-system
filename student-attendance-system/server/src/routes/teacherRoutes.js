const express = require('express');
const { 
    getProfile, 
    updateProfile, 
    uploadProfilePhoto,
    changePassword 
} = require('../controllers/teacherController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/profile/photo', upload.single('profilePhoto'), uploadProfilePhoto);
router.put('/change-password', changePassword);

module.exports = router;