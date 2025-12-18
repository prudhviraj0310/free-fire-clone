const validate = (schema) => (req, res, next) => {
    try {
        schema.parse(req.body);
        next();
    } catch (e) {
        return res.status(400).json({
            message: "Validation Error",
            errors: e.errors.map(err => ({ field: err.path[0], message: err.message }))
        });
    }
};

module.exports = validate;
