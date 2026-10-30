import {Fragment, ReactNode, useContext} from "react";
import {IWindow} from "../../../model/IWindow.ts";
import FloatingWindow from "./FloatingWindow.tsx";
import {DndContext, PointerSensor, useSensor, useSensors} from "@dnd-kit/core";
import {IWindowContext} from "../../../provider/WindowProvider.tsx";
import {WindowContext} from "../../../provider/WindowContext.tsx";
import {restrictToViewport} from "../../../utils/dnd.ts";

const FloatingWindows = (): ReactNode => {

    const {windows, handleDragEnd} = useContext<IWindowContext>(WindowContext)

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 2
            },
        })
    );

    return (<Fragment>
        <DndContext
            sensors={sensors}
            modifiers={[restrictToViewport]}
            onDragEnd={handleDragEnd}
        >
            <div style={{position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 1500}}>
                {
                    windows.map((window: IWindow) => (
                        <div key={window.id} style={{pointerEvents: 'auto'}}>
                            <FloatingWindow window={window}/>
                        </div>
                    ))}
            </div>
        </DndContext>
    </Fragment>);

}

export default FloatingWindows;