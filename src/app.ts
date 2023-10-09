import { Telegraf, Telegram } from "telegraf"
import { message } from "telegraf/filters"
import 'dotenv/config'

// 判断 process.env.BOT_TOKEN 是否为空，为空则报错提示并退出程序
if (!process.env.BOT_TOKEN) {
    console.error("BOT_TOKEN is empty")
    process.exit(1)
}
async function main() {
    const bot = new Telegraf(process.env.BOT_TOKEN!)

    bot.use(async (ctx, next) => {
        console.time(`Processing update ${ctx.update.update_id}`);
        console.log(ctx)
        
        bot.telegram.sendChatAction(ctx.chat!.id, 'typing')
        bot.telegram.sendMessage(ctx.chat!.id, 'HHHH', {
            reply_to_message_id: ctx.message!.message_id,
        })

        await next() // runs next middleware
        // runs after next middleware finishes
        console.timeEnd(`Processing update ${ctx.update.update_id}`);
    })

    bot.start((ctx) => ctx.reply('Welcome'))
    bot.help((ctx) => ctx.reply('Send me a sticker'))
    bot.on(message('sticker'), (ctx) => ctx.reply('👍'))
    bot.hears('hi', (ctx) => ctx.reply('Hey there'))
    bot.command('hipster', Telegraf.reply('λ'))
    bot.launch()

    // Enable graceful stop
    process.once('SIGINT', () => bot.stop('SIGINT'))
    process.once('SIGTERM', () => bot.stop('SIGTERM'))
}

main()
  