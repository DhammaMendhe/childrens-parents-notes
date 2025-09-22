const User = require('../models/userModel')
const Note  = require('../models/notesModel')



async function userRegistration(req, res) {
  try {
    const { username, email, password, role, firstName, lastName, dateOfBirth, parentId } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or username already exists'
      });
    }

    // Create new user
    const newUser = new User({
      username,
      email,
      password,
      role,
      firstName,
      lastName,
      dateOfBirth: role === 'child' ? dateOfBirth : undefined
    });

    await newUser.save();

    // If registering a child and parentId provided, link them
    if (role === 'child' && parentId) {
      const parent = await User.findById(parentId);
      if (parent && parent.role === 'parent') {
        parent.children.push(newUser._id);
        newUser.parents.push(parent._id);
        await parent.save();
        await newUser.save();
      }
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        firstName: newUser.firstName,
        lastName: newUser.lastName
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
}

async function userLogin(req, res) {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Compare password (you'll need to implement password comparison)
    const isMatch = password === user.password; // Replace with proper password comparison
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
}


// Create Note (Children only)
async function createNote(req, res) {
  try {
    const { title, content, category, priority, tags, dueDate, isPrivate } = req.body;
    const userId = req.user.id; // From authentication middleware

    // Check if user is a child
    if (req.user.role !== 'child') {
      return res.status(403).json({
        success: false,
        message: 'Only children can create notes'
      });
    }

    const newNote = new Note({
      title,
      content,
      author: userId,
      category,
      priority,
      tags,
      dueDate,
      isPrivate
    });

    await newNote.save();
    await newNote.populate('author', 'firstName lastName');

    res.status(201).json({
      success: true,
      message: 'Note created successfully',
      note: newNote
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create note',
      error: error.message
    });
  }
}

// Get Notes (Role-based filtering)
async function getNotes(req, res) {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    let query = {};

    if (userRole === 'child') {
      // Children see only their own notes
      query = { author: userId };
    } else if (userRole === 'parent') {
      // Parents see their children's notes
      const user = await User.findById(userId).populate('children');
      const childrenIds = user.children.map(child => child._id);
      query = { author: { $in: childrenIds } };
    }

    const notes = await Note.find(query)
      .populate('author', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      notes
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notes',
      error: error.message
    });
  }
}

// Update Note (Children only, own notes only)
async function updateNote(req, res) {
  try {
    const { noteId } = req.params;
    const userId = req.user.id;
    const updates = req.body;

    // Check if user is a child
    if (req.user.role !== 'child') {
      return res.status(403).json({
        success: false,
        message: 'Only children can update notes'
      });
    }

    // Find note and check ownership
    const note = await Note.findOne({ _id: noteId, author: userId });
    
    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found or you do not have permission to update it'
      });
    }

    // Update note
    const updatedNote = await Note.findByIdAndUpdate(
      noteId,
      { ...updates, lastModified: new Date() },
      { new: true, runValidators: true }
    ).populate('author', 'firstName lastName');

    res.status(200).json({
      success: true,
      message: 'Note updated successfully',
      note: updatedNote
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update note',
      error: error.message
    });
  }
}

// Delete Note (Children only, own notes only)
async function deleteNote(req, res) {
  try {
    const { noteId } = req.params;
    const userId = req.user.id;

    // Check if user is a child
    if (req.user.role !== 'child') {
      return res.status(403).json({
        success: false,
        message: 'Only children can delete notes'
      });
    }

    // Find and delete note
    const deletedNote = await Note.findOneAndDelete({ _id: noteId, author: userId });
    
    if (!deletedNote) {
      return res.status(404).json({
        success: false,
        message: 'Note not found or you do not have permission to delete it'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Note deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete note',
      error: error.message
    });
  }
}

// Get Single Note
async function getNoteById(req, res) {
  try {
    const { noteId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const note = await Note.findById(noteId).populate('author', 'firstName lastName');
    
    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    // Check permissions
    let hasPermission = false;
    
    if (userRole === 'child' && note.author._id.toString() === userId) {
      hasPermission = true;
    } else if (userRole === 'parent') {
      const user = await User.findById(userId);
      const isChildsNote = user.children.some(childId => 
        childId.toString() === note.author._id.toString()
      );
      hasPermission = isChildsNote;
    }

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this note'
      });
    }

    res.status(200).json({
      success: true,
      note
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch note',
      error: error.message
    });
  }
}

module.exports = {userRegistration,userLogin,createNote,updateNote,getNoteById,getNotes,deleteNote}