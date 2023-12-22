import { Context, Markup, NarrowedContext, Telegraf } from "telegraf"
// import { message } from "telegraf/filters"
import 'dotenv/config'
import { downloadVideo } from './videodownload'
import fs from 'fs'
import { sendMessagetoChatGPT } from './chatgpt'
import { translate } from "./translator"
import { Message, Update } from "@telegraf/types"
import { forEach } from "lodash"

// 判断 process.env.BOT_TOKEN 是否为空，为空则报错提示并退出程序
if (!process.env.BOT_TOKEN) {
    console.error("BOT_TOKEN is empty")
    process.exit(1)
}

const handleTextMessage = async (message: string, ctx: NarrowedContext<Context<Update>, Update.MessageUpdate<Message>>) => {      
    // 回复🤔并获取消息 ID
    const thinkingMessage = await ctx.reply('🤔')
    const messageId = thinkingMessage.message_id

    // 设置机器人状态为正在输入
    await ctx.telegram.sendChatAction(ctx.chat.id, 'typing')

    // 使用 OpenAI 的 API（或其他 API）获取回复内容。此处假设为 fetchOpenAIReply。
    const replyContent = await sendMessagetoChatGPT(message, ctx.chat.id, ctx, messageId)

    // 修改🤔表情的消息为 API 返回的内容
    await ctx.telegram.editMessageText(ctx.chat.id, messageId, undefined, replyContent, {
        parse_mode: 'Markdown'
    })
}
async function main() {
    const bot = new Telegraf(process.env.BOT_TOKEN!)

    // bot.use(async (ctx, next) => {
    //     console.time(`Processing update ${ctx.update.update_id}`);
    //     console.log(ctx)
        
    //     bot.telegram.sendChatAction(ctx.chat!.id, 'typing')
    //     bot.telegram.sendMessage(ctx.chat!.id, 'HHHH', {
    //         reply_to_message_id: ctx.message!.message_id,
    //     })

    //     await next() // runs next middleware
    //     // runs after next middleware finishes
    //     console.timeEnd(`Processing update ${ctx.update.update_id}`);
    // })

    bot.start((ctx) => ctx.reply('Welcome'))
    bot.help((ctx) => ctx.reply('Send me a sticker'))
    // bot.on(message('sticker'), (ctx) => ctx.reply('👍'))

    bot.command('dl', async (ctx) => {
        console.log(ctx.payload)
        const output = await downloadVideo(ctx.payload, ctx)
        console.log(output)
        if (output) {
            await ctx.sendVideo({
                source: `./${output.id}.mp4`
            }, {
                width: output.width,
                height: output.height,
                duration: output.duration,
                caption: output.title,
                supports_streaming: true
            })
            // 删除 `./${output.id}.mp4` 这个文件
            fs.unlinkSync(`./${output.id}.mp4`)
        }
    })

    bot.command('trans', async (ctx) => {
        console.log(ctx.payload)
        const output = await translate(ctx.payload)
        ctx.reply(output)
    })

    bot.on('message', async (ctx) => {
        const botUsername = ctx.botInfo.username
        // 确保消息有 text 属性
        console.log(ctx.message)
        if ('text' in ctx.message) {
            const message = ctx.message;
            if (ctx.chat.type === 'private' || ctx.message.reply_to_message?.from?.username === botUsername) {
                await handleTextMessage(message.text, ctx)
            } else {
                if (message.entities) {
                    message.entities.forEach((entity) => {
                        if (entity.type === 'mention') {
                            // 机器人被@提及
                            const text = message.text.replace(`@${botUsername}`, 'AI')
                            handleTextMessage(text, ctx)
                            return
                        }
                    });
                }
            }
        }
    })
    bot.launch()

    // Enable graceful stop
    process.once('SIGINT', () => bot.stop('SIGINT'))
    process.once('SIGTERM', () => bot.stop('SIGTERM'))
}

main()
  