import { IProviderRepository } from '../aggregates/game-provider/game-repository';
import TYPES from '../constants/types';
import { inject, injectable } from 'inversify';
import Game from '../aggregates/game-provider/game';
import { ProviderQuery } from '../aggregates/game-provider/provider-query';
import { GameCategory } from '@prisma/client';
import {
  AuthenticationError,
  ERROR_CODE,
  NotFoundError,
  AuthorizationError
} from '../../errors/index';
import { IFileStorage } from '../contracts/file-storage';
import Jsonfile from '../aggregates/game-provider/game-information-json-file';
import { GameQuery } from '../aggregates/game-provider/game-query';

@injectable()
export default class ProviderService {
  getGameLinks(gameId: string) {
    throw new Error('Method not implemented.');
  }
  constructor(
    @inject(TYPES.ProviderRepository)
    private readonly providerRepository: IProviderRepository,
    @inject(TYPES.FileStorage)
    private readonly fileStorage: IFileStorage
  ) {}

  public async publishGame(game: Game): Promise<string> {
    return this.providerRepository.publishGame(game);
  }

  public async authenticateProvider(
    providerId: string,
    sessionId: string
  ): Promise<string> {
    const providerQuery: ProviderQuery = { id: providerId };

    const loginProvider = await this.providerRepository.getProviderById(
      providerQuery
    );

    if (!loginProvider) {
      throw new AuthenticationError(
        ERROR_CODE.AUTHENTICATION_ERROR,
        `User trying to authenticate with userId: ${providerId} does not existed.`
      );
    }

    const authenticatedUser =
      await this.providerRepository.authenticateProvider(providerId, sessionId);

    if (!authenticatedUser) {
      throw new AuthenticationError(
        ERROR_CODE.AUTHENTICATION_ERROR,
        `User trying to authenticate with userId: ${providerId} session not found.`
      );
    }

    return loginProvider.id;
  }

  public async authorize(gameId: string, providerId: string): Promise<string> {
    const authorized = await this.providerRepository.authroize(
      gameId,
      providerId
    );
    if (!authorized) {
      throw new AuthorizationError(
        ERROR_CODE.UNAUTHORIZED_OPERATION,
        `User with userId: ${providerId} trying to modify game with gameId: ${gameId} is not authorized.`
      );
    }
    return gameId;
  }

  public async deleteGame(gameId: string): Promise<string> {
    const deleteGameQuery: ProviderQuery = { gameId: gameId };
    const alreadyDeletedGame = await this.providerRepository.alreadyDeletedGame(
      deleteGameQuery
    );
    if (!alreadyDeletedGame) {
      throw new NotFoundError(
        ERROR_CODE.GAME_NOT_FOUND,
        `Game with gameId: ${gameId} already deleted.`
      );
    }
    return this.providerRepository.deleteGame(deleteGameQuery.gameId!);
  }

  public async uploadIconToBucket(key: string, body: Buffer): Promise<void> {
    try {
      await this.fileStorage.uploadGameIcon(key, body);
    } catch (error) {
      throw new AuthenticationError(
        ERROR_CODE.GAME_NOT_FOUND,
        `Game is not found` + error
      );
    }
  }

  public async uploadVideo(
    key: string,
    body: Buffer,
    gameId: string
  ): Promise<string> {
    try {
      await this.fileStorage.uploadVideo(key, body, gameId);
      return this.storeVideoPath(gameId, key);
    } catch (error) {
      throw new AuthenticationError(
        ERROR_CODE.GAME_NOT_FOUND,
        `Game is not found` + error
      );
    }
  }

  public async storeGamePath(
    gameId: string,
    gamePath: string
  ): Promise<string> {
    const gameIdExist = await this.providerRepository.gameIdExist(gameId);
    let storeGameId;
    if (!gameIdExist) {
      throw new NotFoundError(
        ERROR_CODE.GAME_NOT_FOUND,
        `Game with gameId: ${gameId} not found.`
      );
    }
    storeGameId = await this.providerRepository.updateGameIcon(
      gameId,
      gamePath
    );
    return gameId;
  }

  public async storeVideoPath(
    gameId: string,
    videoPath: string
  ): Promise<string> {
    const gameIdExist = await this.providerRepository.gameIdExist(gameId);
    if (!gameIdExist) {
      throw new NotFoundError(
        ERROR_CODE.POST_NOT_FOUND,
        `Game with gameId: ${gameId} not found.`
      );
    }
    return await this.providerRepository.updateVideoPath(gameId, videoPath);
  }

  public async getGameIconPath(gameId: string): Promise<string> {
    const gamePath = await this.providerRepository.getGameIconPath(gameId);
    if (!gamePath) {
      throw new NotFoundError(
        ERROR_CODE.GAME_NOT_FOUND,
        `Game with gameId: ${gameId} not found.`
      );
    }
    return gamePath.imagePath;
  }

  public async findgameIconFromBucket(gamePath: string): Promise<string> {
    try {
      return await this.fileStorage.findgameIconFromBucket(gamePath);
    } catch (error) {
      throw new AuthenticationError(
        ERROR_CODE.GAME_NOT_FOUND,
        `Game icon is not found`
      );
    }
  }

  public async updateGameInforamtion(file: Jsonfile): Promise<string> {
    return this.providerRepository.updateGameInforamtion(file);
  }

  public async queryGamesByName(
    name: string | undefined,
    pageIndex: number,
    pageLimit: number
  ): Promise<Array<Game>> {
    const findGamesByNameQuery: GameQuery = {
      name: name,
      pageIndex: pageIndex,
      pageLimit: pageLimit
    };
    return this.providerRepository.queryGamesByName(findGamesByNameQuery);
  }
  public async updateGameCategory(
    gameId: string,
    gameCategory: GameCategory[]
  ): Promise<string> {
    const updateGameCategory = await this.providerRepository.updateGameCategory(
      gameId,
      gameCategory
    );
    if (!updateGameCategory) {
      throw new NotFoundError(
        ERROR_CODE.GAME_NOT_FOUND,
        'Game with gameId: ${gameId} is not found'
      );
    }
    return updateGameCategory;
  }

  public async getGameVideoPath(gameId: string): Promise<string> {
    const gamePath = await this.providerRepository.getGameVideoPath(gameId);
    if (!gamePath) {
      throw new NotFoundError(
        ERROR_CODE.GAME_NOT_FOUND,
        `Game with gameId: ${gameId} not found.`
      );
    }
    return gamePath.videoPath;
  }

  // public async getGameLinks(gameId: string): Promise<Array<string>> {
  //   const gameLinks = await this.providerRepository.getGameLinks(gameId);
  // }
}
