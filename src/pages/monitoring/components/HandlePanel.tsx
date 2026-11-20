import {Fragment, ReactNode, useContext, useMemo, useRef, useState} from "react";
import {Box, Chip, Slider, Stack, Tab, Tabs, Typography} from "@mui/material";
import {IWindow} from "../../../model/IWindow.ts";
import {IMonitoringContext} from "../../../provider/MonitoringProvider.tsx";
import {MonitoringContext} from "../../../provider/MonitoringContext.tsx";
import {IValueUpdate} from "../../../model/IValueUpdate.ts";
import {useTranslation} from "react-i18next";
import dayjs from "dayjs";
import {LineDiagram} from "./LineDiagram.tsx";

interface IProps {
    window: IWindow;
}

export const HandlePanel: ({window}: IProps) => ReactNode = ({window}: IProps): ReactNode => {

    const {t} = useTranslation();
    const {connectionStates, nodes} = useContext<IMonitoringContext>(MonitoringContext);
    const [localValueCount, setLocalValueCount] = useState<number>(20);
    const endRef = useRef<HTMLDivElement | null>(null);
    const [showFlowChart, setShowFlowChart] = useState<boolean>(false);

    const handleInfo = useMemo(() => {
        for (const node of nodes) {
            const input = node.data.inputs?.find((inp) => inp.id === window.id);
            if (input) return {label: input.label, block: node};
            const output = node.data.outputs?.find((out) => out.id === window.id);
            if (output) return {label: output.label, block: node};
        }
        return {label: undefined, block: undefined};
    }, [nodes, window.id]);

    const values = useMemo((): IValueUpdate[] => {
        return connectionStates
            .filter((connectionState: IValueUpdate): boolean => connectionState.valueId === window.id)
            .filter((connectionState: IValueUpdate): boolean => connectionState.status === "OUTPUT" || connectionState.status === "RECEIVED")
            .sort((a: IValueUpdate, b: IValueUpdate): number => (b.offset ?? 0) - (a.offset ?? 0))
            .slice(0, localValueCount);
    }, [connectionStates, localValueCount, window.id]);

    const chartData = useMemo(() => {
        if (values[0]?.dataType !== "float") return [];

        const toNumber = (value: unknown) => (value == null ? null : Number(value));

        return [...values]
            .sort((a, b) => (a.communicationPoint ?? 0) - (b.communicationPoint ?? 0))
            .map(({ communicationPoint, status, value }) => ({
                cp: communicationPoint,
                input: status === "RECEIVED" ? toNumber(value) : null,
                output: status === "OUTPUT" ? toNumber(value) : null,
            }));
    }, [values]);

    const hasFloatValues = chartData.length > 0;

    return (
        <Fragment>
            {hasFloatValues &&
                <Box sx={{borderBottom: 1, borderColor: 'divider'}}>
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
                </Box>}
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
                    <LineDiagram
                        chartData={chartData}
                        dataLabel={handleInfo.label}
                    /> :
                    <Box>
                        <Typography paddingBottom={2}>{handleInfo.label}</Typography>
                        {values.length > 0 ? (
                            <Stack spacing={1}>
                                {values.map((connectionState: IValueUpdate, index: number) => (
                                    <Stack
                                        direction={"row"}
                                        spacing={1}
                                        key={connectionState.messageId ?? connectionState.offset ?? index}
                                    >
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
                                                    {connectionState.communicationPoint !== undefined
                                                        ? `CP ${connectionState.communicationPoint}`
                                                        : `Value ${index + 1}`}
                                                </Typography>
                                            }
                                        />
                                        <Chip
                                            sx={{backgroundColor: "#252525", color: "inherit"}}
                                            size={"small"}
                                            label={
                                                <Typography variant="body2">
                                                    {connectionState.status !== undefined
                                                        ? `${connectionState.status}`
                                                        : `${index + 1}`}
                                                </Typography>
                                            }
                                        />
                                        <Typography
                                            variant={"body2"}
                                            component={"pre"}
                                            sx={{
                                                margin: 0,
                                                whiteSpace: "pre-wrap",
                                                wordBreak: "break-word",
                                            }}
                                        >
                                            {connectionState.value}
                                        </Typography>
                                    </Stack>
                                ))}
                            </Stack>
                        ) : (
                            <Typography>No values received for this handle yet.</Typography>
                        )}
                        <div ref={endRef}/>
                    </Box>
                }
            </Box>
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
                <Typography paddingRight={2} noWrap={true} variant={"body1"} color={"textSecondary"}>
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
};

export default HandlePanel;
