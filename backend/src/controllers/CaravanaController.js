import { CaravanaService } from "../services/CaravanaService.js";

class CaravanaController {
  static async findAll(req, res, next) {
    CaravanaService.findAll()
      .then((objs) => res.json(objs))
      .catch(next);
  }

  static async findByPk(req, res, next) {
    CaravanaService.findByPk(req)
      .then((obj) => res.json(obj))
      .catch(next);
  }

  static async create(req, res, next) {
    CaravanaService.create(req)
      .then((obj) => res.json(obj))
      .catch(next);
  }

  static async update(req, res, next) {
    CaravanaService.update(req)
      .then((obj) => res.json(obj))
      .catch(next);
  }

  static async delete(req, res, next) {
    CaravanaService.delete(req)
      .then((obj) => res.json(obj))
      .catch(next);
  }
}

export { CaravanaController };
