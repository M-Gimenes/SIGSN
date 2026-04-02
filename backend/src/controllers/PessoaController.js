class PessoaController {
  static async findAll(_req, res) {
    return res
      .status(501)
      .json({ mensagem: "Pessoa e classe abstrata; use Pesquisador, Coordenador ou Guia." });
  }

  static async findByPk(_req, res) {
    return res
      .status(501)
      .json({ mensagem: "Pessoa e classe abstrata; use Pesquisador, Coordenador ou Guia." });
  }

  static async create(_req, res) {
    return res
      .status(501)
      .json({ mensagem: "Pessoa e classe abstrata; use Pesquisador, Coordenador ou Guia." });
  }

  static async update(_req, res) {
    return res
      .status(501)
      .json({ mensagem: "Pessoa e classe abstrata; use Pesquisador, Coordenador ou Guia." });
  }

  static async delete(_req, res) {
    return res
      .status(501)
      .json({ mensagem: "Pessoa e classe abstrata; use Pesquisador, Coordenador ou Guia." });
  }
}

export { PessoaController };
