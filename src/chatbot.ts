import { config } from './config';
import { BaseChatModel } from "langchain/chat_models/base";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import { BufferWindowMemory } from "langchain/memory";
import { ConversationChain } from "langchain/chains";
import { Context, NarrowedContext, Telegram } from "telegraf";
import { Message, Update } from "@telegraf/types";
import _ from 'lodash';
import { logger } from "./logger"

// 定义枚举类型 Models
export enum Models {
    GPT35Turbo = "gpt-3.5-turbo",
    GPT4 = "gpt-4",
    GeminiPro = "gemini-pro",
}

/**
 * Represents a chat bot.
 */
class ChatBot {
    chatId: number;
    model: Models;
    llm?: BaseChatModel;
    memory = new BufferWindowMemory({ k: 20 });
    conversationChain?: ConversationChain;

    /**
     * Creates a new instance of the ChatBot class.
     * @param chatId - The ID of the chat.
     * @param model - The model to use for the chat bot. Defaults to Models.GPT35Turbo.
     */
    constructor(chatId: number, model: Models = Models.GPT35Turbo) {
        this.chatId = chatId
        this.model = model;
        this.changeModel();
    }

    /**
     * Changes the model used by the chat bot.
     * @param model - The new model to use. If not specified, the current model will be used.
     */
    changeModel(model?: Models) {
        if (model) {
            this.model = model;
        }
        switch (this.model) {
            case Models.GPT35Turbo:
                this.llm = new ChatOpenAI({
                    modelName: "gpt-3.5-turbo",
                    temperature: 0.9,
                    openAIApiKey: config.OPENAI_API_KEY,
                    configuration: {
                        baseURL: config.OPENAI_API_URL
                    }
                });

                break;

            case Models.GPT4:
                this.llm = new ChatOpenAI({
                    temperature: 0.9,
                    azureOpenAIApiKey: config.AZURE_OPENAI_API_KEY,
                    azureOpenAIApiVersion: config.AZURE_OPENAI_API_VERSION,
                    azureOpenAIApiInstanceName: config.AZURE_OPENAI_API_INSTANCE_NAME,
                    azureOpenAIApiDeploymentName: config.AZURE_OPENAI_API_DEPLOYMENT_NAME,
                });

                break;

            case Models.GeminiPro:
                this.llm = new ChatGoogleGenerativeAI({
                    modelName: "gemini-pro",
                    maxOutputTokens: 2048,
                    safetySettings: [
                        {
                            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                            threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
                        },
                    ],
                }) as unknown as BaseChatModel;

                break;

            default:
                break;
        }
        if (this.llm) {
            this.conversationChain = new ConversationChain({ llm: this.llm, memory: this.memory });
        } else {
            throw new Error("No model");
        }
    }

    /**
     * Sends a message to the chat bot.
     * @param message - The message to send.
     * @param handleLLMNewToken - Optional callback function to handle new tokens from the language model.
     * @returns A Promise that resolves to the response from the chat bot.
     */
    sendMessage(message: string, handleLLMNewToken?: (token: string) => void) {
        if (this.conversationChain) {
            return this.conversationChain.call({
                input: message,
                callbacks: [
                    {
                        handleLLMNewToken
                    },
                ],
            });
        } else {
            throw new Error("No conversationChain");
        }
    }

    /**
     * Clears the memory of the chat bot.
     * @returns A Promise that resolves when the memory is cleared.
     */
    async clearMemory() {
        await this.memory.clear();
    }
}


type Conversations = {
    [key: number]: ChatBot;
};

export class ChatBotManager {
    conversations: Conversations = {}

    /**
     * 获取对话实例
     * @param chatId - 聊天ID
     * @returns 对话实例
     */
    getConversation = (chatId: number) => {
        if (!this.conversations[chatId]) {
            this.conversations[chatId] = new ChatBot(chatId)
        }
        return this.conversations[chatId]
    }

    /**
     * Throttles the editing of a message in a chat.
     * 
     * @param telegram - The Telegram instance.
     * @param chatId - The ID of the chat.
     * @param messageId - The ID of the message.
     * @param text - The new text for the message.
     */
    throtEditMessage = _.throttle(
        async (telegram: Telegram, chatId: number, messageId: number, text: string) => {
            logger.debug(`${chatId}, ${messageId}, ${text}`)
            await telegram.sendChatAction(chatId, 'typing')
            if (text && text.length > 0) {
                // text = telegramifyMarkdown(text, 'escape')
                await telegram.editMessageText(chatId, messageId, undefined, text)
            }
        },
        2500,
        { leading: true, trailing: false }
    );

    /**
     * Sends a message to the chat bot and returns the response.
     * @param message - The message to send to the chat bot.
     * @param chatId - The ID of the chat.
     * @param ctx - The context object containing information about the update.
     * @param messageId - The ID of the message.
     * @returns The response from the chat bot.
     */
    sendMessagetoChatBot = async (message: string, chatId: number, ctx: NarrowedContext<Context<Update>, Update.MessageUpdate<Message>>, messageId: number) => {
        const chatBot = this.getConversation(chatId)
        let aiResponse = ''
        const response = await chatBot.sendMessage(message, token => {
            if (token.length > 0) {
                aiResponse += token;
                this.throtEditMessage(ctx.telegram, ctx.chat.id, messageId, aiResponse)
            }
        })

        let text = response.response as string
        // text = telegramifyMarkdown(text, 'escape')
        return text
    }

    /**
     * Changes the model of the chatbot for a specific chat.
     * @param chatId - The ID of the chat.
     * @param model - The new model to be assigned to the chatbot.
     */
    changeChatBotModel = (chatId: number, model: Models) => {
        const chatBot = this.getConversation(chatId)
        chatBot.changeModel(model)
    }

    /**
     * Clears the memory of the chat bot for a specific chat.
     * @param chatId - The ID of the chat.
     */
    clearChatBotMemory = async (chatId: number) => {
        const chatBot = this.getConversation(chatId)
        await chatBot.clearMemory()
    }

    /**
     * 获取当前聊天机器人模型。
     * @param chatId - 聊天ID。
     * @returns 当前聊天机器人模型。
     */
    getCurrentChatBotModel = (chatId: number) => {
        const chatBot = this.getConversation(chatId)
        return chatBot.model
    }
}