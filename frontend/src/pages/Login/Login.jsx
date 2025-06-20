import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { login } from '../../services/user';
import './Login.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowAltCircleLeft
} from '@fortawesome/free-solid-svg-icons';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (location.state?.message) {
            setMessage(location.state.message);
            setMessageType('error');
        }
    }, [location]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await login({ email, password });


            localStorage.setItem('token', response.data.access_token);

            setTimeout(() => navigate('/'), 1000);
        } catch (error) {
            setMessage('Falha no login: ' + (error.response?.data?.message || error.message));
            setMessageType('error');
        }
    };

    return (
        <div className='login'>
            <div className='login-container'>
                <div className='login-back-button-container'>

                    <FontAwesomeIcon icon={faArrowAltCircleLeft} className='icon' onClick={() => navigate(-1)} />

                </div>
                <h2>Login</h2>

                {message && (
                    <div
                        className={`login-message ${messageType === 'success' ? 'success' : 'error'}`}
                    >
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className='login-container-input'>
                        <label>Email:</label><br />
                        <input
                            type='email'
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className='login-container-input'>
                        <label>Senha:</label><br />
                        <input
                            type='password'
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button className='login-btn' type='submit'>Entrar</button>
                </form>

                <div className='login-link'>
                    <Link to='/register'>Criar uma conta</Link>
                </div>
            </div>
        </div>
    );
}
