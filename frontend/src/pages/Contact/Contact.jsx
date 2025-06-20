import React from 'react';
import Header from '../../components/Header/Header';
import './Contact.css';
import { useTranslation } from 'react-i18next';

const Contact = () => {
    const { t } = useTranslation();

    return (
        <div className='contact'>
            <Header />
            <main className='contact-container'>
                <h2>{t('Fale Conosco')}</h2>
                <p>{t('Tem alguma dúvida, sugestão ou precisa de suporte? Preencha o formulário abaixo e entraremos em contato com você.')}</p>

                <form className='contact-form'>
                    <label>
                        {t('Nome')}
                        <input type='text' placeholder={t('Digite seu nome')} required />
                    </label>

                    <label>
                        {t('Email')}
                        <input type='email' placeholder={t('Digite seu e-mail')} required />
                    </label>

                    <label>
                        {t('Mensagem')}
                        <textarea placeholder={t('Digite sua mensagem')} rows='5' required />
                    </label>

                    <button type='submit'>{t('Enviar')}</button>
                </form>
            </main>
        </div>
    );
};

export default Contact;
