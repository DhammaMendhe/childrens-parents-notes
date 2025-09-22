// backend/middleware/validation.js
const validateNote = (req, res, next) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({
      success: false,
      message: 'Title and content are required'
    });
  }

  next();
};

module.exports = { validateNote };
