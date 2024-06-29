import React, { useEffect } from 'react';

interface Props {
    message: string;
    type: 'success' | 'danger';
    autoClose?: boolean;
    duration?: number;
    onClose: () => void;
}

const Toast = (props: Props) => {
    const { message, type, autoClose = true, duration = 3000, onClose } = props
    useEffect(() => {
        if (autoClose) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [autoClose, duration, onClose]);

    const toastClassName = `fixed flex items-center w-full max-w-xs p-4 space-x-4 text-gray-500 bg-white divide-x rtl:divide-x-reverse divide-gray-200 rounded-lg shadow top-5 right-5 dark:text-gray-400 dark:divide-gray-700 space-x dark:bg-gray-800`;

    const iconClass = type === 'success' ? 'text-green-500 bg-green-100 dark:bg-green-800 dark:text-green-200' : 'text-red-500 bg-red-100 dark:bg-red-800 dark:text-red-200';
    const iconSvg = type === 'success' ? (
        <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
        </svg>
    ) : (
        <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 11.793a1 1 0 1 1-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 0 1-1.414-1.414L8.586 10 6.293 7.707a1 1 0 0 1 1.414-1.414L10 8.586l2.293-2.293a1 1 0 0 1 1.414 1.414L11.414 10l2.293 2.293Z" />
        </svg>
    );

    return (
        <div id="toast-top-right" className={toastClassName} role="alert">
            <div className={`inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg ${iconClass}`}>
                {iconSvg}
                <span className="sr-only">{type === 'success' ? 'Check icon' : 'Error icon'}</span>
            </div>
            <div className="text-sm font-normal">{message}</div>
        </div>
    );
};

export default Toast;
