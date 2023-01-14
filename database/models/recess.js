const mongoose = require('mongoose')

const ShortURLscheme = new mongoose.Schema({
    date: String,
    lessons: Array,
})

const SHORTURL = mongoose.model('account', ShortURLscheme)
module.exports = SHORTURL


