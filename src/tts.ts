import * as sdk from "microsoft-cognitiveservices-speech-sdk";
import { v4 as uuidv4 } from 'uuid';
import { config } from './config';

function generateUniqueFileNameWithUUID(): string {
    const uniqueId = uuidv4(); // 生成UUID
    const fileName = `file_${uniqueId}.wav`;

    return fileName;
}

export class TTS {
    synthesizer?: sdk.SpeechSynthesizer;
    audioConfig?: sdk.AudioConfig;
    speechConfig?: sdk.SpeechConfig;

    constructor() {
        // this.init()
    }

    init(filename?: string) {
        if (config.TTS_SUBSCRIPTION_KEY && config.TTS_SERVICE_REGION) {
            this.audioConfig = sdk.AudioConfig.fromAudioFileOutput(filename || 'tts.wav');
            this.speechConfig = sdk.SpeechConfig.fromSubscription(config.TTS_SUBSCRIPTION_KEY, config.TTS_SERVICE_REGION);
            this.speechConfig.speechSynthesisVoiceName = "zh-CN-liaoning-XiaobeiNeural"

            this.synthesizer = new sdk.SpeechSynthesizer(this.speechConfig, this.audioConfig);
        } else {
            this.synthesizer = undefined
        }
    }

    run(text: string): Promise<string> {
        // 生成tts输出文件的文件名，文件名可根据当前的时间戳来生成，确保不会重复。
        const uniqueFileName = generateUniqueFileNameWithUUID();
        this.init(uniqueFileName)
        return new Promise((resolve, reject) => {
            if (this.synthesizer) {
                this.synthesizer.speakTextAsync(text,
                    (result) => {
                        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
                            resolve(uniqueFileName)
                        } else {
                            reject("Speech synthesis canceled, " + result.errorDetails +
                                "\nDid you update the subscription info?")
                        }
                        this.synthesizer!.close();
                        this.synthesizer = undefined;
                    }
                );
            }
        })
    }
}