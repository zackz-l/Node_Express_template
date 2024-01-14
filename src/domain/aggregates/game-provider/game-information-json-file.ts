export default class GameInforamtionFile {
  constructor(
    public readonly gameId: string,
    public chainMataData: object,
    public externalLink: object,
    public chainModifiedGame: object
  ) {}
}
