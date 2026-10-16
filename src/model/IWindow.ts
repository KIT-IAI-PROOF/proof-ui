export interface IWindow {
    id: string;
    queue: string;
    type: "log" | "connection";
    x: number;
    y: number;
    zIndex?: number;
}