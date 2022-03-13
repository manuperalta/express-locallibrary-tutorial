const { nextTick } = require('async');
var BookInstance = require('../models/bookinstance');
var Book = require('../models/book')
const { body, validationResult } = require('express-validator');

// Display list of all BookInstances.
exports.bookinstance_list = function (req, res, next) {
    BookInstance.find()
        .populate('book')
        .exec((err, list_bookinstances) => {
            if (err) { return next(err); }
            //Successful, so render
            res.render('bookinstance_list', { title: 'Book Instance List', bookinstance_list: list_bookinstances })
        })
};

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = function (req, res, next) {
    BookInstance.findById(req.params.id)
        .populate('book')
        .exec(function (err, bookinstance) {
            if (err) { return next(err); }
            if (bookinstance == null) {
                var err = new Error('Couldn\'t find any book copies')
                err.status = 404;
                return next(err);
            }
            //Successful, so render
            res.render('bookinstance_detail',
                {
                    title: 'Copy:' + bookinstance.book.title,
                    bookinstance: bookinstance
                });
        })
};

// Display BookInstance create form on GET.
exports.bookinstance_create_get = function (req, res, next) {
    Book.find({}, 'title')
        .exec(function (err, books) {
            if (err) { return next(err) }
            //Successful, so render
            res.render('bookinstance_form', { title: 'Create Book Instance', book_list: books })
        })
};

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [
    //Validate and sanitize fields
    body('book', 'Book must be specified').trim().isLength({ min: 1 }).escape(),
    body('imprint', 'Imprint must be specified').trim().isLength({ min: 1 }).escape(),
    body('status').escape(),
    body('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601().toDate(),
    //Process request after validating and sanitizing
    (req, res, next) => {
        //Extract validation errors from the request
        const errors = validationResult(req);

        //Create a BookInstance object with escaped and trimmed data
        const bookinstance = new BookInstance({
            book: req.body.book,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back
        })
        if (!errors.isEmpty()) {
            //There are errors. Render the form again displaying the errors and sanitized
            //values.
            Book.find({}, 'title')
                .exec(function (err, books) {
                    if (err) { return next(err); }
                    //Successful, so render
                    res.render('bookinstance_form', {
                        title: 'Create Book Instance',
                        book_list: books,
                        selected_book: bookinstance.book._id,
                        errors: errors.array(),
                        bookinstance: bookinstance
                    });
                });
            return;
        }
        else {
            //Data from form is valid.
            //Save bookinstance object in database:
            bookinstance.save(function (err) {
                if (err) { return next(err) }
                //Successfully saved. Redirect to the page containing the new instance:
                res.redirect(bookinstance.url)
            })
        }
    }
];

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = function (req, res) {
    res.send('NOT IMPLEMENTED: BookInstance delete GET');
};

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = function (req, res) {
    res.send('NOT IMPLEMENTED: BookInstance delete POST');
};

// Display BookInstance update form on GET.
exports.bookinstance_update_get = function (req, res) {
    res.send('NOT IMPLEMENTED: BookInstance update GET');
};

// Handle bookinstance update on POST.
exports.bookinstance_update_post = function (req, res) {
    res.send('NOT IMPLEMENTED: BookInstance update POST');
};