import { GameCategory } from '@prisma/client';

export default class Game {
  constructor(
    public readonly providerId: string,
    public name: string,
    public introduction: string,
    public gameCategory?: GameCategory[],
    public readonly id?: string,
    public gameIconPath?: string,
    public chain?: String[]
  ) {}
}
