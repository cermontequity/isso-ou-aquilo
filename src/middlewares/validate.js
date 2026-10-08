// Valida e substitui o req.body pelo dado já limpo pelo Zod
export const validate = (schema) => (req, res, next) => {
  req.body = schema.parse(req.body);
  next();
};
