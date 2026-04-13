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

    return res.status(500).json({ erros: [err.message] });
}

export default errorHandler;