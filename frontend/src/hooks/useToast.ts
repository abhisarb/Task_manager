import toast from 'react-hot-toast';

// Custom styled toast notifications
export const useToast = () => {
    const success = (message: string) => {
        toast.success(message, {
            duration: 3000,
            position: 'top-right',
            style: {
                background: '#10b981',
                color: '#fff',
                padding: '16px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
            },
            icon: '✓',
        });
    };

    const error = (message: string) => {
        toast.error(message, {
            duration: 4000,
            position: 'top-right',
            style: {
                background: '#ef4444',
                color: '#fff',
                padding: '16px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
            },
            icon: '✕',
        });
    };

    const loading = (message: string) => {
        return toast.loading(message, {
            position: 'top-right',
            style: {
                background: '#3b82f6',
                color: '#fff',
                padding: '16px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
            },
        });
    };

    const dismiss = (toastId: string) => {
        toast.dismiss(toastId);
    };

    return { success, error, loading, dismiss };
};

export default useToast;
