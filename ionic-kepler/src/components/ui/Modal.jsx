import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import './Modal.css';

const Modal = ({ isOpen, onClose, title, children }) => {
    const [render, setRender] = useState(isOpen);

    useEffect(() => {
        if (isOpen) setRender(true);
    }, [isOpen]);

    const onAnimationEnd = () => {
        if (!isOpen) setRender(false);
    };

    if (!render) return null;

    return (
        <div
            className={`modal-overlay ${isOpen ? 'open' : 'closing'}`}
            onAnimationEnd={onAnimationEnd}
            onClick={onClose}
        >
            <div
                className={`modal-content glass-panel ${isOpen ? 'open' : 'closing'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    <h2>{title}</h2>
                    <button className="modal-close" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>
                <div className="modal-body">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
