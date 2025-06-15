import { ToastContainer, toast, ToastOptions } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const defaultOptions: ToastOptions = {
    position: "bottom-left",
    theme: "colored",
    autoClose: 3000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnFocusLoss: true,
    draggable: true,
    pauseOnHover: true,
};

export const notify = {
    success: (message: string, options?: ToastOptions) => toast.success(message, { ...defaultOptions, ...options }),
    error: (message: string, options?: ToastOptions) => toast.error(message, { ...defaultOptions, ...options }),
    info: (message: string, options?: ToastOptions) => toast.info(message, { ...defaultOptions, ...options }),
    warning: (message: string, options?: ToastOptions) => toast.warning(message, { ...defaultOptions, ...options }),
};

const ToastNotify = () => {
    return <ToastContainer {...defaultOptions} />;
};

export default ToastNotify;
