import Game from './game';
import LoginProvider from './login-provider';
import { ProviderQuery } from './provider-query';
import Jsonfile from './game-information-json-file';
import GameIcon from './game-icon';
import { GameQuery } from './game-query';
import { GameCategory } from '@prisma/client';
import GameVideo from './game-video';
export interface IProviderRepository {
  publishGame(game: Game): Promise<string>;
  getProviderById(
    providerQuery: ProviderQuery
  ): Promise<LoginProvider | undefined>;
  authenticateProvider(providerId: string, sessionId: string): Promise<boolean>;
  authroize(gameId: string, providerId: string): Promise<boolean>;
  alreadyDeletedGame(deleteGameQuery: ProviderQuery): Promise<Game | undefined>;
  deleteGame(gameId: string): Promise<string>;
  updateGameIcon(gameId: string, gamePath: string): Promise<string>;
  gameExistance(gameId: string): Promise<boolean>;
  getGameIconPath(gameId: string): Promise<GameIcon | undefined>;
  updateGameInforamtion(file: Jsonfile): Promise<string>;
  gameIdExist(gameId: string): Promise<boolean>;
  updateVideoPath(gameId: string, videoPath: string): Promise<string>;
  queryGamesByName(gameQuery: GameQuery): Promise<Array<Game>>;
  updateGameCategory(
    gameId: string,
    gameCategory: GameCategory[]
  ): Promise<string>;
  getGameVideoPath(gameId: string): Promise<GameVideo | undefined>;
  // getGameLinks(gameId: string): Promise<Array<string> | undefined>;
}
