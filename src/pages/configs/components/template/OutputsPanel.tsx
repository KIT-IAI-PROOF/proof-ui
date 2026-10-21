import {useTranslation} from "react-i18next";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Button,
    FormControl,
    InputAdornment,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
    Stack,
    TextField,
    Theme,
    Tooltip,
    Typography,
    useTheme
} from "@mui/material";
import React, {ChangeEvent, Dispatch, Fragment, MutableRefObject, ReactNode, SetStateAction, useContext} from "react";
import {IAppContext} from "../../../../provider/AppProvider.tsx";
import {AppContext} from "../../../../provider/AppContext.tsx";
import {InputDetail, OutputDetail, OutputDetailCommunicationTypeEnum, OutputDetailPhaseEnum, OutputDetailTypeEnum} from "@webis/proof-config-manager-client";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {Info} from "@mui/icons-material";

interface IProps {
    outputs: OutputDetail[] | undefined;
    setOutputs: (outputs: OutputDetail[]) => void;
    outPutPanelExpanded: Record<string, boolean> | undefined;
    setOutputPanelExpanded: Dispatch<SetStateAction<Record<string, boolean> | undefined>>;
    outputLabelsError: Record<string, string> | undefined;
    outModelVarNamesError: Record<string, boolean> | undefined
    accordionRefs: MutableRefObject<Record<number, HTMLDivElement | null>>;
}


const OutputsPanel = ({
                          outputs,
                          setOutputs,
                          setOutputPanelExpanded,
                          outPutPanelExpanded,
                          outputLabelsError,
                          outModelVarNamesError,
                          accordionRefs
                      }: IProps) => {

    const {t} = useTranslation();
    const theme: Theme = useTheme();
    const {hasUnsavedChanges, updateHasUnsavedChanges} = useContext<IAppContext>(AppContext);

    return (
        <Fragment>
            {
                outputs?.map((handle: OutputDetail, index): ReactNode => {
                    return (
                        <Accordion
                            key={handle.id || `Id ${index + 1}`}
                            ref={(el: HTMLDivElement | null) => {
                                accordionRefs.current[index] = el;
                            }}
                            expanded={!!outPutPanelExpanded?.[index]}
                            onChange={() => outPutPanelExpanded && outPutPanelExpanded[index] ? setOutputPanelExpanded(prevState => ({
                                ...prevState,
                                [index]: false
                            })) : setOutputPanelExpanded(prevState => ({...prevState, [index]: true}))}
                            disableGutters={true}
                            sx={{
                                background: theme.palette.elevated.paper,
                                borderRadius: 2,
                                '&:before': {
                                    display: 'none'
                                },
                            }}
                        >
                            <AccordionSummary
                                sx={{
                                    overflow: "hidden",
                                    "& .MuiAccordionSummary-content": {
                                        minWidth: 0,
                                    }
                                }}
                                expandIcon={<ExpandMoreIcon/>}
                            >
                                <Typography sx={{
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    minWidth: 0
                                }}>
                                    {handle.label || `Output ${index + 1}`}
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Stack direction="row">
                                    <InputAdornment position="start">
                                        <Tooltip title={t("tooltip.label")}>
                                            <Info
                                                fontSize={"small"}
                                                sx={{ml: 1, cursor: "pointer"}}
                                            />
                                        </Tooltip>
                                    </InputAdornment>
                                    <TextField
                                        sx={{pb: 2}}
                                        size={"small"}
                                        fullWidth={true}
                                        label={
                                            <Typography>
                                                {t("word.label")}
                                            </Typography>
                                        }
                                        error={outputLabelsError && !!outputLabelsError[index]}
                                        helperText={outputLabelsError && outputLabelsError[index] === "missing" ?
                                            t("word.required") : outputLabelsError && outputLabelsError[index] === "duplicate" ?
                                                t("word.labelAlreadyUsed") : ""}
                                        value={handle.label ?? ""}
                                        variant="outlined"
                                        onChange={(event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): void => {
                                            const handleLabel: string = event.target.value;
                                            setOutputs(outputs!.map((th: OutputDetail, i): OutputDetail =>
                                                index === i ? {
                                                    ...th,
                                                    label: handleLabel
                                                } : th
                                            ));
                                            if (!hasUnsavedChanges) updateHasUnsavedChanges(true)
                                        }}
                                    />
                                </Stack>
                                <Stack direction="row">
                                    <InputAdornment position={"start"}>
                                        <Tooltip title={t("tooltip.description")}>
                                            <Info
                                                fontSize={"small"}
                                                sx={{ml: 1, cursor: "pointer"}}
                                            />
                                        </Tooltip>
                                    </InputAdornment>
                                    <TextField
                                        sx={{pb: 2}}
                                        fullWidth={true}
                                        size={"small"}
                                        label={
                                            <Typography>
                                                {t("word.description")}
                                            </Typography>
                                        }
                                        value={handle.description ?? ""}
                                        variant="outlined"
                                        onChange={(event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): void => {
                                            const handleDescription: string = event.target.value;
                                            setOutputs(outputs!.map((th: OutputDetail, i): OutputDetail =>
                                                index === i ? {
                                                    ...th,
                                                    description: handleDescription
                                                } : th
                                            ));
                                            if (!hasUnsavedChanges) updateHasUnsavedChanges(true)
                                        }}
                                    />
                                </Stack>
                                <Stack direction="row">
                                    <InputAdornment position="start">
                                        <Tooltip title={t("tooltip.unit")}>
                                            <Info
                                                fontSize={"small"}
                                                sx={{ml: 1, cursor: "pointer"}}
                                            />
                                        </Tooltip>
                                    </InputAdornment>
                                    <TextField
                                        sx={{pb: 2}}
                                        size={"small"}
                                        fullWidth={true}
                                        label={
                                            <Typography>
                                                {t("word.unit")}
                                            </Typography>
                                        }
                                        value={handle.unit ?? ""}
                                        variant="outlined"
                                        required={false}
                                        onChange={(event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): void => {
                                            const unit: string = event.target.value;
                                            setOutputs(outputs!.map((th: InputDetail, i): InputDetail =>
                                                index === i ? {
                                                    ...th,
                                                    unit: unit
                                                } : th
                                            ));
                                            if (!hasUnsavedChanges) updateHasUnsavedChanges(true)
                                        }}
                                    />
                                </Stack>
                                <Stack direction="row">
                                    <InputAdornment position="start">
                                        <Tooltip title={t("tooltip.modelVarName")}>
                                            <Info
                                                fontSize={"small"}
                                                sx={{ml: 1, cursor: "pointer"}}
                                            />
                                        </Tooltip>
                                    </InputAdornment>
                                    <TextField
                                        sx={{pb: 2}}
                                        size={"small"}
                                        fullWidth={true}
                                        label={
                                            <Typography>
                                                {t("word.modelVarName")}
                                            </Typography>
                                        }
                                        error={outModelVarNamesError && outModelVarNamesError[index]}
                                        helperText={outModelVarNamesError && outModelVarNamesError[index] ? t("word.required") : ""}
                                        value={handle.modelVarName ?? ""}
                                        variant="outlined"
                                        required={false}
                                        onChange={(event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): void => {
                                            const modelVarName: string = event.target.value;
                                            setOutputs(outputs!.map((th: InputDetail, i): InputDetail =>
                                                index === i ? {
                                                    ...th,
                                                    modelVarName: modelVarName
                                                } : th
                                            ));
                                            if (!hasUnsavedChanges) updateHasUnsavedChanges(true)
                                        }}
                                    />
                                </Stack>
                                <Stack direction="row">
                                    <InputAdornment position="start">
                                        <Tooltip title={t("tooltip.type")}>
                                            <Info
                                                fontSize={"small"}
                                                sx={{ml: 1, cursor: "pointer"}}
                                            />
                                        </Tooltip>
                                    </InputAdornment>
                                    <FormControl size={"small"} fullWidth sx={{pb: 2}}>
                                        <InputLabel>
                                            <Typography>
                                                {t("word.type")}
                                            </Typography>
                                        </InputLabel>
                                        <Select
                                            size={"small"}
                                            variant="outlined"
                                            value={handle.type ?? ""}
                                            label={
                                                <Typography>
                                                    {t("word.type")}
                                                </Typography>
                                            }
                                            onChange={(event: SelectChangeEvent<"" | OutputDetailTypeEnum>): void => {
                                                const handleType: string = event.target.value;
                                                setOutputs(outputs!.map((sh: OutputDetail, i): OutputDetail =>
                                                    index === i ? {
                                                        ...sh,
                                                        type: handleType as OutputDetailTypeEnum
                                                    } : sh
                                                ));
                                                if (!hasUnsavedChanges) updateHasUnsavedChanges(true)
                                            }}>
                                            <MenuItem
                                                value={OutputDetailTypeEnum.String ?? ""}>
                                                {OutputDetailTypeEnum.String}
                                            </MenuItem>
                                            <MenuItem
                                                value={OutputDetailTypeEnum.Float ?? ""}>
                                                {OutputDetailTypeEnum.Float}
                                            </MenuItem>
                                            <MenuItem
                                                value={OutputDetailTypeEnum.Integer ?? ""}>
                                                {OutputDetailTypeEnum.Integer}
                                            </MenuItem>
                                            <MenuItem
                                                value={OutputDetailTypeEnum.Object ?? ""}>
                                                {OutputDetailTypeEnum.Object}
                                            </MenuItem>
                                            <MenuItem
                                                value={OutputDetailTypeEnum.FileName ?? ""}>
                                                {OutputDetailTypeEnum.FileName}
                                            </MenuItem>
                                            <MenuItem
                                                value={OutputDetailTypeEnum.StringArray ?? ""}>
                                                {OutputDetailTypeEnum.StringArray}
                                            </MenuItem>
                                            <MenuItem
                                                value={OutputDetailTypeEnum.IntegerArray ?? ""}>
                                                {OutputDetailTypeEnum.IntegerArray}
                                            </MenuItem>
                                            <MenuItem
                                                value={OutputDetailTypeEnum.FloatArray ?? ""}>
                                                {OutputDetailTypeEnum.FloatArray}
                                            </MenuItem>
                                            <MenuItem
                                                value={OutputDetailTypeEnum.ObjectArray ?? ""}>
                                                {OutputDetailTypeEnum.ObjectArray}
                                            </MenuItem>
                                        </Select>
                                    </FormControl></Stack>
                                <Stack direction="row">
                                    <InputAdornment position="start">
                                        <Tooltip title={t("tooltip.communicationType")}>
                                            <Info
                                                fontSize={"small"}
                                                sx={{ml: 1, cursor: "pointer"}}
                                            />
                                        </Tooltip>
                                    </InputAdornment>
                                    <FormControl size={"small"} fullWidth sx={{pb: 2}}>
                                        <InputLabel>
                                            <Typography>
                                                {t("word.communicationType")}
                                            </Typography>
                                        </InputLabel>
                                        <Select
                                            size={"small"}
                                            variant="outlined"
                                            value={handle.communicationType ?? ""}
                                            label={
                                                <Typography>
                                                    {t("word.communicationType")}
                                                </Typography>
                                            }
                                            onChange={(event: SelectChangeEvent<"STEPBASED" | "EVENT" | "EVENT_STATIC" | "STEPBASED_STATIC">): void => {
                                                const handleCommunicationType: string = event.target.value;
                                                setOutputs(outputs!.map((sh: OutputDetail, i): OutputDetail =>
                                                    index === i ? {
                                                        ...sh,
                                                        communicationType: handleCommunicationType as OutputDetailCommunicationTypeEnum
                                                    } : sh
                                                ));
                                                if (!hasUnsavedChanges) updateHasUnsavedChanges(true)
                                            }}>
                                            <MenuItem
                                                value={OutputDetailCommunicationTypeEnum.Stepbased ?? ""}>
                                                {OutputDetailCommunicationTypeEnum.Stepbased}
                                            </MenuItem>
                                            {/* <MenuItem
                                                value={OutputDetailCommunicationTypeEnum.Event ?? ""}>
                                                {OutputDetailCommunicationTypeEnum.Event}
                                            </MenuItem> */}
                                        </Select>
                                    </FormControl></Stack>
                                <Stack direction="row">
                                    <InputAdornment position="start">
                                        <Tooltip title={t("tooltip.phase")}>
                                            <Info
                                                fontSize={"small"}
                                                sx={{ml: 1, cursor: "pointer"}}
                                            />
                                        </Tooltip>
                                    </InputAdornment>
                                    <FormControl size={"small"} fullWidth sx={{pb: 2}}>
                                        <InputLabel>
                                            <Typography>
                                                {t("word.phase")}
                                            </Typography>
                                        </InputLabel>
                                        <Select
                                            variant="outlined"
                                            size={"small"}
                                            value={handle.phase ?? ""}
                                            label={
                                                <Typography>
                                                    {t("word.phase")}
                                                </Typography>
                                            }
                                            onChange={(event: SelectChangeEvent<OutputDetailPhaseEnum>): void => {
                                                const phase: string = event.target.value;
                                                setOutputs(outputs!.map((th: InputDetail, i): InputDetail =>
                                                    index === i ? {
                                                        ...th,
                                                        phase: phase as OutputDetailPhaseEnum
                                                    } : th
                                                ));
                                                if (!hasUnsavedChanges) updateHasUnsavedChanges(true)
                                            }}>
                                            <MenuItem
                                                value={OutputDetailPhaseEnum.Create}>
                                                {OutputDetailPhaseEnum.Create}
                                            </MenuItem>
                                            <MenuItem
                                                value={OutputDetailPhaseEnum.Init}>
                                                {OutputDetailPhaseEnum.Init}
                                            </MenuItem>
                                            <MenuItem
                                                value={OutputDetailPhaseEnum.Execute}>
                                                {OutputDetailPhaseEnum.Execute}
                                            </MenuItem>
                                            <MenuItem
                                                value={OutputDetailPhaseEnum.Finalize}>
                                                {OutputDetailPhaseEnum.Finalize}
                                            </MenuItem>
                                            <MenuItem
                                                value={OutputDetailPhaseEnum.Shutdown}>
                                                {OutputDetailPhaseEnum.Shutdown}
                                            </MenuItem>
                                        </Select>
                                    </FormControl>
                                </Stack>
                                <Button
                                    onClick={async (): Promise<void> => {
                                        setOutputs(outputs!.filter((__sh: OutputDetail, i): boolean => index !== i))
                                        if (!hasUnsavedChanges) updateHasUnsavedChanges(true)
                                    }}
                                    color={"primary"}>
                                    {t("action.delete")}
                                </Button>
                            </AccordionDetails>
                        </Accordion>
                    );
                })
            }
        </Fragment>
    )
}

export default React.memo(OutputsPanel)