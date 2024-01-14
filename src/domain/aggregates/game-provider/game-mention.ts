import { GameCategory } from '@prisma/client';

export default class GameMention {
  constructor(public name: string, public gameIconPath: string) {}
}
