import RegisterForm from "../../components/auth/RegisterForm";
import styles from "./Register.module.css";

const Register = () => {

    return(

        <div className={styles.container}>

            <div className={styles.card}>

                <RegisterForm/>

            </div>

        </div>

    );

}

export default Register;