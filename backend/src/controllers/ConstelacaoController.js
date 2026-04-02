import { ConstelacaoService } from "../services/ConstelacaoService.js";

class ConstelacaoController {
  static async findAll(req, res, next) {
    ConstelacaoService.findAll()
      .then((objs) => res.json(objs))
      .catch(next);
  }

  static async findByPk(req, res, next) {
    ConstelacaoService.findByPk(req)
      .then((obj) => res.json(obj))
      .catch(next);
  }

  static async create(req, res, next) {
    ConstelacaoService.create(req)
      .then((obj) => res.json(obj))
      .catch(next);
  }

  static async update(req, res, next) {
    ConstelacaoService.update(req)
      .then((obj) => res.json(obj))
      .catch(next);
  }

  static async delete(req, res, next) {
    ConstelacaoService.delete(req)
      .then((obj) => res.json(obj))
      .catch(next);
  }
}

export { ConstelacaoController };
