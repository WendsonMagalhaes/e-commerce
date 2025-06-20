import React, { useRef } from 'react';
import './ModalMessage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCheckCircle, faExclamationTriangle, faCircleXmark } from '@fortawesome/free-solid-svg-icons';

const icons = {
    success: faCheckCircle,
    warning: faExclamationTriangle,
    error: faCircleXmark,
};

const colors = {
    success: 'var(--success-color, #72b182)',
    warning: 'var(--warning-color, #d1b85d)',
    error: 'var(--error-color,   #d46a6a)',
};


const ModalMessage = ({ title, message, onClose, type = 'success' }) => {
    const modalRef = useRef(null);

    const handleOverlayClick = (e) => {
        if (modalRef.current && !modalRef.current.contains(e.target)) {
            onClose();
        }
    };

    const icon = icons[type] || icons.success;
    const iconColor = colors[type] || colors.success;

    return (
        <div className='modal-overlay' onClick={handleOverlayClick}>
            <div className='modal-box' ref={modalRef}>
                <button className='modal-close-icon' onClick={onClose}>
                    <FontAwesomeIcon icon={faTimes} />
                </button>

                <div className='modal-icon-container' style={{ color: iconColor }}>
                    <FontAwesomeIcon icon={icon} className='modal-icon' />
                </div>

                <h3 style={{ color: iconColor }}>{title}</h3>
                <p style={{ color: iconColor }}>{message}</p>
            </div>
        </div>
    );
};

export default ModalMessage;
