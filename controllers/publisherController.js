const { body, validationResult } = require("express-validator");


var Publisher = require('../models/publisher');
var Book = require('../models/book');
var async = require('async');



exports.publisher_list = function (req, res, next) {

    Publisher.find()
        .sort([['name', 'ascending']])
        .exec(function (err, list_publishers) {
            if (err) { return next(err); }

            res.render('publisher_list', { title: 'Publihser List', publihser_list: list_publishers });
        });

};

// Display detail page for a specific Publisher.
exports.publihser_detail = function (req, res, next) {

    async.parallel({
        publisher: function (callback) {
            Publisher.findById(req.params.id)
                .exec(callback);
        },

        publisher_books: function (callback) {
            Book.find({ 'publisher': req.params.id })
                .exec(callback);
        },

    }, function (err, results) {
        if (err) { return next(err); }
        if (results.publisher == null) { // No results.
            var err = new Error('Publisher not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render
        res.render('publihser_detail', { title: 'Publisher Detail', publisher: results.publisher, publisher_books: results.publisher_books });
    });

};


// Display Publisher create form on GET.
exports.publisher_create_get = function (req, res, next) {
    res.render('publisher_form', { title: 'Create Publisher' });
};

// Handle Publisher create on POST.
exports.publisher_create_post = [

    // Validate and santize the name field.
    body('name', 'Publisher name required').trim().isLength({ min: 1 }).escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a genre object with escaped and trimmed data.
        var publisher = new Publisher(
            { name: req.body.name }
        );

        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values/error messages.
            res.render('publisher_form', { title: 'Create Publsiher', publisher: publisher, errors: errors.array() });
            return;
        }
        else {
            // Data from form is valid.
            // Check if Publisher with same name already exists.
            Genre.findOne({ 'name': req.body.name })
                .exec(function (err, found_publisher) {
                    if (err) { return next(err); }

                    if (found_publisher) {
                    
                        res.redirect(found_publisher.url);
                    }
                    else {

                        publisher.save(function (err) {
                            if (err) { return next(err); }
                            
                            res.redirect(publisher.url);
                        });

                    }

                });
        }
    }
];
