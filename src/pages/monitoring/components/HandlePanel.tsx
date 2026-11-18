import {Fragment, ReactNode, useContext, useMemo, useRef, useState} from "react";
import {Box, Button, Chip, MenuItem, Slider, Stack, TextField, Typography} from "@mui/material";
import {IWindow} from "../../../model/IWindow.ts";
import {IMonitoringContext} from "../../../provider/MonitoringProvider.tsx";
import {MonitoringContext} from "../../../provider/MonitoringContext.tsx";
import {IValueUpdate} from "../../../model/IValueUpdate.ts";
import {useTranslation} from "react-i18next";
import dayjs from "dayjs";
import Papa from "papaparse";
import {saveAs} from "file-saver";
import {getCsvFilename} from "../../../utils/csv.ts";
import {CSV_DELIMITER} from "../../../utils/constants.ts";

interface IProps {
    window: IWindow;
    title: string;
}

export const HandlePanel = ({window, title}: IProps): ReactNode => {
    const {t} = useTranslation();
    const {connectionStates, nodes} = useContext<IMonitoringContext>(MonitoringContext);
    const [localValueCount, setLocalValueCount] = useState<number>(20);
    const endRef = useRef<HTMLDivElement | null>(null);
    const [selectedCSVDelimiter, setSelectedCSVDelimiter] = useState<string>(CSV_DELIMITER.comma);

    const handleInfo = useMemo(() => {
        for (const node of nodes) {
            const input = node.data.inputs?.find((inp) => inp.id === window.id);
            if (input) return {label: input.label, block: node, direction: "input" as const};
            const output = node.data.outputs?.find((out) => out.id === window.id);
            if (output) return {label: output.label, block: node, direction: "output" as const};
        }
        return {label: undefined, block: undefined, direction: undefined};
    }, [nodes, window.id]);

    const values = useMemo((): IValueUpdate[] => {
        return connectionStates
            .filter((connectionState: IValueUpdate): boolean => connectionState.valueId === window.id)
            .filter((connectionState: IValueUpdate): boolean => connectionState.status === "OUTPUT" || connectionState.status === "RECEIVED")
            .sort((a: IValueUpdate, b: IValueUpdate): number => (b.offset ?? 0) - (a.offset ?? 0))
            .slice(0, localValueCount);
    }, [connectionStates, localValueCount, window.id]);

    const handleExport = (): void => {
        const direction = handleInfo.direction;
        if (!direction || values.length === 0) return;

        const csv = Papa.unparse([
            [`${direction}_timestamp`, `${direction}_cp`, `${direction}_status`, `${direction}_value`],
            ...values.map((value: IValueUpdate) => [
                value.timestamp,
                value.communicationPoint,
                value.status,
                value.value,
            ]),
        ], {delimiter: selectedCSVDelimiter});
        saveAs(new Blob([csv], {type: "text/csv;charset=utf-8"}), getCsvFilename(title));
    };

    return (
        <Fragment>
            <Box
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
                <Typography paddingBottom={2}>{handleInfo.label}</Typography>
                <Box>
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
            </Box>
            <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                    px: 2,
                    py: 1,
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
                <Stack
                    spacing={2}
                    direction="row"
                    alignItems="center"
                >
                    <TextField
                        select
                        size="small"
                        label={t("word.delimiter")}
                        value={selectedCSVDelimiter}
                        onChange={(event) => setSelectedCSVDelimiter(event.target.value)}
                        sx={{minWidth: 120}}
                    >
                        {Object.values(CSV_DELIMITER).map((delimiter) => (
                            <MenuItem key={delimiter} value={delimiter}>
                                {delimiter === "\t"
                                    ? t("word.tabulator")
                                    : delimiter === " " ? t("word.space") : delimiter}
                            </MenuItem>
                        ))}
                    </TextField>
                    <Button
                        size="small"
                        variant="outlined"
                        onClick={handleExport}
                        disabled={values.length === 0 || !handleInfo.direction}
                        sx={{height: 40, whiteSpace: "nowrap"}}
                    >
                        CSV {t("action.export")}
                    </Button>
                </Stack>
            </Stack>
        </Fragment>
    );
};

export default HandlePanel;
