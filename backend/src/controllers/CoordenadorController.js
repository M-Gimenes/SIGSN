import { CoordenadorService } from "../services/CoordenadorService.js";

class CoordenadorController {
  static async findAll(req, res, next) {
    CoordenadorService.findAll()
      .then((objs) => res.json(objs))
      .catch(next);
  }

  static async findByPk(req, res, next) {
    CoordenadorService.findByPk(req)
      .then((obj) => res.json(obj))
      .catch(next);
  }

  static async create(req, res, next) {
    CoordenadorService.create(req)
      .then((obj) => res.json(obj))
      .catch(next);
  }

  static async update(req, res, next) {
    CoordenadorService.update(req)
      .then((obj) => res.json(obj))
      .catch(next);
  }

  static async delete(req, res, next) {
    CoordenadorService.delete(req)
      .then((obj) => res.json(obj))
      .catch(next);
  }
}

export { CoordenadorController };
