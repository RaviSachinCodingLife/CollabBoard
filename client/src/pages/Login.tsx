import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../app/hooks"; // custom typed hooks
import { setCredentials } from "../features/authSlice";
import API from "../services/api";

interface LoginResponse {
    user: {
        id: string;
        email: string;
        name?: string;
    };
    token: string;
}

function Login() {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const res = await API.post<LoginResponse>("/api/auth/login", {
                email,
                password,
            });
            localStorage.setItem("token", res.data.token);
            dispatch(setCredentials(res.data));
            navigate("/dashboard");
        } catch (err) {
            console.error(err);
            alert("Login failed");
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ padding: "20px" }}>
            <h2>Login</h2>
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEmail(e.target.value)
                }
            />
            <br />
            <br />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setPassword(e.target.value)
                }
            />
            <br />
            <br />
            <button type="submit">Login</button>
        </form>
    );
}

export default Login;
