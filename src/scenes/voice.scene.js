const { Scenes } = require('telegraf')
const fs = require('fs')

const config = require('../../configs/config.json')
const recess = require('../../database/models/recess');
const request = require('request');

const getCurrentDate = require('../other/getCurrentDate');
var https = require('https');
const { base } = require('../../database/models/recess');

const voice = new Scenes.WizardScene('voice', async (ctx) => {
    try {
        ctx.wizard.state.data = {}
        var base_recess = await recess.findOne({date: getCurrentDate()})
        if(!base_recess){
            await recess.insertMany({
                date: getCurrentDate(),
            })
            for(x = 1; x<7; x++) {
                await recess.findOneAndUpdate({ date: getCurrentDate() }, { $push: { lessons: `${x}` } })

            }
            

        }
       
        let keyboard = [
            [{ text: '1 перемена', callback_data: `1` }],
            [{ text: '2 перемена', callback_data: `2` }],
            [{ text: '3 перемена', callback_data: `3` }],
            [{ text: '4 перемена', callback_data: `4` }],
            [{ text: '5 перемена', callback_data: `5` }],
            [{ text: '6 перемена', callback_data: `6` }],
        ]
        await ctx.replyWithPhoto(`https://img.freepik.com/free-vector/high-school-concept-illustration_114360-8279.jpg?w=2000`, {
        caption: `На какой перемене вы бы хотели услышать поздравление?`,
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: keyboard
            
        }
     }).catch(async (e) => {
         loggy.warn(`problem with telegram => ${e}`)
     })
  
        return ctx.wizard.next()
    } catch (e) {
        await ctx.replyWithHTML(`Неизвестная команда. Попробуйте снова`)
        return ctx.scene.leave()
    }
}, async (ctx) => {
    try {
        ctx.wizard.state.data.day = ctx.update.callback_query.data
        console.log(ctx.wizard.state.data.day)
        await ctx.replyWithPhoto(`https://img.freepik.com/free-vector/high-school-concept-illustration_114360-8279.jpg?w=2000`, {
        caption: `<b> Отправьте голосовое сообщение, после чего дождитесь решения модераторов!</b>`,
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [
                [{ text: '🖇 Вернуться в меню', callback_data: `🖇 Вернуться в меню` }],
          
            ], 
            
        }
        }).catch(async (e) => {
            loggy.warn(`problem with telegram => ${e}`)
        })
  
        return ctx.wizard.next()
    } catch (e) {
        console.log(e);

        await ctx.replyWithHTML(`Неизвестная команда. Попробуйте снова`)
        return ctx.scene.leave()
    }
}, async (ctx) => {
    try {
        if(!ctx.message.voice){
            await ctx.replyWithPhoto(`https://img.freepik.com/free-vector/high-school-concept-illustration_114360-8279.jpg?w=2000`, {
                caption: `<b> Отправьте голосовое сообщение, после чего дождитесь решения модераторов!</b>`,
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '🖇 Вернуться в меню', callback_data: `🖇 Вернуться в меню` }],
                
                    ], 
                    
                }
            })
        }

        else {
            request(`https://api.telegram.org/bot${config.bot.api_key}/getFile?file_id=` + ctx.message.voice.file_id, { json: true }, (err, res, body) => {
                if (err) { return console.log(err); }
                console.log(body.result.file_path);
                full = `https://api.telegram.org/file/bot${config.bot.api_key}/` + body.result.file_path;
                console.log (full);
                const file = fs.createWriteStream(`src/views/voice/${ctx.message.message_id}.ogg`);
                const request = https.get(full, function(response) {
                    response.pipe(file)
                })
            });
            
           


            var voice_fr = await ctx.telegram.forwardMessage(config.bot.archive_chat, ctx.message.from.id, ctx.message.message_id)
            console.log(`${voice_fr.message_id} | ${ctx.from.id}`)
            console.log(ctx.message.voice.file_id)
            await ctx.telegram.sendMessage(ctx.from.id, ctx.message.message_id)
            await ctx.telegram.sendPhoto(config.bot.archive_chat, `https://img.freepik.com/free-vector/high-school-concept-illustration_114360-8279.jpg?w=2000`, {
                caption: `<b>Что делаем с этим поздравлением\nУченик хотел бы его услышыать на ${ctx.wizard.state.data.day} перемене!</b>`,
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '✅ Принять ✅', callback_data: `✅ Принять ✅ | ${voice_fr.message_id-1} | ${ctx.wizard.state.data.day-1}` }, { text: '❌ Отклонить ❌', callback_data: `❌ Отклонить ❌` }],
                
                    ], 
                    
                }
            }).catch(async (e) => {
                loggy.warn(`problem with telegram => ${e}`)
            })

            await ctx.replyWithPhoto(`https://img.freepik.com/free-vector/high-school-concept-illustration_114360-8279.jpg?w=2000`, {
                caption: `<b> Ваше заявка на поздравление была успешно отправлена на рассмотрение, дождитесь решения!</b>`,
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '🖇 Вернуться в меню', callback_data: `🖇 Вернуться в меню` }],
                
                    ], 
                    
                }
            })
            return ctx.scene.leave()
        }
    } catch (e) {
        console.log(e);

        await ctx.replyWithHTML(`Неизвестная команда. Попробуйте снова`)
        return ctx.scene.leave()
    }
})

voice.action('🖇 Вернуться в меню', async (ctx) => {
    try{
        await ctx.deleteMessage(ctx.update.callback_query.message.message_id)

    }
    catch(e){

    }
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
    return await ctx.scene.leave()
    
})

module.exports = voice