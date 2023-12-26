import { config } from './config';
import { BaseChatModel } from "langchain/chat_models/base";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import { BufferMemory } from "langchain/memory";
import { ConversationChain } from "langchain/chains";
import { Context, NarrowedContext, Telegram } from "telegraf";
import { Message, Update } from "@telegraf/types";
import _ from 'lodash';

// 定义枚举类型 Models
export enum Models {
    GPT35Turbo = "gpt-3.5-turbo",
    GPT4 = "gpt-4",
    GeminiPro = "gemini-pro",
}

class ChatBot {
    chatId: number;
    model: Models;
    llm?: BaseChatModel;
    memory = new BufferMemory();
    conversationChain?: ConversationChain;

    constructor(chatId: number, model: Models = Models.GPT35Turbo) {
        this.chatId = chatId
        this.model = model;
        this.changeModel();
    }

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
}

type Conversations = {
    [key: number]: ChatBot;
};  

let conversations: Conversations = {}
const getConversation = (chatId: number) => {
    if (!conversations[chatId]) {
        conversations[chatId] = new ChatBot(chatId)
    }
    return conversations[chatId]
}

export const throtEditMessage = _.throttle(
    async (telegram: Telegram, chatId: number, messageId: number, text: string) => {
        console.log(chatId, messageId, text)
        await telegram.sendChatAction(chatId, 'typing')
        if (text && text.length > 0) {
            // text = telegramifyMarkdown(text, 'escape')
            await telegram.editMessageText(chatId, messageId, undefined, text)
        }
    },
    2500, 
    {leading: true, trailing: false}
);

export const sendMessagetoChatBot = async (message: string, chatId: number, ctx: NarrowedContext<Context<Update>, Update.MessageUpdate<Message>>, messageId: number) => {
    const chatBot = getConversation(chatId)
    let aiResponse = ''
    const response = await chatBot.sendMessage(message, token => {
        if(token.length > 0) {
            aiResponse += token;
            throtEditMessage(ctx.telegram, ctx.chat.id, messageId, aiResponse)
        }
    })

    let text = response.response as string
    // text = telegramifyMarkdown(text, 'escape')
    return text
}

export const changeChatBotModel = (chatId: number, model: Models) => {
    const chatBot = getConversation(chatId)
    chatBot.changeModel(model)
}