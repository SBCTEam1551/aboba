const bot = require('./src/bot.js')
var path = require('path');
const fs = require('fs');
const https = require('https');
const web = require('./src/web')

const mongoose = require('mongoose')


async function start(options) {
    console.clear()
    mongoose.connect('mongodb://127.0.0.1:27017/poly_db', { 
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(() => {
        console.log(`Database connection established`);
    }).catch((e) => {
        console.log(`No database connection: ${e}`);
    })
    bot.launch().then(() => {
        console.log(`The bot was successfully launched`)
    }).catch((r) => {
        console.log(`The bot is not running: ${r}`)
    })
    
    const http = require('http').createServer(web.listen(1561, () => console.log('The general backend was successfully launched'))) 
    
     
}


start()
