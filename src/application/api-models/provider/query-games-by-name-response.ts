import Game from 'src/domain/aggregates/game-provider/game';

class GameResponse {
  constructor(
    public providerId: string,
    public name: string,
    public introduction: string
  ) {}
}

export default class QueryGamesResponse {
  constructor(public games: Array<GameResponse>) {}

  static fromGames(games: Array<Game>) {
    return new QueryGamesResponse(
      games.map(
        (game) =>
          new GameResponse(game.providerId, game.name, game.introduction)
      )
    );
  }
}
