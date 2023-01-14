const { Telegraf, Scenes, session } = require('telegraf')
const fs = require('fs')
const sender = require('telegraf-sender')
const config = require('../configs/config.json')
const loggy = require('loggy')
const process = require('process')
const recess = require('../database/models/recess');
const getCurrentDate = require('./other/getCurrentDate')

const scns = {
    voice: require('./scenes/voice.scene'),
    music: require('./scenes/music.scene'),
}
const bot = new Telegraf(config.bot.api_key, { handlerTimeout: 3500 })

const stage = new Scenes.Stage()

stage.register(
    scns.voice, 
    scns.music, 

)

bot.use(session())
bot.use(sender)
bot.use(stage.middleware())

bot.start(async (ctx) => {
   console.log(getCurrentDate())
    await ctx.replyWithPhoto(`https://img.freepik.com/free-vector/high-school-concept-illustration_114360-8279.jpg?w=2000`, {
        caption: `<b>👋 Добро пожаловать ${ctx.from.first_name}!\n\nС помощью данного бота вы можете взаимодействовать с системой оповещения школы</b>`,
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Песня', callback_data: `Песня` }, { text: 'Поздравление', callback_data: `Поздравление` }],
            ], 
            
        }
     }).catch(async (e) => {
         loggy.warn(`problem with telegram => ${e}`)
     })
  

})  

bot.on('voice', async (ctx) => {
    
})

bot.hears('⏏️ Меню ⏏️', async (ctx) => {

})
bot.on('callback_query', async (q) => {

    let data = q.update.callback_query.data
    
    
    if(data == 'Песня'){
        q.scene.enter('music')
    }

    else if(data == 'Поздравление'){
        await q.scene.enter('voice')
    
    }

    else if(data.split(" | ")[0] == '✅ Принять ✅'){
        await q.editMessageCaption(`<b>✅✅✅✅✅✅</b>`, {       
            parse_mode: 'HTML',
         }).catch(async (e) => {
             loggy.warn(`problem with telegram => ${e}`)
         })
         datas = data.split(" | ")
         if(!datas[2]){
            console.log(datas)
            console.log(datas)
            base_recess = await recess.findOne({date: getCurrentDate()})
            base_recess = base_recess.lessons 
            base_recess[datas[2]] = `${base_recess[datas[2]]} || ${datas[1]}`
            console.log(base_recess)
            await recess.findOneAndUpdate({ date: getCurrentDate() }, { $set: { lessons: base_recess} })
         }
         else {
            console.log(datas)
            base_recess = await recess.findOne({date: getCurrentDate()})
            base_recess = base_recess.lessons 
            base_recess[datas[2]] = `${base_recess[datas[2]]} || ${datas[1]}`
            console.log(base_recess)
            await recess.findOneAndUpdate({ date: getCurrentDate() }, { $set: { lessons: base_recess} })
         }
        
    }
    else if(data == '❌ Отклонить ❌'){
        await q.editMessageCaption(`<b>❌❌❌❌❌❌</b>`, {       
            parse_mode: 'HTML',
         }).catch(async (e) => {
             loggy.warn(`problem with telegram => ${e}`)
         })
    }

    else if (data == 'Назад'){

        await q.editMessageCaption(`<b>👋 Добро пожаловать ${q.from.first_name}!\n\nС помощью данного бота вы можете взаимодействовать с системой оповещения школы</b>`, {       

            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Песня', callback_data: `Песня` }, { text: 'Поздравление', callback_data: `Поздравление` }],
            
                ],   
            }
         }).catch(async (e) => {
             loggy.warn(`problem with telegram => ${e}`)
         })
    }


})

bot.catch(async (err) => {
    loggy.warn(`globally problems with bot => ${err}`)
})

process.on('unhandledRejection', e => { 
    console.log(e);
    /* exec('pm2 restart main') */
});

process.on('uncaughtException', e => { 
    console.log(e); 
    /* exec('pm2 restart main') */
});

process.on('rejectionHandled', event => { 
    console.log(event); 
    /* exec('pm2 restart main') */
});

module.exports = bot

/*



*/