import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";

import styles from "../../pages/auth/Register.module.css";
import { registerSchema, type RegisterFormValues } from "../../schemas/authSchemas";
import { userApi } from "../../api/userApi";
import { useAuth } from "../../hooks/useAuth";

const RegisterForm = () => {
    const navigate = useNavigate();
    const { register: registerAccount } = useAuth();

    const {
        register,
        handleSubmit,
        setError,
        clearErrors,
        formState: { errors, isSubmitting },
    } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        mode: "onBlur",
        defaultValues: {
            username: "",
            countryCode: "91",
            mobile: "",
            password: "",
        },
    });

    const onSubmit = async (values: RegisterFormValues) => {
        try {
            await registerAccount(values);
            toast.success("Account created! Please log in.");
            navigate("/login");
        } catch (err) {
            toast.error(typeof err === "string" ? err : "Something went wrong. Please try again.");
        }
    };

    return (
        <div className="register-container">
            <h1 className={styles.logo}>Chatee</h1>

            <h2 className={styles.subtitle}>Create your account</h2>

            <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
                <div>
                    <input
                        className={styles.input}
                        type="text"
                        placeholder="Username"
                        {...register("username", {
                            onChange: () => clearErrors("username"),
                            onBlur: async (e: React.FocusEvent<HTMLInputElement>) => {
                                const value = e.target.value.trim();
                                if (!registerSchema.shape.username.safeParse(value).success) return;

                                const available = await userApi.checkUsernameAvailability(value);
                                if (!available) {
                                    setError("username", {
                                        type: "manual",
                                        message: "Username is already taken",
                                    });
                                }
                            },
                        })}
                    />
                    {errors.username && <p className={styles.error}>{errors.username.message}</p>}
                </div>

                <div className={styles.mobileContainer}>
                    <input className={styles.countryCode} type="text" value="+91" readOnly />

                    <input
                        className={styles.mobile}
                        type="text"
                        placeholder="Mobile Number"
                        maxLength={10}
                        {...register("mobile", {
                            onChange: () => clearErrors("mobile"),
                            onBlur: async (e: React.FocusEvent<HTMLInputElement>) => {
                                const value = e.target.value.trim();
                                if (!registerSchema.shape.mobile.safeParse(value).success) return;

                                const available = await userApi.checkMobileAvailability(
                                    Number(value),
                                    91,
                                );
                                if (!available) {
                                    setError("mobile", {
                                        type: "manual",
                                        message: "Mobile number is already registered",
                                    });
                                }
                            },
                        })}
                    />
                </div>
                {errors.mobile && <p className={styles.error}>{errors.mobile.message}</p>}

                <input type="hidden" {...register("countryCode")} />

                <div>
                    <input
                        className={styles.input}
                        type="password"
                        placeholder="Password"
                        {...register("password")}
                    />
                    {errors.password && <p className={styles.error}>{errors.password.message}</p>}
                </div>

                <button className={styles.button} type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Creating account..." : "Sign Up"}
                </button>
            </form>

            <p className={styles.footer}>
                Already a user?{" "}
                <Link to="/login" className={styles.link}>
                    Login
                </Link>
            </p>
        </div>
    );
};

export default RegisterForm;
