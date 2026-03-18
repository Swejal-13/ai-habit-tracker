const User = require('../models/User');
const path = require('path');
const fs = require('fs');

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('friends', 'name avatar productivityScore');
    res.json({ success: true, user });
  } catch (err) { next(err); }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const allowed = ['name', 'timezone', 'reminderTime', 'theme'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true });
    res.json({ success: true, user });
  } catch (err) { next(err); }
};

exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    // Delete old avatar
    const existing = await User.findById(req.user.id);
    if (existing.avatar) {
      const oldPath = path.join(__dirname, '../../', existing.avatar);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const avatarPath = `/uploads/avatars/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(req.user.id, { avatar: avatarPath }, { new: true });
    res.json({ success: true, user, avatarUrl: avatarPath });
  } catch (err) { next(err); }
};

exports.removeAvatar = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.avatar) {
      const oldPath = path.join(__dirname, '../../', user.avatar);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    user.avatar = null;
    await user.save();
    res.json({ success: true, user });
  } catch (err) { next(err); }
};
