const { Scenes } = require('telegraf')
const fs = require('fs')

const config = require('../../configs/config.json')
const recess = require('../../database/models/recess');
const request = require('request');

const getCurrentDate = require('../other/getCurrentDate');
var https = require('https');
const { base } = require('../../database/models/recess');

const music = new Scenes.WizardScene('music', async (ctx) => {
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
        caption: `На какой перемене вы бы хотели услышать музыку?`,
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
        caption: `<b> Отправьте ссылку на видео, после чего дождитесь решения модераторов!\nФормат: <code>https://youtu.be/_u-7rWKnVVo</code></b>`,
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
        if(!ctx.message.text.includes("https://youtu.be/")){
            await ctx.replyWithPhoto(`https://img.freepik.com/free-vector/high-school-concept-illustration_114360-8279.jpg?w=2000`, {
                caption: `<b> Отправьте ссылку на видео, после чего дождитесь решения модераторов!\nФормат: <code>https://youtu.be/_u-7rWKnVVo</code></b>`,
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '🖇 Вернуться в меню', callback_data: `🖇 Вернуться в меню` }],
                
                    ], 
                    
                }
            })
        }

        else {
           
            await ctx.telegram.sendMessage(ctx.from.id, ctx.message.message_id)
            await ctx.telegram.sendPhoto(config.bot.archive_chat, `https://img.freepik.com/free-vector/high-school-concept-illustration_114360-8279.jpg?w=2000`, {
                caption: `${ctx.message.text}\n<b>Что делаем с этой музыкой?\nУченик хотел бы его услышыать на ${ctx.wizard.state.data.day} перемене!</b>`,
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '✅ Принять ✅', callback_data: `✅ Принять ✅ | ${ctx.message.text.replace("https://youtu.be/", "")} | ${ctx.wizard.state.data.day-1}`  }, { text: '❌ Отклонить ❌', callback_data: `❌ Отклонить ❌` }],
                
                    ], 
                    
                }
            }).catch(async (e) => {
                loggy.warn(`problem with telegram => ${e}`)
            })

            await ctx.replyWithPhoto(`https://img.freepik.com/free-vector/high-school-concept-illustration_114360-8279.jpg?w=2000`, {
                caption: `<b> Ваше заявка на музыку была успешно отправлена на рассмотрение, дождитесь решения!</b>`,
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

music.action('🖇 Вернуться в меню', async (ctx) => {
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

module.exports = music