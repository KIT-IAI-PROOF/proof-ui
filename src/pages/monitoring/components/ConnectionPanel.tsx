import {Fragment, ReactNode, useCallback, useContext, useMemo, useRef, useState} from "react";
import {Box, Chip, Slider, Stack, Tab, Tabs, Typography} from "@mui/material";
import {IWindow} from "../../../model/IWindow.ts";
import {IMonitoringContext} from "../../../provider/MonitoringProvider.tsx";
import {MonitoringContext} from "../../../provider/MonitoringContext.tsx";
import {TEdge} from "../../../model/TEdge.ts";
import {IValueUpdate} from "../../../model/IValueUpdate.ts";
import Grid from "@mui/material/Grid2";
import {useTranslation} from "react-i18next";
import dayjs from "dayjs";
import {TBlock} from "../../../model/TBlock.ts";
import {LineDiagram} from "./LineDiagram.tsx";
import Papa from "papaparse";
import {saveAs} from "file-saver";
import {getCsvEndpointName, getCsvFilename} from "../../../utils/csv.ts";
import CsvExportControls from "./CsvExportControls.tsx";

interface IProps {
    window: IWindow;
}

export const ConnectionPanel = ({window}: IProps): ReactNode => {

    const {t} = useTranslation();
    const {connectionStates, edges, nodes, execution} = useContext<IMonitoringContext>(MonitoringContext);
    const [localValueCount, setLocalValueCount] = useState<number>(20);
    const [showFlowChart, setShowFlowChart] = useState<boolean>(false);

    const endRef = useRef<HTMLDivElement | null>(null);

    const edge: TEdge | undefined = useMemo(() => edges.find((e: TEdge): boolean => e.id === window.id), [edges, window]);

    const sourceNode = nodes.find((node) => node.id === edge?.source);
    const targetNode = nodes.find((node) => node.id === edge?.target);
    const sourceName = sourceNode?.data.outputs?.find((output) => output.id === edge?.data?.output)?.label;
    const targetName = targetNode?.data.inputs?.find((input) => input.id === edge?.data?.input)?.label;

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

    const chartData = useMemo(() => {
        const points = new Map<number, { cp: number; input: number | null; output: number | null }>();
        const addValues = (items: IValueUpdate[], key: "input" | "output") => {
            items.filter((item) => item.dataType === "float" && Number.isFinite(Number(item.communicationPoint)))
                .forEach((item) => {
                    const cp = Number(item.communicationPoint);
                    const point = points.get(cp) ?? {cp, input: null, output: null};
                    point[key] = item.value == null ? null : Number(item.value);
                    points.set(cp, point);
                });
        };
        addValues(sourceValues, "input");
        addValues(targetValues, "output");
        return [...points.values()].sort((a, b) => a.cp - b.cp);
    }, [sourceValues, targetValues]);

    const hasFloatValues = chartData.length > 0;
    const handleExport = (separator: string): void => {
        const rows = Array.from({length: Math.max(sourceValues.length, targetValues.length)}, (_, index) => {
            const output = sourceValues[index];
            const input = targetValues[index];

            return [
                output?.timestamp,
                output?.communicationPoint,
                output?.status,
                output?.value,
                input?.timestamp,
                input?.communicationPoint,
                input?.status,
                input?.value,
            ];
        });
        const csv = Papa.unparse([
            ["output_timestamp", "output_cp", "output_status", "output_value", "input_timestamp", "input_cp", "input_status", "input_value"],
            ...rows,
        ], {delimiter: separator});
        const source = getCsvEndpointName(sourceNode, sourceName || edge?.data?.output || "Output", edge?.source);
        const target = getCsvEndpointName(targetNode, targetName || edge?.data?.input || "Input", edge?.target);
        const filename = getCsvFilename(`Connection_${source} - ${target}`, execution?.id, execution?.stoppedAt);
        saveAs(new Blob([csv], {type: "text/csv;charset=utf-8"}), filename);
    };

    return (
        <Fragment>
            {hasFloatValues &&
                <Box sx={{borderBottom: 1, borderColor: 'divider', flexShrink: 0}}>
                    <Tabs
                        value={showFlowChart}
                        onChange={() => setShowFlowChart(!showFlowChart)}
                        sx={{
                            minHeight: 36,
                            "& .MuiTab-root": {
                                minWidth: 0,
                                minHeight: 36,
                                py: 0
                            },
                        }}
                    >
                        <Tab value={false} label={t("word.values")}/>
                        <Tab value={true} label={t("word.flowChart")}/>
                    </Tabs>
                </Box>
            }
            <Box
                sx={{
                    overflowY: "auto",
                    overflowX: showFlowChart && hasFloatValues ? "hidden" : "auto",
                    minWidth: 0,
                    p: 2,
                    backgroundColor: "#121212",
                    color: "white",
                    flexGrow: 1,
                    fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
                    fontSize: "0.8125rem",
                    lineHeight: 1.5,
                }}
            >
                {showFlowChart && hasFloatValues ?
                    <LineDiagram dataLabel={sourceName ?? targetName} chartData={chartData}/> : <Grid
                        container={true}
                        spacing={1}
                    >
                        <Grid size={6}>
                            <Typography paddingBottom={2}>{sourceName}</Typography>
                            <Box>
                                {
                                    sourceValues.length > 0 ? <Stack spacing={1}>
                                            {
                                                sourceValues.map((connectionState: IValueUpdate, index: number) => (
                                                    <Stack direction={"row"} spacing={1}
                                                           key={connectionState.messageId ?? connectionState.offset ?? index}>
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
                                                    <Stack direction={"row"} spacing={1}
                                                           key={connectionState.messageId ?? connectionState.offset ?? index}>
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
                    </Grid>}
            </Box>
            <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                    px: 2,
                    py: 1,
                    flexShrink: 0,
                    backgroundColor: "background.paper",
                    borderTop: "1px solid",
                    borderColor: "divider",
                }}
            >
                <Stack
                    spacing={2}
                    direction="row"
                    alignItems="center"
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
                <CsvExportControls
                    disabled={sourceValues.length === 0 && targetValues.length === 0}
                    onExport={handleExport}
                />
            </Stack>
        </Fragment>
    );

}

export default ConnectionPanel;
