import { useEffect, useState } from "react"
import { auth } from "./Firebase"
import { useNavigate } from "react-router-dom"
import { onAuthStateChanged } from "firebase/auth"

export interface AuthRouteProps {
    page : React.ReactElement
};

function AuthRoute ({ page } : AuthRouteProps) {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const authCheck = onAuthStateChanged(auth, (user) => {
            // If a user exists and has been authorized, we do not need to await a user.
            if (user) {
                setLoading(false)
            // If there is no user, access is unauthorized and the user is sent back to the home page.
            } else {
                console.log("Unauthorized access!")
                navigate("/login")
            }
        })
        
        return () => authCheck()}
    , [navigate])

    if (loading) return <p> Loading... </p>

    return (page)
}

export default AuthRoute