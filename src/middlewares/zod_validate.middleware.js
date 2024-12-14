import { Api_Error } from "../utils/Api_Error.js";

const zod_validate = (schema) => async (req, res, next) => {
  try {
    const parseBody = await schema.parseAsync(req.body);
    req.body = parseBody;
    next();
  } catch (err) {
    console.log(err.errors[0].message);
    next(new Api_Error(400,`ERROR: Validation Failed due to`,[err.errors[0].message]))
  }
};

export default zod_validate;
