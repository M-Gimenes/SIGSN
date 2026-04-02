import { GuiaService } from "../services/GuiaService.js";

class GuiaController {
  static async findAll(req, res, next) {
    GuiaService.findAll()
      .then((objs) => res.json(objs))
      .catch(next);
  }

  static async findByPk(req, res, next) {
    GuiaService.findByPk(req)
      .then((obj) => res.json(obj))
      .catch(next);
  }

  static async create(req, res, next) {
    GuiaService.create(req)
      .then((obj) => res.json(obj))
      .catch(next);
  }

  static async update(req, res, next) {
    GuiaService.update(req)
      .then((obj) => res.json(obj))
      .catch(next);
  }

  static async delete(req, res, next) {
    GuiaService.delete(req)
      .then((obj) => res.json(obj))
      .catch(next);
  }
}

export { GuiaController };
