import {Fragment, ReactNode, useCallback, useContext, useMemo, useRef, useState} from "react";
import {Box, Chip, Slider, Stack, Typography} from "@mui/material";
import {IWindow} from "../../../model/IWindow.ts";
import {IMonitoringContext} from "../../../provider/MonitoringProvider.tsx";
import {MonitoringContext} from "../../../provider/MonitoringContext.tsx";
import {TEdge} from "../../../model/TEdge.ts";
import {IValueUpdate} from "../../../model/IValueUpdate.ts";
import Grid from "@mui/material/Grid2";
import {useTranslation} from "react-i18next";
import dayjs from "dayjs";
import {TBlock} from "../../../model/TBlock.ts";

interface IProps {
    window: IWindow
}

export const ConnectionPanel: ({window}: IProps) => ReactNode = ({window}: IProps): ReactNode => {

    const {t} = useTranslation();
    const {connectionStates, edges, nodes} = useContext<IMonitoringContext>(MonitoringContext);
    const [localValueCount, setLocalValueCount] = useState<number>(20);

    const endRef = useRef<HTMLDivElement | null>(null);

    const edge: TEdge | undefined = useMemo(() => edges.find((e: TEdge): boolean => e.id === window.id), [edges, window]);

    const targetName: string | undefined = useMemo(() => {
        const targetNode = nodes.find((n: TBlock): boolean => n.id === edge?.target);
        return targetNode?.data.inputs?.find((input): boolean => input.id === edge?.data?.input)?.label
    }, [nodes, edge]);

    const sourceName: string | undefined = useMemo(() => {
        const sourceNode = nodes.find((n: TBlock): boolean => n.id === edge?.source);
        return sourceNode?.data.outputs?.find((output): boolean => output.id === edge?.data?.output)?.label
    }, [nodes, edge]);

    const getValuesForBlock = useCallback((blockId: string | undefined, handleId: string | undefined): IValueUpdate[] => {
        if (!blockId) return [];
        return connectionStates
            .filter((connectionState: IValueUpdate): boolean => connectionState.valueId === handleId)
            .filter((connectionState: IValueUpdate): boolean => connectionState.status === "OUTPUT" || connectionState.status === "RECEIVED")
            .sort((a: IValueUpdate, b: IValueUpdate): number => (b.offset ?? 0) - (a.offset ?? 0))
            .slice(0, localValueCount);
    }, [connectionStates, localValueCount]);

    const sourceValues = useMemo((): IValueUpdate[] => getValuesForBlock(edge?.source, edge?.data?.output), [edge?.data?.output, edge?.source, getValuesForBlock]);
    const targetValues = useMemo((): IValueUpdate[] => getValuesForBlock(edge?.target, edge?.data?.input), [edge?.data?.input, edge?.target, getValuesForBlock]);

    return (
        <Fragment>
            <Grid
                container={true}
                spacing={1}
                sx={{
                    overflowY: "auto",
                    p: 2,
                    backgroundColor: "#121212",
                    color: "white",
                    flexGrow: 1,
                    fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
                    fontSize: "0.8125rem",
                    lineHeight: 1.5,
                }}
            >
                <Grid size={6}>
                    <Typography paddingBottom={2}>{sourceName}</Typography>
                    <Box>
                        {
                            sourceValues.length > 0 ? <Stack spacing={1}>
                                    {
                                        sourceValues.map((connectionState: IValueUpdate, index: number) => (
                                            <Stack direction={"row"} spacing={1} key={connectionState.messageId ?? connectionState.offset ?? index}>
                                                <Chip
                                                    sx={{backgroundColor: "#303030", color: "inherit"}}
                                                    size={"small"}
                                                    label={
                                                        <Typography variant="body2">
                                                            {dayjs.unix(connectionState.timestamp / 1000).format("HH:mm:ss.SSS")}
                                                        </Typography>
                                                    }
                                                />
                                                <Chip
                                                    sx={{backgroundColor: "#252525", color: "inherit"}}
                                                    size={"small"}
                                                    label={
                                                        <Typography variant="body2">
                                                            {connectionState.communicationPoint !== undefined ? `CP ${connectionState.communicationPoint}` : `Value ${index + 1}`}
                                                        </Typography>
                                                    }
                                                />
                                                <Chip
                                                    sx={{backgroundColor: "#252525", color: "inherit"}}
                                                    size={"small"}
                                                    label={
                                                        <Typography variant="body2">
                                                            {connectionState.status !== undefined ? `${connectionState.status}` : `${index + 1}`}
                                                        </Typography>
                                                    }
                                                />
                                                <Typography
                                                    variant={"body2"}
                                                    component={"pre"}
                                                    sx={{
                                                        margin: 0,
                                                        whiteSpace: "pre-wrap",
                                                        wordBreak: "break-word"
                                                    }}
                                                >
                                                    {connectionState.value}
                                                </Typography>
                                            </Stack>
                                        ))
                                    }
                                </Stack>
                                : <Typography>
                                    No values received for this connection yet.
                                </Typography>
                        }
                        <div ref={endRef}/>
                    </Box>
                </Grid>
                <Grid size={6}>
                    <Typography paddingBottom={2}>{targetName}</Typography>
                    <Box>
                        {
                            targetValues.length > 0 ? <Stack spacing={1}>
                                    {
                                        targetValues.map((connectionState: IValueUpdate, index: number) => (
                                            <Stack direction={"row"} spacing={1} key={connectionState.messageId ?? connectionState.offset ?? index}>
                                                <Chip
                                                    sx={{backgroundColor: "#303030", color: "inherit"}}
                                                    size={"small"}
                                                    label={
                                                        <Typography variant="body2">
                                                            {dayjs.unix(connectionState.timestamp / 1000).format("HH:mm:ss:SSS")}
                                                        </Typography>
                                                    }
                                                />
                                                <Chip
                                                    sx={{backgroundColor: "#252525", color: "inherit"}}
                                                    size={"small"}
                                                    label={
                                                        <Typography variant="body2">
                                                            {connectionState.communicationPoint !== undefined ? `CP ${connectionState.communicationPoint}` : `Value ${index + 1}`}
                                                        </Typography>
                                                    }
                                                />
                                                <Chip
                                                    sx={{backgroundColor: "#252525", color: "inherit"}}
                                                    size={"small"}
                                                    label={
                                                        <Typography variant="body2">
                                                            {connectionState.status !== undefined ? `${connectionState.status}` : `${index + 1}`}
                                                        </Typography>
                                                    }
                                                />
                                                <Typography
                                                    variant={"body2"}
                                                    component={"pre"}
                                                    sx={{
                                                        margin: 0,
                                                        whiteSpace: "pre-wrap",
                                                        wordBreak: "break-word"
                                                    }}
                                                >
                                                    {connectionState.value}
                                                </Typography>
                                            </Stack>
                                        ))
                                    }
                                </Stack>
                                : <Typography>
                                    No values received for this connection yet.
                                </Typography>
                        }
                        <div ref={endRef}/>
                    </Box>
                </Grid>
            </Grid>
            <Stack
                direction="row"
                alignItems="center"
                spacing={2}
                sx={{
                    px: 2,
                    py: 1,
                    backgroundColor: "background.paper",
                    borderTop: "1px solid",
                    borderColor: "divider",
                }}
            >
                <Typography paddingRight={1} noWrap={true} variant={"body1"} color={"textSecondary"}>
                    {t("dialog.header.connectionPanel.maxValues")}
                </Typography>
                <Slider
                    sx={{width: "100px"}}
                    aria-label="Max values"
                    value={localValueCount}
                    step={10}
                    marks={true}
                    min={10}
                    max={100}
                    valueLabelDisplay={"auto"}
                    onChange={(_event, newValue) => setLocalValueCount(newValue as number)}
                    onChangeCommitted={(_event, newValue) => setLocalValueCount(newValue as number)}
                />
                <Typography paddingRight={2} noWrap={true} variant={"body1"} color={"textSecondary"}>
                    {localValueCount}
                </Typography>
            </Stack>
        </Fragment>
    );

}

export default ConnectionPanel;