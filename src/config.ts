import 'dotenv/config'

// 读取 .env 文件中的环境变量，并将其保存在 config 对象中
export const config = {
    BOT_TOKEN: process.env.BOT_TOKEN,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_API_URL: process.env.OPENAI_API_URL,
    AZURE_OPENAI_API_KEY: process.env.AZURE_OPENAI_API_KEY,
    AZURE_OPENAI_API_VERSION: process.env.AZURE_OPENAI_API_VERSION,
    AZURE_OPENAI_API_INSTANCE_NAME: process.env.AZURE_OPENAI_API_INSTANCE_NAME,
    AZURE_OPENAI_API_DEPLOYMENT_NAME: process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME,
    TTS_SUBSCRIPTION_KEY: process.env.TTS_SUBSCRIPTION_KEY,
    TTS_SERVICE_REGION: process.env.TTS_SERVICE_REGION,
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
    DEBUG: process.env.DEBUG,
}

// 清空 process.env 中上面已经保存在 config 对象中的环境变量
delete process.env.BOT_TOKEN
delete process.env.OPENAI_API_KEY
delete process.env.OPENAI_API_URL
delete process.env.AZURE_OPENAI_API_KEY
delete process.env.AZURE_OPENAI_API_VERSION
delete process.env.AZURE_OPENAI_API_INSTANCE_NAME
delete process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME