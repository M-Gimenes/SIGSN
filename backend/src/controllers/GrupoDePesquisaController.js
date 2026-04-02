import { GrupoDePesquisaService } from "../services/GrupoDePesquisaService.js";

class GrupoDePesquisaController {
  static async findAll(req, res, next) {
    GrupoDePesquisaService.findAll()
      .then((objs) => res.json(objs))
      .catch(next);
  }

  static async findByPk(req, res, next) {
    GrupoDePesquisaService.findByPk(req)
      .then((obj) => res.json(obj))
      .catch(next);
  }

  static async create(req, res, next) {
    GrupoDePesquisaService.create(req)
      .then((obj) => res.json(obj))
      .catch(next);
  }

  static async update(req, res, next) {
    GrupoDePesquisaService.update(req)
      .then((obj) => res.json(obj))
      .catch(next);
  }

  static async delete(req, res, next) {
    GrupoDePesquisaService.delete(req)
      .then((obj) => res.json(obj))
      .catch(next);
  }
}

export { GrupoDePesquisaController };
