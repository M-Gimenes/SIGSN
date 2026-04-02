import { AgendamentoService } from "../services/AgendamentoService.js";

class AgendamentoController {
  static async findAll(req, res, next) {
    AgendamentoService.findAll()
      .then((objs) => res.json(objs))
      .catch(next);
  }

  static async findByPk(req, res, next) {
    AgendamentoService.findByPk(req)
      .then((obj) => res.json(obj))
      .catch(next);
  }

  static async create(req, res, next) {
    AgendamentoService.create(req)
      .then((obj) => res.json(obj))
      .catch(next);
  }

  static async update(req, res, next) {
    AgendamentoService.update(req)
      .then((obj) => res.json(obj))
      .catch(next);
  }

  static async delete(req, res, next) {
    AgendamentoService.delete(req)
      .then((obj) => res.json(obj))
      .catch(next);
  }
}

export { AgendamentoController };
