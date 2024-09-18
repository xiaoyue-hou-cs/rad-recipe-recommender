import { useState } from "react"
import GoogleButton from 'react-google-button'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { auth } from "../firebase/Firebase"
import { useNavigate } from "react-router-dom"
import { createAccountOrLogin } from "../firebase/AuthRefHelper"
import '../styles/Login.css'

function Login() {
    const navigate = useNavigate();
    const [authenticating, setAuthenticating] = useState(false);

    const signInWithGoogle = () => {
        setAuthenticating(true);
        signInWithPopup(auth, new GoogleAuthProvider())
            .then(response => {
                createAccountOrLogin(response.user, response.user.uid);
                navigate('/');
            }).catch(e => {
                console.log(e);
                setAuthenticating(false);
            });
    }

    return (
        <div className="login-container">
            <div className="login-content">
                <div className="login-title">RAD RECIPE RECOMMENDER</div>
                <GoogleButton
                    onClick={() => signInWithGoogle()}
                    disabled={authenticating}
                    className="login-google-button"
                />
            </div>
        </div>
    );
}

export default Login;