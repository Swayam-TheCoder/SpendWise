import { signupSchema } from "../validators/auth.validator.js";
import { signup } from "../services/auth.service.js";

export const signupController = async (req, res) => {
  try {
    const data = signupSchema.parse(req.body);

    const user = await signup(data);

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: {
        user,
      },
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.issues,
      });
    }

    if (error.message === "Email is already registered") {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};