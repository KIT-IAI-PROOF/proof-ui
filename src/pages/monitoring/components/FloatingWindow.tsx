import React, {CSSProperties, ReactNode, useCallback, useContext} from "react";
import {Box, IconButton, Paper, Typography,} from "@mui/material";
import {Close} from "@mui/icons-material";
import {useDraggable} from "@dnd-kit/core";
import {CSS} from "@dnd-kit/utilities";
import {IWindow} from "../../../model/IWindow.ts";
import LogPanel from "./LogPanel.tsx";
import ConnectionPanel from "./ConnectionPanel.tsx";
import {IWindowContext} from "../../../provider/WindowProvider.tsx";
import {WindowContext} from "../../../provider/WindowContext.tsx";
import {useTranslation} from "react-i18next";
import {IMonitoringContext} from "../../../provider/MonitoringProvider.tsx";
import {MonitoringContext} from "../../../provider/MonitoringContext.tsx";
import {TEdge} from "../../../model/TEdge.ts";
import {TBlock} from "../../../model/TBlock.ts";
import HandlePanel from "./HandlePanel.tsx";

interface IProps {
    window: IWindow;
}

const FloatingWindow: React.FC<IProps> = React.memo(({window}: IProps): ReactNode => {

    const {t} = useTranslation();
    const {edges, nodes} = useContext<IMonitoringContext>(MonitoringContext);
    const {handleCloseWindow, handleFocusWindow} = useContext<IWindowContext>(WindowContext);

    const {attributes, listeners, setNodeRef, transform, isDragging} = useDraggable({
        id: window.id,
    });

    const style: CSSProperties = {
        position: "absolute",
        left: `${window.x}px`,
        top: `${window.y}px`,
        transform: CSS.Translate.toString(transform),
        willChange: isDragging ? "transform" : "auto",
        zIndex: isDragging ? 9999 : window.zIndex ?? 1,
        touchAction: "none",
    };

    const getTitle = useCallback((id: string, queue: string, type: "log" | "connection" | "handle"): string => {
        switch (type) {
            case "log": {
                if (queue.startsWith("execution.")) return "Orchestrator";
                const node: TBlock | undefined = nodes.find((e: TBlock): boolean => e.id === id)
                return `${node?.data.label} (${node?.data.index})`;
            }
            case "connection": {
                const edge: TEdge | undefined = edges.find((e: TEdge): boolean => e.id === id)
                const sourceBlock: TBlock | undefined = nodes.find((e: TBlock): boolean => e.id === edge?.data?.source)
                const targetBlock: TBlock | undefined = nodes.find((e: TBlock): boolean => e.id === edge?.data?.target)
                return `${t("word.connection")} ${sourceBlock?.data.label} (${sourceBlock?.data.index}) – ${targetBlock?.data.label} (${targetBlock?.data.index})`;
            }
            case "handle": {
                for (const node of nodes) {
                    const input = node.data.inputs?.find((i) => i.id === id);
                    if (input) return `Eingang ${node.data.label} (${node.data.index}) – ${input.label}`;
                    const output = node.data.outputs?.find((o) => o.id === id);
                    if (output) return `Ausgang ${node.data.label} (${node.data.index}) – ${output.label}`;
                }
                return id;
            }
            default:
                return "";
        }
    }, [edges, nodes, t]);

    return (
        <Paper
            ref={setNodeRef}
            style={style}
            onMouseDown={() => handleFocusWindow(window.id)}
            sx={{
                width: 800,
                height: 420,
                minWidth: 800,
                minHeight: 240,
                maxWidth: "90vw",
                maxHeight: "90vh",
                resize: "both",
                display: "flex",
                flexDirection: "column",
                overflow: "auto",
                border: "1px solid",
                borderColor: "divider",
                boxShadow: isDragging ? 8 : 3,
            }}
        >
            <Box
                {...listeners}
                {...attributes}
                sx={{
                    px: 2,
                    py: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: isDragging ? "grabbing" : "grab",
                    userSelect: "none",
                }}
            >
                <Typography variant="subtitle2" noWrap sx={{fontWeight: 600}}>
                    {getTitle(window.id, window.queue, window.type)}
                </Typography>
                <IconButton
                    size="small"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleCloseWindow(window.id);
                    }}
                    sx={{color: "grey.400", "&:hover": {color: "common.white"}}}
                >
                    <Close fontSize="small"/>
                </IconButton>
            </Box>
            {
                window.type === "log" && <LogPanel window={window}/>
            }
            {
                window.type === "connection" && <ConnectionPanel window={window}/>
            }
            {
                window.type === "handle" && <HandlePanel window={window}/>
            }
        </Paper>
    );
});

FloatingWindow.displayName = "FloatingWindow";
export default FloatingWindow;