import { ProjetoService } from "../services/ProjetoService.js";

class ProjetoController {
  static async findAll(req, res, next) {
    ProjetoService.findAll()
      .then((objs) => res.json(objs))
      .catch(next);
  }

  static async findByPk(req, res, next) {
    ProjetoService.findByPk(req)
      .then((obj) => res.json(obj))
      .catch(next);
  }

  static async create(req, res, next) {
    ProjetoService.create(req)
      .then((obj) => res.json(obj))
      .catch(next);
  }

  static async update(req, res, next) {
    ProjetoService.update(req)
      .then((obj) => res.json(obj))
      .catch(next);
  }

  static async delete(req, res, next) {
    ProjetoService.delete(req)
      .then((obj) => res.json(obj))
      .catch(next);
  }
}

export { ProjetoController };
