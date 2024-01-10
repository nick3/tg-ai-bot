import * as sdk from "microsoft-cognitiveservices-speech-sdk";
import { v4 as uuidv4 } from 'uuid';
import { AppConfig, Config } from './config';

function generateUniqueFileNameWithUUID(): string {
  const uniqueId = uuidv4(); // 生成 UUID
  const fileName = `file_${uniqueId}.wav`;

  return fileName;
}

export class TTS {
  synthesizer?: sdk.SpeechSynthesizer;
  audioConfig?: sdk.AudioConfig;
  speechConfig?: sdk.SpeechConfig;
  appConfig?: AppConfig;

  constructor() {
    // this.init()
  }

  async init(filename?: string) {
    this.appConfig = (await Config.loadConfig()).config
    if (this.appConfig?.TTS_SUBSCRIPTION_KEY && this.appConfig?.TTS_SERVICE_REGION) {
      this.audioConfig = sdk.AudioConfig.fromAudioFileOutput(filename || 'tts.wav');
      this.speechConfig = sdk.SpeechConfig.fromSubscription(this.appConfig.TTS_SUBSCRIPTION_KEY, this.appConfig.TTS_SERVICE_REGION!);
      this.speechConfig.speechSynthesisVoiceName = "zh-CN-liaoning-XiaobeiNeural"

      this.synthesizer = new sdk.SpeechSynthesizer(this.speechConfig, this.audioConfig);
    } else {
      this.synthesizer = undefined
    }
  }

  async run(text: string): Promise<string> {
    // 生成 tts 输出文件的文件名，文件名可根据当前的时间戳来生成，确保不会重复。
    const uniqueFileName = generateUniqueFileNameWithUUID();
    await this.init(uniqueFileName)
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