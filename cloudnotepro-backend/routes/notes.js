const router = require('express').Router();
const fetchuser = require('../middleware/fetchuser');
const Note = require('../models/Note');
const { sendError, sendSuccess } = require('../utils/apiResponse');
const { noteCreateValidation, noteUpdateValidation, handleValidationErrors } = require('../utils/validators');

// Route 1: Create note: POST "/api/notes/add". login required
router.post('/add', fetchuser, noteCreateValidation, async (req, res) => {
  if (handleValidationErrors(req, res)) {
    return;
  }

  try {
    const { title, description, tag } = req.body;
    const note = new Note({
      title,
      description,
      tag,
      user: req.user.id,
    });

    const savedNote = await note.save();
    return sendSuccess(res, 200, 'Note added successfully', { savedNote });
  } catch (error) {
    console.error(error.message);
    return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Internal Server Error');
  }
});

// Route 2: Fetch notes: GET "/api/notes/fetch". login required
router.get('/fetch', fetchuser, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id });
    return sendSuccess(res, 200, 'Notes fetched successfully', { notes });
  } catch (error) {
    console.error(error.message);
    return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Internal Server Error');
  }
});

// Route 3: Update note: PUT "/api/notes/update/:id". login required
router.put('/update/:id', fetchuser, noteUpdateValidation, async (req, res) => {
  if (handleValidationErrors(req, res)) {
    return;
  }

  try {
    const { title, description, tag } = req.body;

    const newNote = {};
    if (title) {
      newNote.title = title;
    }
    if (description) {
      newNote.description = description;
    }
    if (tag) {
      newNote.tag = tag;
    }

    let updatedNote = await Note.findById(req.params.id);
    if (!updatedNote) {
      return sendError(res, 404, 'NOTE_NOT_FOUND', 'Not Found');
    }

    if (updatedNote.user.toString() !== req.user.id) {
      return sendError(res, 403, 'FORBIDDEN', 'Not Allowed');
    }

    updatedNote = await Note.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true });
    return sendSuccess(res, 200, 'Note updated successfully', { updatedNote });
  } catch (error) {
    console.error(error.message);
    return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Internal Server Error');
  }
});

// Route 4: Delete note: DELETE "/api/notes/delete/:id". login required
router.delete('/delete/:id', fetchuser, async (req, res) => {
  try {
    let deleteNote = await Note.findById(req.params.id);

    if (!deleteNote) {
      return sendError(res, 404, 'NOTE_NOT_FOUND', 'Not Found');
    }

    if (deleteNote.user.toString() !== req.user.id) {
      return sendError(res, 403, 'FORBIDDEN', 'Not Allowed');
    }

    deleteNote = await Note.findByIdAndDelete(req.params.id);
    return sendSuccess(res, 200, 'Note deleted successfully', { note: deleteNote });
  } catch (error) {
    console.error(error.message);
    return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Internal Server Error');
  }
});

module.exports = router;
