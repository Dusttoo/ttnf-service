import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../store/authSlice';
import Input from '../common/Input';
import Button from '../common/Button';
import { AppDispatch, RootState } from '../../store';
import { selectAuthError } from '../../store/authSlice';
import { useNavigate } from 'react-router-dom';
import { selectIsLoading } from '../../store/loadingSlice';

const Login: React.FC = () => {
    const dispatch: AppDispatch = useDispatch();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const isLoading = useSelector(selectIsLoading); // Use the centralized loading selector
    const error = useSelector(selectAuthError);

    const handleLogin = async () => {
        try {
            await dispatch(login({ username, password })).unwrap();
            navigate('/admin/dashboard');
        } catch (err) {
            console.error('Login failed:', (err as Error).message);
        }
    };

    return (
        <div>
            <h1>Login</h1>
            <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
            />
            <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
            />
            <Button
                $variant="primary"
                onClick={handleLogin}
                disabled={isLoading}
            >
                {isLoading ? 'Logging in...' : 'Login'}
            </Button>
            {error && <div>Error: {error}</div>}
        </div>
    );
};

export default Login;