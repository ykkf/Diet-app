import React, { forwardRef } from 'react';
import './Input.css';

const Input = forwardRef(({ label, id, type = 'text', error, className = '', ...props }, ref) => {
    return (
        <div className={`input-group ${className}`}>
            {label && <label htmlFor={id} className="input-label">{label}</label>}
            <input
                id={id}
                ref={ref}
                type={type}
                className={`input-field ${error ? 'input-error' : ''}`}
                {...props}
            />
            {error && <span className="error-text">{error}</span>}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
