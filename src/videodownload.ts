import { Message, Update } from '@telegraf/types';
import { Context } from 'telegraf';
import youtubedl from 'youtube-dl-exec'
import { logger } from './logger'

export const downloadVideo = async (url: string, ctx: Context<{
    message: Update.New & Update.NonChannel & Message.TextMessage;
    update_id: number;
}>) => {
    try {
        const output = await youtubedl(url, {
            output: '%(id)s.%(ext)s',
            preferFreeFormats: true,
            // format: 'mp4',
            dumpSingleJson: true,
            skipDownload: true
        })
        await youtubedl(url, {
            output: '%(id)s.%(ext)s',
            preferFreeFormats: true,
            // format: 'mp4',
        })
        return output
    } catch (error) {
        logger.error(error)
    }
}