import { Request, Response } from 'express';
import HttpStatusCode from 'http-status-codes';
import {
  controller,
  httpGet,
  httpPost,
  httpDelete,
  httpPatch
} from 'inversify-express-utils';
import PublishGameRequest from '../api-models/provider/publish-game-request';
import DeleteGameRequest from '../api-models/provider/delete-game-request';
import UploadGameIconRequest from '../api-models/provider/upload-game-icon-request';
import UploadVideoRequest from '../api-models/provider/upload-video-request';
import GetGameIconRequest from '../api-models/provider/get-game-icon-request';
import UpdateGameInformationRequest from '../api-models/provider/update-game-information-request';
import ProviderService from '../../domain/services/game';
import { inject } from 'inversify';
import providerAuthenticate from '../middlewares/provider-authenticate';
import gameOperationAuthorize from '../middlewares/game-authorize';
import { ENCODE } from '../../domain/constants/encode';
import multerBodyParser from '../middlewares/multer';
import logger from '../../infrastructure/log/logger';
import QueryGamesByNameRequest from '../api-models/provider/query-games-by-name-request';
import QueryGamesResponse from '../api-models/provider/query-games-by-name-response';
import UpdateGameCategoryRequest from '../api-models/provider/update-game-category';
import { GameCategory } from '@prisma/client';
import { http } from 'winston';

@controller('/games')
export default class ProviderController {
  constructor(
    @inject(ProviderService)
    private readonly providerService: ProviderService
  ) {}

  @httpPost('/')
  public async publishGame(
    request: Request,
    response: Response
  ): Promise<void> {
    const publishGameRequest = await new PublishGameRequest(request).validate();
    const gameId = await this.providerService.publishGame(
      publishGameRequest.toGame()
    );
    response.status(HttpStatusCode.CREATED).json({ id: gameId });
  }

  @httpDelete('/:gameId/delete')
  public async deleteGame(request: Request, response: Response): Promise<void> {
    const deleteGameRequest = await new DeleteGameRequest(request).validate();
    const { gameId } = deleteGameRequest;
    const deletedGameId = await this.providerService.deleteGame(gameId);
    response.status(HttpStatusCode.OK).json({ id: deletedGameId });
  }

  @httpPost('/:gameId/uploadIcon', multerBodyParser.single('images'))
  public async uploadGameIcon(
    request: Request,
    response: Response
  ): Promise<void> {
    const uploadGameIconRequest = await new UploadGameIconRequest(
      request
    ).validate();
    await this.providerService.uploadIconToBucket(
      uploadGameIconRequest.toGameIconPath(),
      uploadGameIconRequest.imageBuffer
    );
    const storedGameId = await this.providerService.storeGamePath(
      uploadGameIconRequest.gameId,
      uploadGameIconRequest.toGameIconPath()
    );
    response.status(HttpStatusCode.OK).json({ id: storedGameId });
  }

  @httpGet('/:gameId/getIcon', gameOperationAuthorize)
  public async getGameIcon(
    request: Request,
    response: Response
  ): Promise<void> {
    const getGameIconRequest = await new GetGameIconRequest(request).validate();
    const { gameId } = getGameIconRequest;
    const GameIconPath = await this.providerService.getGameIconPath(gameId);
    const url = await this.providerService.findgameIconFromBucket(GameIconPath);
    response.status(HttpStatusCode.OK).json({ string: url });
  }

  @httpPost(
    '/:gameId/updateGameInforamtion',
    multerBodyParser.single('chainMataData'),
    gameOperationAuthorize
  )
  public async uploadJsonfile(
    request: Request,
    response: Response
  ): Promise<void> {
    const uploadJsonfileRequest = await new UpdateGameInformationRequest(
      request
    ).validate();
    const gameId = await this.providerService.updateGameInforamtion(
      uploadJsonfileRequest.tofile()
    );
    response.status(HttpStatusCode.CREATED).json({ id: gameId });
  }

  @httpPost('/:gameId/uploadVideo', multerBodyParser.single('video'))
  public async uploadVideo(
    request: Request,
    response: Response
  ): Promise<void> {
    const uploadJsonfileRequest = await new UploadVideoRequest(
      request
    ).validate();
    const storedGameId = await this.providerService.uploadVideo(
      uploadJsonfileRequest.toVideoPath(),
      uploadJsonfileRequest.videoBuffer,
      uploadJsonfileRequest.gameId
    );
    response.status(HttpStatusCode.CREATED).json({ id: storedGameId });
  }

  @httpGet('/name/search')
  public async queryGamesByName(
    request: Request,
    response: Response
  ): Promise<void> {
    const queryGamesByNameRequest = await new QueryGamesByNameRequest(
      request
    ).validate();
    const { name, pageIndex, pageLimit } = queryGamesByNameRequest;
    const games = await this.providerService.queryGamesByName(
      name,
      pageIndex,
      pageLimit
    );
    const queryGames = QueryGamesResponse.fromGames(games);
    response.status(HttpStatusCode.OK).json(queryGames);
  }

  @httpPatch('/:gameId/updateGameCategory')
  public async updateGameCategory(
    request: Request,
    response: Response
  ): Promise<void> {
    const updateGameCategoryRequest = await new UpdateGameCategoryRequest(
      request
    ).validate();
    const { gameId, gameCategory } = updateGameCategoryRequest;
    const updateGameID = await this.providerService.updateGameCategory(
      gameId,
      gameCategory
    );
    response.status(HttpStatusCode.CREATED).json({ id: updateGameID });
  }

  @httpGet('/:gameId/getVideo')
  public async getGameVideo(
    request: Request,
    response: Response
  ): Promise<void> {
    const getGameIconRequest = await new GetGameIconRequest(request).validate();
    const { gameId } = getGameIconRequest;
    const GameIconPath = await this.providerService.getGameVideoPath(gameId);
    const url = await this.providerService.findgameIconFromBucket(GameIconPath);
    response.status(HttpStatusCode.OK).json({ string: url });
  }

  // @httpPost('/gameOnboard', multerBodyParser.single('form'))
  // public async gameOnboard(
  //   request: Request,
  //   response: Response
  // ): Promise<void> {
  //   const uploadJsonfileRequest = await new GameOnboardRequest(
  //     request
  //   ).validate();
  //   const storedGameId = await this.providerService.uploadVideo(
  //     uploadJsonfileRequest.toVideoPath(),
  //     uploadJsonfileRequest.videoBuffer,
  //     uploadJsonfileRequest.gameId
  //   );
  //   response.status(HttpStatusCode.CREATED).json({ id: storedGameId });
  // }

  // @httpGet('/:gameId/links')
  // public async getGameLinks(
  //   request: Request,
  //   response: Response
  // ): Promise<void> {
  //   const getGameIconRequest = await new GetGameIconRequest(request).validate();
  //   const { gameId } = getGameIconRequest;
  //   const gameLinks = await this.providerService.getGameLinks(gameId);
  //   response.status(HttpStatusCode.OK).json({ links: gameLinks });
  // }
}
