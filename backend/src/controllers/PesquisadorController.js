import { PesquisadorService } from "../services/PesquisadorService.js";

class PesquisadorController {
  static async findAll(req, res, next) {
    PesquisadorService.findAll()
      .then((objs) => res.json(objs))
      .catch(next);
  }

  static async findByPk(req, res, next) {
    PesquisadorService.findByPk(req)
      .then((obj) => res.json(obj))
      .catch(next);
  }

  static async create(req, res, next) {
    PesquisadorService.create(req)
      .then((obj) => res.json(obj))
      .catch(next);
  }

  static async update(req, res, next) {
    PesquisadorService.update(req)
      .then((obj) => res.json(obj))
      .catch(next);
  }

  static async delete(req, res, next) {
    PesquisadorService.delete(req)
      .then((obj) => res.json(obj))
      .catch(next);
  }
}

export { PesquisadorController };
