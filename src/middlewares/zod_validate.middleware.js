import { Api_Error } from "../utils/Api_Error.js";


async function zod_validate(schema) {
    return async (req, res, next) => {
      try {
        const parseBody = await schema.parseAsync(req.body);
        req.body = parseBody; // Add the parsed body to the request object
        next(); // Move to the next middleware or route handler
      } catch (err) {
        // Pass validation errors to the error handling middleware
        next(new Api_Error(400, `ERROR: Schema Validation failed due to ${err.errors[0].message}`));
      }
    };
  }

export default zod_validate