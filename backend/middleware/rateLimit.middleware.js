import rateLimit from "express-rate-limit";

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes

  limit: 50, // maximum of 10 requests per 15 minutes

  standardHeaders: "draft-8",

  legacyHeaders: false,

  message: {
    success: false,
    message: "Too many authentication attempts. Try again later.",
  },
});