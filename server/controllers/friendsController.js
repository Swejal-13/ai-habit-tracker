const User = require('../models/User');
const Habit = require('../models/Habit');

exports.getFriends = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('friends', 'name email avatar productivityScore longestStreak totalCompleted');
    res.json({ success: true, friends: user.friends });
  } catch (err) { next(err); }
};

exports.sendRequest = async (req, res, next) => {
  try {
    const { email } = req.body;
    const target = await User.findOne({ email });
    if (!target) return res.status(404).json({ success: false, message: 'User not found' });
    if (target.id === req.user.id) return res.status(400).json({ success: false, message: 'Cannot add yourself' });

    const alreadyFriend = target.friends.includes(req.user.id);
    if (alreadyFriend) return res.status(400).json({ success: false, message: 'Already friends' });

    const pending = target.friendRequests.find(r => r.from.toString() === req.user.id && r.status === 'pending');
    if (pending) return res.status(400).json({ success: false, message: 'Request already sent' });

    target.friendRequests.push({ from: req.user.id });
    await target.save();
    res.json({ success: true, message: 'Friend request sent' });
  } catch (err) { next(err); }
};

exports.respondRequest = async (req, res, next) => {
  try {
    const { fromId, action } = req.body; // action: 'accept' | 'decline'
    const user = await User.findById(req.user.id);
    const reqIdx = user.friendRequests.findIndex(r => r.from.toString() === fromId && r.status === 'pending');
    if (reqIdx === -1) return res.status(404).json({ success: false, message: 'Request not found' });

    user.friendRequests[reqIdx].status = action === 'accept' ? 'accepted' : 'declined';

    if (action === 'accept') {
      user.friends.push(fromId);
      await User.findByIdAndUpdate(fromId, { $addToSet: { friends: req.user.id } });
    }
    await user.save();
    res.json({ success: true, message: `Request ${action}ed` });
  } catch (err) { next(err); }
};

exports.getLeaderboard = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('friends', 'name avatar productivityScore longestStreak totalCompleted');
    const all = [
      { ...user.toJSON(), isYou: true },
      ...user.friends.map(f => ({ ...f.toJSON(), isYou: false })),
    ].sort((a, b) => b.productivityScore - a.productivityScore);
    res.json({ success: true, leaderboard: all });
  } catch (err) { next(err); }
};

exports.searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ success: true, users: [] });
    const users = await User.find({
      $or: [{ name: { $regex: q, $options: 'i' } }, { email: { $regex: q, $options: 'i' } }],
      _id: { $ne: req.user.id },
    }).select('name email avatar productivityScore').limit(10);
    res.json({ success: true, users });
  } catch (err) { next(err); }
};
