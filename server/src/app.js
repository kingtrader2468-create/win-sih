require('./models');
const cors = require('cors');
const express = require('express');
const healthRoutes = require('./routes/healthRoutes');
const researchRoutes = require('./routes/researchRoutes');
const evidenceRoutes = require('./routes/evidenceRoutes');
const mysteryRoutes = require('./routes/mysteryRoutes');
const quizRoutes = require('./routes/quizRoutes');
const progressRoutes = require('./routes/progressRoutes');
const catalogRoutes = require('./routes/catalogRoutes');
const outreachRoutes = require('./routes/outreachRoutes');
const adminRoutes = require('./routes/adminRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const searchRoutes = require('./routes/searchRoutes');
const profileRoutes = require('./routes/profileRoutes');
const authRoutes = require('./routes/authRoutes');
const homepageRoutes = require('./routes/homepageRoutes');
const mapRoutes = require('./routes/mapRoutes');
const mediaRoutes = require('./routes/mediaRoutes');
const contactRoutes = require('./routes/contactRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/homepage', homepageRoutes);
app.use('/api/map', mapRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/research', researchRoutes);
app.use('/api/evidence', evidenceRoutes);
app.use('/api/mysteries', mysteryRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/outreach', outreachRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', catalogRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
