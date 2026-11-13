export interface IWindow {
    id: string;
    queue: string;
    type: "log" | "connection" | "handle";
    x: number;
    y: number;
    zIndex?: number;
}