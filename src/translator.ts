import { SimpleSequentialChain, LLMChain } from "langchain/chains";
import { OpenAI } from "langchain/llms/openai";
import { PromptTemplate } from "langchain/prompts";
import 'dotenv/config'

export const translate =async (text: string) => {
    const translatorLLM = new OpenAI({ 
        modelName: "gpt-3.5-turbo",
        openAIApiKey: process.env.OPENAI_API_KEY,
        configuration: {
            baseURL: process.env.OPENAI_API_URL
        }
    });
    const translatorTemplate = `你是一位精通多国语言的专业翻译。我希望你能帮我翻译内容。如果需要翻译的内容源语言是中文，则请将其翻译为美式英文；如果需要翻译的内容源语言不是中文，则请其翻译为中文。
    
     
      需要翻译的内容：
      {origin}
      翻译后的内容：`;
    const translatorPromptTemplate = new PromptTemplate({
      template: translatorTemplate,
      inputVariables: ["origin"],
    });
    const translatorChain = new LLMChain({
      llm: translatorLLM,
      prompt: translatorPromptTemplate,
    });
    
    const polishllm = new OpenAI({ 
        modelName: "gpt-3.5-turbo",
        openAIApiKey: process.env.OPENAI_API_KEY,
        configuration: {
            baseURL: process.env.OPENAI_API_URL
        }
    });
    const polishTemplate = `你是一名文学专家，精通各国语言的文字修订工作。修订后的文字优美易读且符合当地人的语言习惯。我希望你帮对以下内容进行修订，不要进行翻译，保持原来的语言，你只是对文字内容进行修订，使它们更清晰、简洁和连贯。
    
     
    需要修订的内容：
    {content}
    修订后的内容：`;
    const polishPromptTemplate = new PromptTemplate({
      template: polishTemplate,
      inputVariables: ["content"],
    });
    const polishChain = new LLMChain({ llm: polishllm, prompt: polishPromptTemplate });
    
    const overallChain = new SimpleSequentialChain({
      chains: [translatorChain, polishChain],
      verbose: true,
    });
    const result = await overallChain.run(text);
    console.log(result);
    return result
}