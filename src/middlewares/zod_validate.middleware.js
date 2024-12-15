import { Api_Error } from "../utils/Api_Error.js";

const zod_validate = (schema) => async (req, _, next) => {
  try {
    const parseBody = await schema.parseAsync(req.body);
    req.body = parseBody;
    next();
  } catch (err) {
    next(new Api_Error(400,`ERROR: Validation Failed due to`,[err.errors[0].message]))
  }
};

export default zod_validate;
