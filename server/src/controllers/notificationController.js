const Notification = require('../models/Notification');

// Seed notifications for a newly created or existing user if they have none
async function ensureDefaultNotifications(userId) {
  const count = await Notification.countDocuments({ user: userId });
  if (count === 0) {
    await Notification.insertMany([
      {
        user: userId,
        title: 'Bharati Telemetry Active',
        message: 'Larsemann Hills weather station AWS reports stable -18.4°C with 42 km/h katabatic winds.',
        type: 'telemetry',
        link: '/map',
        read: false,
        createdAt: new Date(Date.now() - 15 * 60 * 1000)
      },
      {
        user: userId,
        title: 'New Polar Mystery Unlocked',
        message: 'The Prydz Bay Thermal Pulse anomaly investigation is available for your scholar rank.',
        type: 'mystery',
        link: '/mystery/000000000000000000000026',
        read: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        user: userId,
        title: '44th ISEA Expedition Voyage',
        message: 'National polar scientific contingent commences transit across Southern Ocean.',
        type: 'expedition',
        link: '/expeditions',
        read: false,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
      },
      {
        user: userId,
        title: 'Welcome to MoES Scholar Portal',
        message: 'Your sovereign research credentials are authenticated for NCPOR cryospheric access.',
        type: 'badge',
        link: '/profile',
        read: true,
        createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000)
      }
    ]);
  }
}

async function listNotifications(req, res) {
  try {
    const userId = req.user._id;
    await ensureDefaultNotifications(userId);

    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    const unreadCount = await Notification.countDocuments({ user: userId, read: false });

    return res.json({
      success: true,
      unreadCount,
      notifications
    });
  } catch (error) {
    console.error('List Notifications Error:', error);
    return res.status(500).json({ error: { message: 'Failed to retrieve notifications.' } });
  }
}

async function markAsRead(req, res) {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, user: userId },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: { message: 'Notification not found.' } });
    }

    const unreadCount = await Notification.countDocuments({ user: userId, read: false });

    return res.json({
      success: true,
      unreadCount,
      notification
    });
  } catch (error) {
    console.error('Mark Notification Read Error:', error);
    return res.status(500).json({ error: { message: 'Failed to update notification.' } });
  }
}

async function markAllAsRead(req, res) {
  try {
    const userId = req.user._id;
    await Notification.updateMany({ user: userId, read: false }, { read: true });

    return res.json({
      success: true,
      unreadCount: 0,
      message: 'All notifications marked as read.'
    });
  } catch (error) {
    console.error('Mark All Notifications Read Error:', error);
    return res.status(500).json({ error: { message: 'Failed to mark all notifications as read.' } });
  }
}

module.exports = {
  listNotifications,
  markAsRead,
  markAllAsRead
};
