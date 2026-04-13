/**
 * Erro de validação de regras de negócio.
 * Lançado pelos services quando uma ou mais regras são violadas.
 * O errorHandler o trata como HTTP 400 e devolve o array de mensagens.
 */
class ValidationError extends Error {
  constructor(erros) {
    const lista = Array.isArray(erros) ? erros : [erros];
    super(lista.join(' | '));
    this.name = 'ValidationError';
    this.erros = lista;
  }
}

export { ValidationError };
