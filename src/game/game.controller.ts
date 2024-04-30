// @Controller('game')
// export class GameController {
//   constructor(private readonly gameService: GameService) {}
//   @UseGuards(AuthGuard)
//   @Post('create')
//   async createGame(@Req() req: any, @Res() res: Response) {
//     const userId = req.user;
//     return await this.gameService.createGame(userId, res);
//   }
// }
