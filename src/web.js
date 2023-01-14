var express = require('express');
var app = express();
const recess = require('../database/models/recess');
// set the view engine to ejs
app.set('view engine', 'ejs');


app.use(express.static('/root/polyhack/src/views'))

// use res.render to load up an ejs view file

// index page
app.get('/', async function(req, res) {
    var awkuedh = await recess.findOne({})
    console.log(awkuedh.lessons)
    res.render('/root/polyhack/src/views/hu.ejs', {
        asd: awkuedh.lessons
    });

});


module.exports = app