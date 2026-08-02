import { z } from "zod";

const PASSWORD_REGEX =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#^()_+\-=[\]{};':\\|,.<>/?]).{8,}$/;

export const registerSchema = z.object({
    username: z
        .string()
        .min(1, "Username is required")
        .max(30, "Username is too long"),
    countryCode: z.string().regex(/^\d{2}$/, "Enter a valid country code"),
    mobile: z.string().regex(/^\d{10}$/, "Enter a valid 10-digit mobile number"),
    password: z
        .string()
        .regex(
            PASSWORD_REGEX,
            "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number and a special character.",
        ),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
    identifier: z.string().min(1, "Username or mobile number is required"),
    password: z.string().min(1, "Password is required"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
