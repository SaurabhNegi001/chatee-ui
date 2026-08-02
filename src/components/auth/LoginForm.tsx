import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";

import styles from "../../pages/auth/Register.module.css";
import { loginSchema, type LoginFormValues } from "../../schemas/authSchemas";
import { useAuth } from "../../hooks/useAuth";

const LoginForm = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { identifier: "", password: "" },
    });

    const onSubmit = async (values: LoginFormValues) => {
        try {
            await login(values);
            navigate("/home");
        } catch (err) {
            toast.error(typeof err === "string" ? err : "Invalid username/mobile or password");
        }
    };

    return (
        <div className="login-container">
            <h1 className={styles.logo}>Chatee</h1>

            <h2 className={styles.subtitle}>Log in to your account</h2>

            <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
                <div>
                    <input
                        className={styles.input}
                        type="text"
                        placeholder="Username or mobile number"
                        {...register("identifier")}
                    />
                    {errors.identifier && (
                        <p className={styles.error}>{errors.identifier.message}</p>
                    )}
                </div>

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
                    {isSubmitting ? "Logging in..." : "Log In"}
                </button>
            </form>

            <p className={styles.footer}>
                New to Chatee?{" "}
                <Link to="/register" className={styles.link}>
                    Create an account
                </Link>
            </p>
        </div>
    );
};

export default LoginForm;
