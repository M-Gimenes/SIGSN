// Erros de conexão / disponibilidade do banco viram 503; demais erros do Sequelize, 400.
const ERROS_CONEXAO_DB = new Set([
    'SequelizeConnectionError',
    'SequelizeConnectionRefusedError',
    'SequelizeAccessDeniedError',
    'SequelizeHostNotFoundError',
    'SequelizeHostNotReachableError',
    'SequelizeInvalidConnectionError',
    'SequelizeConnectionTimedOutError',
    'SequelizeConnectionAcquireTimeoutError',
]);

function errorHandler(err, req, res, next) {
    if (err.name === 'ValidationError') {
        return res.status(400).json({ erros: err.erros });
    }

    if (err.name === 'SequelizeValidationError') {
        return res.status(400).json({ erros: err.errors.map(e => e.message) });
    }

    if (err.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(400).json({ erros: ['Pelo menos um dos registros associados não existe.'] });
    }

    if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ erros: ['Não podem existir dois registros com a mesma chave.'] });
    }

    if (ERROS_CONEXAO_DB.has(err.name)) {
        console.error(`[db] ${err.name}: ${err.message}`);
        return res.status(503).json({
            erros: ['Banco de dados indisponível. Tente novamente em alguns instantes.'],
        });
    }

    if (err.name === 'SequelizeDatabaseError') {
        console.error(`[db] ${err.name}: ${err.message}`);
        return res.status(500).json({ erros: ['Erro ao executar a consulta no banco de dados.'] });
    }

    console.error(`[err] ${err.name}: ${err.message}`);
    return res.status(500).json({ erros: [err.message] });
}

export default errorHandler;
