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
    const translatorTemplate = `你是一位精通多国语言的专业翻译。我希望你能帮我翻译以下内容。
    
    规则：
    - 保留特定的英文术语或名字，并在其前后加上空格，例如："中 UN 文"。
    - 如果要翻译的内容是中文，则请翻译为英文；如果要翻译的内容是其它语言，则请翻译为中文。
    
     
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
    const polishTemplate = `你是一名文学专家，精通各国语言的文字润色工作。润色后的文字优美易读且符合当地人的语言习惯。我希望你帮我润色以下文字内容。
    
     
    需要润色的内容：
    {content}
    润色后的内容：`;
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