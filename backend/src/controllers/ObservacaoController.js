import { ObservacaoService } from "../services/ObservacaoService.js";

class ObservacaoController {
  static async findAll(req, res, next) {
    ObservacaoService.findAll()
      .then((objs) => res.json(objs))
      .catch(next);
  }

  static async findByPk(req, res, next) {
    ObservacaoService.findByPk(req)
      .then((obj) => res.json(obj))
      .catch(next);
  }

  static async create(req, res, next) {
    ObservacaoService.create(req)
      .then((obj) =>
        res.status(201).json({
          mensagem: `Observação criada com versão ${obj.versaoObservacao} (atribuída automaticamente).`,
          observacao: obj,
        })
      )
      .catch(next);
  }

  static async update(req, res, next) {
    ObservacaoService.update(req)
      .then((obj) => res.json(obj))
      .catch(next);
  }

  static async delete(req, res, next) {
    ObservacaoService.delete(req)
      .then((obj) => res.json(obj))
      .catch(next);
  }
}

export { ObservacaoController };
