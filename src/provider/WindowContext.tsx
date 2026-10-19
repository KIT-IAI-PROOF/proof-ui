import {Context, createContext} from "react";
import {IWindowContext} from "./WindowProvider.tsx";

export const WindowContext: Context<IWindowContext> = createContext({} as IWindowContext);