const { z } = require('zod');

const registerSchema = z.object({
    phone: z.string().min(10).max(15).regex(/^\+?[0-9]+$/, "Invalid phone format"),
    username: z.string().min(3).max(20),
    email: z.string().email(),
    password: z.string().min(6).optional(), // Optional for Google Auth
});

const loginSchema = z.object({
    phone: z.string().min(10),
    password: z.string().optional(),
    otp: z.string().length(6).optional(),
}).refine(data => data.password || data.otp, {
    message: "Either password or OTP is required",
});

const depositSchema = z.object({
    amount: z.number().positive().min(10, "Minimum deposit 10"),
});

module.exports = { registerSchema, loginSchema, depositSchema };
