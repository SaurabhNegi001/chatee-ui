import LoginForm from "../../components/auth/LoginForm";
import styles from "./Register.module.css";

const Login = () => {
    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <LoginForm />
            </div>
        </div>
    );
};

export default Login;
