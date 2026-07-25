import { createContext, useCallback, useContext, useMemo } from "react";
import { toast as rToast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ToastContext = createContext(null);

const ToastNotification = () => (
    <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        closeButton
        draggable
        pauseOnHover
        limit={4}
    />
);

export const ToastProvider = ({ children }) => {
    const show = useCallback((options = {}) => rToast(options), []);

    const success = useCallback(
        (message, options = {}) => rToast.success(message, options),
        []
    );
    const error = useCallback(
        (message, options = {}) => rToast.error(message, options),
        []
    );
    const warning = useCallback(
        (message, options = {}) => rToast.warning(message, options),
        []
    );
    const info = useCallback(
        (message, options = {}) => rToast.info(message, options),
        []
    );

    const dismiss = useCallback((toastId) => {
        if (toastId) {
            rToast.dismiss(toastId);
        } else {
            rToast.dismiss();
        }
    }, []);

    const value = useMemo(
        () => ({ show, success, error, warning, info, dismiss }),
        [show, success, error, warning, info, dismiss]
    );

    return (
        <ToastContext.Provider value={value}>
            {children}
            <ToastNotification />
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used inside ToastProvider");
    }
    return context;
};

export default ToastNotification;
