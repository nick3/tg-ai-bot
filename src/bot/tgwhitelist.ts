import { PrismaClient } from '@prisma/client'
import type { TelegramWhitelist } from '@prisma/client'

var _whitelist: TGWhitelist | undefined

export class TGWhitelist {
  whitelistChatIds: TelegramWhitelist[]

  constructor() {
    this.whitelistChatIds = []
  }

  async reload() {
    const prisma = new PrismaClient()
    this.whitelistChatIds = await prisma.telegramWhitelist.findMany()
  }

  isValid(chatId: number) {
    const id = this.whitelistChatIds.find((whitelistChatId) => {
      if (String(chatId) === whitelistChatId.ChatId) {
        return true
      }
    })
    if (id) {
      return true
    }
    return false
  }

  static async loadWhitelist() {
    if (!_whitelist) {
      _whitelist = new TGWhitelist()
      await _whitelist.reload()
    }
    return _whitelist
  }
}
