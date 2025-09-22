// backend/middleware/roleCheck.js
const childOnly = (req, res, next) => {
  if (req.user.role !== 'child') {
    return res.status(403).json({
      success: false,
      message: 'Only children can perform this action'
    });
  }
  next();
};

const parentOnly = (req, res, next) => {
  if (req.user.role !== 'parent') {
    return res.status(403).json({
      success: false,
      message: 'Only parents can perform this action'
    });
  }
  next();
};

module.exports = { childOnly, parentOnly };
