import {ReactNode, useCallback, useState} from "react";
import {Provider} from "../types/provider.ts";
import {DragEndEvent} from "@dnd-kit/core";
import {IWindow} from "../model/IWindow.ts";
import {WindowContext} from "./WindowContext.tsx";

interface IProps {
    children: ReactNode;
}

export interface IWindowContext {
    handleDragEnd: (event: DragEndEvent) => void;
    handleOpenWindow: (id: string, queue: string, type: "log" | "connection") => void;
    handleCloseWindow: (id: string) => void;
    handleFocusWindow: (id: string) => void;
    windows: IWindow[];
}


const WindowProvider: Provider<IProps> = ({children}: IProps): ReactNode => {

    const [windows, setWindows] = useState<IWindow[]>([]);
    const [highestZIndex, setHighestZIndex] = useState(1000);

    const handleFocusWindow = useCallback((id: string) => {
        setHighestZIndex((prevZ) => {
            const newZ = prevZ + 1;
            setWindows((prev) =>
                prev.map((window: IWindow) => (window.id === id ? {...window, zIndex: newZ} : window))
            );
            return newZ;
        });
    }, []);

    const handleOpenWindow = useCallback((id: string, queue: string, type: "log" | "connection") => {
        if (windows.some((window: IWindow) => window.id === id)) {
            handleFocusWindow(id);
            return;
        }
        const zIndex: number = highestZIndex + 1;
        setHighestZIndex(zIndex);
        const initialOffset: number = windows.length * 30;
        const newWindow: IWindow = {
            id: id,
            queue: queue,
            zIndex: zIndex,
            type: type,
            x: 100 + initialOffset,
            y: 100 + initialOffset
        };
        setWindows((prev) => [...prev, newWindow]);
    }, [handleFocusWindow, highestZIndex, windows]);

    const handleCloseWindow = useCallback((id: string) => {
        setWindows((prev: any[]) => prev.filter((window: IWindow) => window.id !== id));
    }, [])

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const {active, delta} = event;
        if (!delta.x && !delta.y) return;
        setWindows((prevWindows: IWindow[]) =>
            prevWindows.map((win) => {
                if (win.id === active.id) {
                    return {
                        ...win,
                        x: win.x + delta.x,
                        y: win.y + delta.y,
                    };
                }
                return win;
            })
        );
    }, []);

    return (
        <WindowContext.Provider
            value={{
                windows: windows,
                handleCloseWindow: handleCloseWindow,
                handleDragEnd: handleDragEnd,
                handleOpenWindow: handleOpenWindow,
                handleFocusWindow: handleFocusWindow
            }}
        >
            {children}
        </WindowContext.Provider>
    );

};

export default WindowProvider;