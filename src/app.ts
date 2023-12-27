import { Context, Markup, NarrowedContext, Telegraf } from "telegraf"
// import { message } from "telegraf/filters"
import { config } from './config'
import { downloadVideo } from './videodownload'
import fs from 'fs'
import { Models, ChatBotManager } from './chatbot'
import { translate } from "./translator"
import { Message, Update } from "@telegraf/types"
import { logger } from "./logger"

// 判断 config.BOT_TOKEN 是否为空，为空则报错提示并退出程序
if (!config.BOT_TOKEN) {
    logger.error("BOT_TOKEN is empty")
    process.exit(1)
}

const handleTextMessage = async (chatBotManager: ChatBotManager, message: string, ctx: NarrowedContext<Context<Update>, Update.MessageUpdate<Message>>) => {
    // 回复🤔并获取消息 ID
    const thinkingMessage = await ctx.reply('🤔')
    const messageId = thinkingMessage.message_id

    // 设置机器人状态为正在输入
    await ctx.telegram.sendChatAction(ctx.chat.id, 'typing')

    // 使用 OpenAI 的 API（或其他 API）获取回复内容。此处假设为 fetchOpenAIReply。
    const replyContent = await chatBotManager.sendMessagetoChatBot(message, ctx.chat.id, ctx, messageId)

    // 修改🤔表情的消息为 API 返回的内容
    await ctx.telegram.editMessageText(ctx.chat.id, messageId, undefined, replyContent + ' 🔚', {
        parse_mode: 'Markdown'
    })
}
async function main() {
    const bot = new Telegraf(config.BOT_TOKEN!)
    const chatBotManager = new ChatBotManager()

    // 获取 bot 的基本信息
    const botInfo = await bot.telegram.getMe()
    logger.info(botInfo)
    const botUsername = botInfo.username

    bot.use(async (ctx, next) => {
        // 判断消息是否来自群组
        if (ctx.chat?.type === 'group' || ctx.chat?.type === 'supergroup') {
            logger.debug(ctx.message)
            // 使用类型守卫确保 ctx.message 是 TextMessage 类型
            if (ctx.message) {
                const msg = ctx.message
                if ('text' in msg) {
                    // 现在 TypeScript 知道 msg 是 TextMessage 类型
                    msg.entities?.forEach(async (entity) => {
                        if (entity.type === 'mention') {
                            // 判断被 @ 的对象的 username 是否为机器人的 username
                            if (msg.text?.slice(entity.offset, entity.offset + entity.length) === `@${botUsername}`) {
                                await next();
                                return;
                            }
                        }
                    });
                    if (msg.reply_to_message?.from?.username === botUsername) {
                        await next();
                        return;
                    }
                }
            }
        } else {
            await next() // runs next middleware
        }
    })

    bot.start((ctx) => ctx.reply('Welcome'))

    bot.command('models', async (ctx) => {
        logger.debug(ctx.payload)
        // 在telegram中显示一个inline键盘，候选项为枚举类型 Models 中的所有模型
        await ctx.reply(`当前使用的模型为 ${chatBotManager.getCurrentChatBotModel(ctx.chat!.id)}，请选择需要切换的大语言模型:`, {
            ...Markup.inlineKeyboard([
                Markup.button.callback(Models.GPT35Turbo, Models.GPT35Turbo),
                Markup.button.callback(Models.GPT4, Models.GPT4),
                Markup.button.callback(Models.GeminiPro, Models.GeminiPro),
                Markup.button.callback('取消修改', 'cancel-model-change'),
            ])
        })
    })

    for (const model of Object.values(Models)) {
        bot.action(model, async (ctx) => {
            // 处理用户点击按钮的事件
            // 在这里使用model进行逻辑处理
            chatBotManager.changeChatBotModel(ctx.chat!.id, model);
            ctx.answerCbQuery();  // 记得调用这个方法来通知 Telegram 你已经处理了这个回调

            await ctx.editMessageText(`模型已切换为 ${model}！`);
        });
    }
    bot.action('cancel-model-change', async (ctx) => {
        ctx.answerCbQuery();
        await ctx.editMessageText(`已取消修改。`);
    });

    bot.command('clear', async (ctx) => {
        chatBotManager.clearChatBotMemory(ctx.chat!.id);
        await ctx.reply('已清除当前会话记录，开启新的会话。');
    });

    bot.command('dl', async (ctx) => {
        logger.debug(ctx.payload)
        const output = await downloadVideo(ctx.payload, ctx)
        logger.debug(output)
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
        logger.debug(ctx.payload)
        const output = await translate(ctx.payload)
        ctx.reply(output)
    })

    bot.on('message', async (ctx) => {
        const botUsername = ctx.botInfo.username
        // 确保消息有 text 属性
        logger.debug(ctx.message)
        if ('text' in ctx.message) {
            const message = ctx.message;
            if (ctx.chat.type === 'private' || ctx.message.reply_to_message?.from?.username === botUsername) {
                await handleTextMessage(chatBotManager, message.text, ctx)
            } else {
                if (message.entities) {
                    message.entities.forEach((entity) => {
                        if (entity.type === 'mention') {
                            // 机器人被@提及
                            const text = message.text.replace(`@${botUsername}`, 'AI')
                            handleTextMessage(chatBotManager, text, ctx)
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
