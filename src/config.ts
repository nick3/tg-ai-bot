import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import type { Config as TConfig } from '@prisma/client'

export type AppConfig = {
    [key: string]: string | boolean | undefined;
    BOT_TOKEN?: string
    OPENAI_API_KEY?: string
    OPENAI_API_URL?: string
    AZURE_OPENAI_API_KEY?: string
    AZURE_OPENAI_API_VERSION?: string
    AZURE_OPENAI_API_INSTANCE_NAME?: string
    AZURE_OPENAI_API_DEPLOYMENT_NAME?: string
    TTS_SUBSCRIPTION_KEY?: string
    TTS_SERVICE_REGION?: string
    TTS: boolean
    GOOGLE_API_KEY?: string
}

var _config: Config | undefined

export class Config {
    config?: AppConfig

    constructor() {
        this.config = {
            BOT_TOKEN: process.env.BOT_TOKEN,
            OPENAI_API_KEY: process.env.OPENAI_API_KEY,
            OPENAI_API_URL: process.env.OPENAI_API_URL,
            AZURE_OPENAI_API_KEY: process.env.AZURE_OPENAI_API_KEY,
            AZURE_OPENAI_API_VERSION: process.env.AZURE_OPENAI_API_VERSION,
            AZURE_OPENAI_API_INSTANCE_NAME: process.env.AZURE_OPENAI_API_INSTANCE_NAME,
            AZURE_OPENAI_API_DEPLOYMENT_NAME: process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME,
            TTS_SUBSCRIPTION_KEY: process.env.TTS_SUBSCRIPTION_KEY,
            TTS_SERVICE_REGION: process.env.TTS_SERVICE_REGION,
            TTS: process.env.TTS === 'true',
            GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
        }
    }

    updateConfigFromRawData(rawData: TConfig[]) {
        Object.keys(this.config!).forEach(key => {
            const found = rawData.find(item => item.CfgKey === key);
            if (found) {
                if (key === 'TTS') {
                    this.config![key] = found.CfgValue === 'true';
                } else {
                    this.config![key] = found.CfgValue;
                }
            }
        });
    }
    

    async reload() {
        const prisma = new PrismaClient()
        const config = await prisma.config.findMany()
        this.updateConfigFromRawData(config)
    }

    static async loadConfig() {
        if (!_config) {
            _config = new Config()
            await _config.reload()
        }
        return _config
    }
}
