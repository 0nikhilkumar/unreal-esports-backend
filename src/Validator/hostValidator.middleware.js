import { z } from "zod";

// creating an object schema

export const hostSignupSchema = z.object({
  username: z
    .string({ required_error: "username is required" })
    .trim()
    .min(3, { message: "Name must be at least of 3 characters" })
    .max(255, { message: "Name must not be more than 255 characters" }),

  preferredName: z
    .string({ required_error: "username is required" })
    .trim()
    .min(3, { message: "Name must be at least of 3 characters" })
    .max(255, { message: "Name must not be more than 255 characters" }),

  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .toLowerCase()
    .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
      message: "Invalid email format",
    }),
  password: z
    .string({ required_error: "Password is required" })
    .trim()
    .min(8, { message: "Password must be at least of 8 Characters" })
    .max(16, { message: "Password can't be more than 16 Characters" })
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/,
      {
        message:
          "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character",
      }
    ),

});

export const hostLoginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .toLowerCase()
    .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
      message: "Invalid email format",
    }),
    
  password: z
    .string({ required_error: "Password is required" })
    .trim()
    .min(8, { message: "Password must be at least of 8 Characters" })
    .max(16, { message: "Password can't be more than 16 Characters" })
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/,
      {
        message:
          "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character",
      }
    ),
});
