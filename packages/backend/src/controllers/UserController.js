export class UserController {
  constructor({ userService }) {
    if (!userService) {
      throw new Error('A dependencia de usuarios e obrigatoria.');
    }

    this.userService = userService;
  }

  async register(request, response, next) {
    try {
      const result = await this.userService.register(request.body ?? {});
      response.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async login(request, response, next) {
    try {
      const result = await this.userService.login(request.body ?? {});
      response.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}
