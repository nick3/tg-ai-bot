import { ChatOpenAI } from "langchain/chat_models/openai";
import {
  BufferMemory,
  CombinedMemory,
  ConversationSummaryMemory,
} from "langchain/memory";
import { ConversationChain } from "langchain/chains";
import { PromptTemplate } from "langchain/prompts";
import 'dotenv/config'
import { Context, NarrowedContext, Telegram } from "telegraf";
import { Message, Update } from "@telegraf/types";
import _ from 'lodash'

const _DEFAULT_TEMPLATE = `The following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of specific details from its context. If the AI does not know the answer to a question, it truthfully says it does not know. AI can only communicate with humans in Chinese.

Summary of conversation:
{conversation_summary}
Current conversation:
{chat_history_lines}
Human: {input}
AI:`;

const PROMPT = new PromptTemplate({
  inputVariables: ["input", "conversation_summary", "chat_history_lines"],
  template: _DEFAULT_TEMPLATE,
});

class ChatGPT {
  chatId: number
  bufferMemory: BufferMemory
  summaryMemory: ConversationSummaryMemory
  memory: CombinedMemory
  model: ChatOpenAI
  chain: ConversationChain

  constructor(chatId: number) {
    this.chatId = chatId

    // buffer memory
    this.bufferMemory = new BufferMemory({
      memoryKey: "chat_history_lines",
      inputKey: "input",
    });

    // summary memory
    this.summaryMemory = new ConversationSummaryMemory({
      llm: new ChatOpenAI({
        modelName: "gpt-3.5-turbo",
        temperature: 0,
        openAIApiKey: process.env.OPENAI_API_KEY,
        configuration: {
          baseURL: process.env.OPENAI_API_URL
        }
      }),
      inputKey: "input",
      memoryKey: "conversation_summary",
    });

    this.memory = new CombinedMemory({
      memories: [this.bufferMemory, this.summaryMemory],
    });

    this.model = new ChatOpenAI({
      temperature: 0.9,
      verbose: false,
      streaming: true,
      openAIApiKey: process.env.OPENAI_API_KEY,
      configuration: {
        baseURL: process.env.OPENAI_API_URL
      }
    });
    this.chain = new ConversationChain({ llm: this.model, memory: this.memory, prompt: PROMPT });
  }

  sendMessage(message: string, handleLLMNewToken?: (token: string) => void) {
    return this.chain.call({
      input: message,
      callbacks: [
        {
          handleLLMNewToken
        },
      ],
    });
  }
}

type Conversations = {
  [key: number]: ChatGPT;
};

let conversations: Conversations = {}
const getConversation = (chatId: number) => {
  if (!conversations[chatId]) {
    conversations[chatId] = new ChatGPT(chatId)
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
  { leading: true, trailing: false }
);

export const sendMessagetoChatGPT = async (message: string, chatId: number, ctx: NarrowedContext<Context<Update>, Update.MessageUpdate<Message>>, messageId: number) => {
  const chatGPT = getConversation(chatId)
  let aiResponse = ''
  const response = await chatGPT.sendMessage(message, token => {
    aiResponse += token;
    throtEditMessage(ctx.telegram, ctx.chat.id, messageId, aiResponse)
  })

  let text = response.response as string
  // text = telegramifyMarkdown(text, 'escape')
  return text
}
