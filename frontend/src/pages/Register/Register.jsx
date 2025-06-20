import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../../services/user';
import './Register.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowAltCircleLeft } from '@fortawesome/free-solid-svg-icons';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setMessage('As senhas não coincidem.');
            setMessageType('error');
            return;
        }

        try {
            await register({ name, email, password });
            setMessage('Cadastro realizado com sucesso!');
            setMessageType('success');
            setTimeout(() => navigate('/login'), 1500);
        } catch (error) {
            setMessage('Falha no cadastro: ' + (error.response?.data?.message || error.message));
            setMessageType('error');
        }
    };

    return (
        <div className='register'>
            <div className='register-container'>

                <div className='register-back-button-container'>
                    <FontAwesomeIcon
                        icon={faArrowAltCircleLeft}
                        className='icon'
                        onClick={() => navigate(-1)}
                        aria-label='Voltar'
                    />
                </div>

                <h2>Registrar</h2>

                {message && (
                    <div className={`register-message ${messageType === 'success' ? 'success' : 'error'}`}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className='register-container-input'>
                        <label>Nome:</label>
                        <input
                            type='text'
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className='register-container-input'>
                        <label>Email:</label>
                        <input
                            type='email'
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className='register-container-input'>
                        <label>Senha:</label>
                        <input
                            type='password'
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className='register-container-input'>
                        <label>Confirmar Senha:</label>
                        <input
                            type='password'
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button className='register-btn' type='submit'>
                        Registrar
                    </button>
                </form>

                <div className='register-link' >
                    <Link to='/login'>Já tem uma conta? Faça login</Link>
                </div>

            </div>
        </div>
    );
}
