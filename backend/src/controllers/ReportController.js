import { ReportService } from '../services/ReportService.js';

class ReportController {
  static async agendamentos(req, res, next) {
    ReportService.agendamentos(req).then((obj) => res.json(obj)).catch(next);
  }

  static async visitantesPorMes(req, res, next) {
    ReportService.visitantesPorMes(req).then((obj) => res.json(obj)).catch(next);
  }

  static async projetos(req, res, next) {
    ReportService.projetos(req).then((obj) => res.json(obj)).catch(next);
  }

  static async pesquisadoresPorProjeto(req, res, next) {
    ReportService.pesquisadoresPorProjeto(req).then((obj) => res.json(obj)).catch(next);
  }

  static async observacoes(req, res, next) {
    ReportService.observacoes(req).then((obj) => res.json(obj)).catch(next);
  }

  static async estatisticasObservacoes(req, res, next) {
    ReportService.estatisticasObservacoes(req).then((obj) => res.json(obj)).catch(next);
  }
}

export { ReportController };
