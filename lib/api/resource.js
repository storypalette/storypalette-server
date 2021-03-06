// Resources Controller
var crud = require('./crud')('resources');
var db = require('./../db').getDb();


module.exports = {
    all: function (req, res) {
        console.log("Get all resources");

        var users = [];
        db.users.find(function (err, result) {
            // console.log(result);    
        
            for (var i = 0; i < result.length; i++) {
                users[i] = result[i];
            }

            db.resources.find(function (err, resources) {

                if (!err) {
                    for (var j = 0; j < resources.length; j++) {
                        for (var x = 0; x < users.length; x++) {
                            if (resources[j].creatorId == users[x]._id.toString()) {
                                resources[j].creator = users[x];
                            }
                        }
                    }
                    res.status(200).json(resources);
                }
                else {
                    console.log(err);
                }
            });
        });
    },
    one: function (req, res) {
        console.log("Get one resource");

        db.users.findOne({ creatorId: req.params.id }, function (err, user) {

            if (!err) {
                db.resources.findOne({ _id: db.ObjectId(req.params.id) }, function (err2, resource) {
                    if (!err2) {
                        resource.creator = user;
                        res.status(200).json(resource);
                    }
                    else {
                        console.log(err);
                        console.log(err2);
                    }
                });
            }
            else {
                console.log(err);

            }
        });
    },
    create: crud.create,
    update: crud.update,
    destroy: crud.destroy
};

// Return all organisations


// Return organisation with :id

exports.ones = function (req, res) {
    console.log("Get organisation " + req.params.id);
    db.organisations.findOne({ _id: db.ObjectId(req.params.id) }, function (err, user) {
        if (!err) {
            res.status(200).json(user);
        }
        else {
            console.log(err);
        }
    });
};