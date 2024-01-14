import { IProviderRepository } from '../../domain/aggregates/game-provider/game-repository';
import Game from '../../domain/aggregates/game-provider/game';
import prisma from '../database/database';
import { injectable } from 'inversify';
import LoginProvider from '../../domain/aggregates/game-provider/login-provider';
import { ProviderQuery } from '../../domain/aggregates/game-provider/provider-query';
import Jsonfile from '../../domain/aggregates/game-provider/game-information-json-file';
import GameIcon from '../../domain/aggregates/game-provider/game-icon';
import { GameQuery } from 'src/domain/aggregates/game-provider/game-query';
import { GameCategory, PostStatus } from '@prisma/client';
import GameVideo from '../../domain/aggregates/game-provider/game-video';
@injectable()
export default class ProviderRepository implements IProviderRepository {
  public async publishGame(game: Game): Promise<string> {
    const publishGame = await prisma.gameInformation.update({
      where: {
        id: game.id
      },
      data: {
        status: PostStatus.PUBLISHED
      }
    });
    return publishGame.id;
  }

  public async getProviderById(
    providerQuery: ProviderQuery
  ): Promise<LoginProvider | undefined> {
    const provider = await prisma.user.findUnique({
      where: {
        id: providerQuery.id
      }
    });

    return provider && !provider.deletedAt
      ? new LoginProvider(provider.id, provider.email)
      : undefined;
  }

  public async authenticateProvider(
    providerId: string,
    sessionId: string
  ): Promise<boolean> {
    const providerSession = await prisma.userSession.findFirst({
      where: {
        id: sessionId,
        userId: providerId
      }
    });
    const now = new Date();

    if (!providerSession || now > providerSession.expiredAt) {
      return false;
    }
    now.setDate(now.getDate() + 1);
    await prisma.userSession.update({
      where: {
        id: providerSession.id
      },
      data: {
        expiredAt: now
      }
    });
    return true;
  }

  public async authroize(gameId: string, providerId: string): Promise<boolean> {
    const game = await prisma.gameInformation.findFirst({
      where: {
        id: gameId,
        providerId,
        deletedAt: null
      }
    });
    return game !== null;
  }

  public async alreadyDeletedGame(
    deleteGameQuery: ProviderQuery
  ): Promise<Game | undefined> {
    const alreadyDeletedGame = await prisma.gameInformation.findFirst({
      where: {
        id: deleteGameQuery.gameId
      }
    });
    return alreadyDeletedGame && !alreadyDeletedGame.deletedAt
      ? new Game(
          alreadyDeletedGame.providerId,
          alreadyDeletedGame.name,
          alreadyDeletedGame.introduction
        )
      : undefined;
  }

  public async deleteGame(gameId: string): Promise<string> {
    const deleteGame = await prisma.gameInformation.update({
      where: {
        id: gameId
      },
      data: {
        deletedAt: new Date()
      }
    });
    return deleteGame.id;
  }

  public async gameExistance(gameId: string): Promise<boolean> {
    const id = await prisma.gameInformation.findUnique({
      where: {
        id: gameId
      }
    });
    return id !== null;
  }

  public async gameIdExist(gameId: string): Promise<boolean> {
    const id = await prisma.gameInformation.findUnique({
      where: {
        id: gameId
      }
    });
    return id !== null;
  }

  public async updateGameIcon(
    gameId: string,
    gamePath: string
  ): Promise<string> {
    const storeGame = await prisma.gameInformation.update({
      where: {
        id: gameId
      },
      data: {
        gameIconImagePath: gamePath
      }
    });
    return storeGame.id;
  }

  public async getGameIconPath(gameId: string): Promise<GameIcon | undefined> {
    const gameIcon = await prisma.gameInformation.findUnique({
      where: {
        id: gameId
      }
    });
    return gameIcon
      ? new GameIcon(gameIcon.id, gameIcon.gameIconImagePath)
      : undefined;
  }

  public async updateGameInforamtion(file: Jsonfile): Promise<string> {
    // const game = await prisma.gameInformation.update({
    //   where: {
    //     id: file.gameId
    //   },
    //   data: {
    //     chainMataData: JSON.parse(file.chainMataData!.buffer.toString())
    //   }
    // });
    return '1';
  }

  public async updateVideoPath(
    gameId: string,
    videoPath: string
  ): Promise<string> {
    const id = await prisma.gameInformation.update({
      where: {
        id: gameId
      },
      data: {
        videoPath: videoPath
      }
    });
    return id.id;
  }

  public async queryGamesByName(gameQuery: GameQuery): Promise<Array<Game>> {
    const games = await prisma.gameInformation.findMany({
      where: {
        name: {
          contains: gameQuery.name
        },
        deletedAt: null
      }
    });
    return games.map(
      (game) => new Game(game.providerId, game.name, game.introduction)
    );
  }
  public async updateGameCategory(
    gameId: string,
    gameCategory: GameCategory[]
  ): Promise<string> {
    const updateGameCategory = await prisma.gameInformation.update({
      where: {
        id: gameId
      },
      data: {
        gameCategory: gameCategory
      }
    });
    return updateGameCategory.id;
  }

  public async getGameVideoPath(
    gameId: string
  ): Promise<GameVideo | undefined> {
    const gameIcon = await prisma.gameInformation.findUnique({
      where: {
        id: gameId
      }
    });
    return gameIcon
      ? new GameVideo(gameIcon.id, gameIcon.videoPath!)
      : undefined;
  }

  // public async getGameLinks(
  //   gameId: string
  // ): Promise<Array<string> | undefined> {
  //   const gameLinks = await prisma.gameInformation.findUnique({
  //     where: {
  //       id: gameId
  //     }
  //   });
  //   const links: string[] = [];
  //   gameLinks ? links.push(gameLinks.externalLink) : links;
  //   return links.length > 0 ? links : undefined;
  // }
}
