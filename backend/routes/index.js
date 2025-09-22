const express = require("express");
const router = express.Router();
const {
  userRegistration,
  userLogin,
  createNote,
  updateNote,
  getNoteById,
  getNotes,
  deleteNote,
  linkChildToParent
} = require("../controller/index");

// Import essential middleware
const auth = require("../middleware/auth");
const { childOnly, parentOnly } = require("../middleware/rolecheck");
const { validateNote } = require("../middleware/validation");

// User Authentication Routes
router.post("/register", userRegistration);
router.post("/login", userLogin);

// Family Management Routes
router.post("/link-child-parent", auth, linkChildToParent);

// Notes Routes with middleware
router.post("/notes", auth, childOnly, validateNote, createNote);
router.get("/notes", auth, getNotes);
router.get("/notes/:noteId", auth, getNoteById);
router.put("/notes/:noteId", auth, childOnly, validateNote, updateNote);
router.delete("/notes/:noteId", auth, childOnly, deleteNote);

// User Profile Routes
router.get("/profile", auth, async (req, res) => {
  try {
    const User = require("../models/User");
    const user = await User.findById(req.user.id)
      .populate('children', 'firstName lastName username')
      .populate('parents', 'firstName lastName username')
      .select('-password');

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
});

// Get Children (for parents) - with parentOnly middleware
router.get("/children", auth, parentOnly, async (req, res) => {
  try {
    const User = require("../models/User");
    const parent = await User.findById(req.user.id)
      .populate('children', 'firstName lastName username email dateOfBirth');

    res.status(200).json({
      success: true,
      children: parent.children
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch children',
      error: error.message
    });
  }
});

// Get Parents (for children) - with childOnly middleware
router.get("/parents", auth, childOnly, async (req, res) => {
  try {
    const User = require("../models/User");
    const child = await User.findById(req.user.id)
      .populate('parents', 'firstName lastName username email');

    res.status(200).json({
      success: true,
      parents: child.parents
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch parents',
      error: error.message
    });
  }
});

// Notes by Category (for filtering)
router.get("/notes/category/:category", auth, async (req, res) => {
  try {
    const { category } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    let query = { category };

    if (userRole === 'child') {
      query.author = userId;
    } else if (userRole === 'parent') {
      const User = require("../models/User");
      const user = await User.findById(userId).populate('children');
      const childrenIds = user.children.map(child => child._id);
      query.author = { $in: childrenIds };
    }

    const Note = require("../models/Note");
    const notes = await Note.find(query)
      .populate('author', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      notes,
      category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notes by category',
      error: error.message
    });
  }
});

// Search Notes
router.get("/search/:searchTerm", auth, async (req, res) => {
  try {
    const { searchTerm } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    let authorQuery = {};

    if (userRole === 'child') {
      authorQuery = { author: userId };
    } else if (userRole === 'parent') {
      const User = require("../models/User");
      const user = await User.findById(userId).populate('children');
      const childrenIds = user.children.map(child => child._id);
      authorQuery = { author: { $in: childrenIds } };
    }

    const Note = require("../models/Note");
    const notes = await Note.find({
      ...authorQuery,
      $or: [
        { title: { $regex: searchTerm, $options: 'i' } },
        { content: { $regex: searchTerm, $options: 'i' } },
        { tags: { $in: [new RegExp(searchTerm, 'i')] } }
      ]
    })
    .populate('author', 'firstName lastName')
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      notes,
      searchTerm,
      count: notes.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: error.message
    });
  }
});

// Mark Note as Complete/Incomplete (children only) - with childOnly middleware
router.patch("/notes/:noteId/toggle-complete", auth, childOnly, async (req, res) => {
  try {
    const Note = require("../models/Note");
    const note = await Note.findOne({ 
      _id: req.params.noteId, 
      author: req.user.id 
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found or access denied'
      });
    }

    note.isCompleted = !note.isCompleted;
    note.completedAt = note.isCompleted ? new Date() : null;
    note.lastModified = new Date();
    
    await note.save();

    res.status(200).json({
      success: true,
      message: `Note marked as ${note.isCompleted ? 'complete' : 'incomplete'}`,
      note
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to toggle note completion',
      error: error.message
    });
  }
});

// Get Notes Statistics
router.get("/stats/notes", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    
    let matchQuery = {};

    if (userRole === 'child') {
      matchQuery = { author: userId };
    } else if (userRole === 'parent') {
      const User = require("../models/User");
      const user = await User.findById(userId).populate('children');
      const childrenIds = user.children.map(child => child._id);
      matchQuery = { author: { $in: childrenIds } };
    }

    const Note = require("../models/Note");
    const stats = await Note.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalNotes: { $sum: 1 },
          completedNotes: {
            $sum: { $cond: [{ $eq: ["$isCompleted", true] }, 1, 0] }
          },
          pendingNotes: {
            $sum: { $cond: [{ $eq: ["$isCompleted", false] }, 1, 0] }
          },
          categories: { $addToSet: "$category" },
          averagePriority: { $avg: { 
            $switch: {
              branches: [
                { case: { $eq: ["$priority", "low"] }, then: 1 },
                { case: { $eq: ["$priority", "medium"] }, then: 2 },
                { case: { $eq: ["$priority", "high"] }, then: 3 }
              ],
              default: 2
            }
          }}
        }
      }
    ]);

    res.status(200).json({
      success: true,
      stats: stats[0] || {
        totalNotes: 0,
        completedNotes: 0,
        pendingNotes: 0,
        categories: [],
        averagePriority: 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
});

module.exports = router;
