import {Fragment, ReactNode, useContext, useEffect, useMemo, useState} from "react";
import {BaseEdge, type EdgeProps, type XYPosition} from "@xyflow/react";
import {TEdge} from "../../../model/TEdge.ts";
import {getPath} from "../../../utils/layout/utils.ts";
import {getTypeColor} from "../../../utils/palette.ts";
import {EAlgorithm} from "../../../model/EAlgorithm.ts";
import {IAppContext} from "../../../provider/AppProvider.tsx";
import {AppContext} from "../../../provider/AppContext.tsx";
import {IMonitoringContext} from "../../../provider/MonitoringProvider.tsx";
import {MonitoringContext} from "../../../provider/MonitoringContext.tsx";
import {IValueUpdate} from "../../../model/IValueUpdate.ts";
import {IWindowContext} from "../../../provider/WindowProvider.tsx";
import {WindowContext} from "../../../provider/WindowContext.tsx";

export const BlockEdge = ({
                              id,
                              source,
                              sourceX,
                              sourceY,
                              sourcePosition,
                              target,
                              targetX,
                              targetY,
                              targetPosition,
                              markerEnd,
                              markerStart,
                              style,
                              data = {
                                  points: [],
                                  algorithm: EAlgorithm.BezierCatmullRom
                              }
                          }: EdgeProps<TEdge>): ReactNode => {

    const {palette} = useContext<IAppContext>(AppContext);
    const {connectionStates, edges} = useContext<IMonitoringContext>(MonitoringContext);
    const {handleOpenWindow} = useContext<IWindowContext>(WindowContext);

    const [isPulsing, setIsPulsing] = useState(false);

    const selfNode = source === target;
    const sourceOrigin = {x: sourceX, y: sourceY} as XYPosition;
    const targetOrigin = {x: targetX, y: targetY} as XYPosition;
    const pathPoints = [sourceOrigin, ...data.points, targetOrigin];

    const path = getPath(pathPoints, EAlgorithm.BezierCatmullRom, {
        fromSide: sourcePosition,
        toSide: targetPosition,
    }, selfNode);

    const edge: TEdge | undefined = useMemo(() => edges.find((e: TEdge): boolean => e.id === data.id), [data.id, edges]);

    const edgeConnectionState = useMemo(() => {
            if (edge) return connectionStates
                .filter((connectionState: IValueUpdate): boolean => connectionState.valueId === edge.data?.input || connectionState.valueId === edge.data?.output)
                .filter((connectionState: IValueUpdate): boolean => connectionState.status === "OUTPUT" || connectionState.status === "RECEIVED")
        },
        [connectionStates, edge]
    );

    useEffect(() => {
        if (!edgeConnectionState) return;
        setIsPulsing(true);
        const timeout = window.setTimeout(() => setIsPulsing(false), 500);
        return () => window.clearTimeout(timeout);
    }, [edgeConnectionState]);

    return (
        <Fragment>
            <BaseEdge
                id={id}
                path={path}
                markerStart={markerStart}
                markerEnd={markerEnd}
                style={{
                    ...style,
                    strokeWidth: 1.5,
                    stroke: getTypeColor(data?.connectionType, palette)
                }}
            />
            <path
                className={"react-flow__edge-interaction nodrag nopan"}
                d={path}
                fill={"none"}
                stroke={getTypeColor(data?.connectionType, palette)}
                strokeOpacity={0}
                strokeWidth={24}
                pointerEvents={"stroke"}
                onClick={() => {
                    const id: string | undefined = data?.id;
                    if (id) handleOpenWindow(id, "connection", "connection");
                }}
                style={{
                    cursor: "pointer"
                }}
            />
            {
                isPulsing && <circle r="3" fill={getTypeColor(data?.connectionType, palette)}>
                    <animateMotion dur="1s" repeatCount="indefinite" path={path}/>
                </circle>
            }
        </Fragment>
    );
};
