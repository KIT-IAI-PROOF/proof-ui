import {useEffect, useRef, useState} from 'react';

interface UseNotificationParams {
    showMessage: boolean;
    duration?: number;
}

const useNotification = ({showMessage, duration = 2000}: UseNotificationParams) => {
    const [visible, setVisible] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }

        if (showMessage) {
            setVisible(true);
            timeoutRef.current = setTimeout(() => setVisible(false), duration);
        } else {
            setVisible(false);
        }

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [showMessage, duration]);

    return {visible};
}

export {useNotification};