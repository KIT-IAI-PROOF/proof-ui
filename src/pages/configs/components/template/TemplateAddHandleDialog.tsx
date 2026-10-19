import {ChangeEvent, ReactNode, useContext, useEffect, useState} from "react";
import {Fragment} from "react/jsx-runtime";
import {
    InputDetail,
    InputDetailCommunicationTypeEnum,
    InputDetailPhaseEnum,
    InputDetailTypeEnum,
    OutputDetail,
    OutputDetailCommunicationTypeEnum,
    OutputDetailPhaseEnum,
    OutputDetailTypeEnum
} from "@kit-iai-proof/proof-config-manager-client";
import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    FormControl,
    FormControlLabel,
    InputAdornment,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
    Stack,
    Switch,
    TextField,
    Theme,
    Tooltip,
    Typography,
    useTheme,
} from "@mui/material";
import {useTranslation} from "react-i18next";
import {IAppContext} from "../../../../provider/AppProvider.tsx";
import {AppContext} from "../../../../provider/AppContext.tsx";
import {Info} from "@mui/icons-material";

interface IAddHandleDialogProps {
    dialogHeader: string;
    open: boolean;
    setTargetHandles: any;
    setSourceHandles: any;
    isInput: boolean;
    setOpen: (open: boolean) => void;
}

const AddHandleDialog: ({
                            dialogHeader,
                            open,
                            setOpen,
                            isInput,
                            setSourceHandles,
                            setTargetHandles
                        }: IAddHandleDialogProps) => ReactNode = ({
                                                                      dialogHeader,
                                                                      open,
                                                                      isInput,
                                                                      setOpen,
                                                                      setSourceHandles,
                                                                      setTargetHandles
                                                                  }: IAddHandleDialogProps): ReactNode => {
    const theme: Theme = useTheme();
    const {t} = useTranslation();

    const [handle, setHandle] = useState<OutputDetail | InputDetail | undefined>();
    const [labelError, setLabelError] = useState<boolean>();
    const [modelVarnameError, setModeLVarnameError] = useState<boolean>();
    const [typeError, setTypeError] = useState<boolean>();
    const [communicationTypeError, setCommunicationTypeError] = useState<boolean>();
    const [phaseError, setPhaseError] = useState<boolean>();

    const {hasUnsavedChanges, updateHasUnsavedChanges} = useContext<IAppContext>(AppContext);

    const validation: () => boolean = (): boolean => {
        let valid: boolean = true;

        if (!handle?.label || handle?.label.trim() === "") {
            setLabelError(true)
            valid = false;
        } else {
            setLabelError(false)
        }

        if (!handle?.modelVarName || handle?.modelVarName.trim() === "") {
            setModeLVarnameError(true)
            valid = false;
        } else {
            setModeLVarnameError(false)
        }

        if (!handle?.type || handle?.type.trim() === "") {
            setTypeError(true)
            valid = false;
        } else {
            setTypeError(false)
        }

        if (!handle?.communicationType || handle?.communicationType.trim() === "") {
            setCommunicationTypeError(true)
            valid = false;
        } else {
            setCommunicationTypeError(false)
        }

        if (!handle?.phase || handle?.phase.trim() === "") {
            setPhaseError(true)
            valid = false;
        } else {
            setPhaseError(false)
        }

        return valid;
    }

    const handleAddInput: () => void = (): void => {
        const valid: boolean = validation();
        if (!valid) {
            return;
        }
        if (isInput) {
            setTargetHandles((handles: any[]): any[] => [...handles, handle])

        } else {
            setSourceHandles((handles: any[]): any[] => [...handles, handle])
        }
        if (!hasUnsavedChanges) updateHasUnsavedChanges(true)
        // Reset handle for next input
        if (isInput) {
            setHandle({required: false})
        } else {
            setHandle({})
        }
        setOpen(false)
    }

    useEffect((): void => {
        // Only reset when dialog is opened, not when closed
        if (open) {
            if (isInput) {
                setHandle({required: false})
            } else {
                setHandle({})
            }
        }
    }, [isInput, open]);

    return (
        <Fragment>
            <Dialog
                fullWidth={true}
                open={open}
                onClose={(): void => setOpen(false)}>
                <Box style={{background: theme.palette.background.paper}} paddingX={2}>
                    <DialogTitle>
                        {dialogHeader}
                    </DialogTitle>
                    <Stack spacing={1}>
                        <Stack direction={"row"} alignItems={"center"}>
                            <InputAdornment position="start">
                                <Tooltip title={t("tooltip.label") || ""}>
                                    <Info
                                        fontSize={"small"}
                                    />
                                </Tooltip>
                            </InputAdornment>
                            <TextField
                                size={"small"}
                                fullWidth={true}
                                label={t("word.label")}
                                error={labelError}
                                helperText={labelError ? t("word.required") : ""}
                                value={handle?.label ?? ""}
                                variant="outlined"
                                required={true}
                                onChange={(event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): void => {
                                    setHandle((handle: OutputDetail | InputDetail | undefined) => ({
                                        ...handle,
                                        label: event.target.value
                                    }));
                                }}
                            />
                        </Stack>
                        <Stack direction={"row"} alignItems={"center"}>
                            <InputAdornment position="start">
                                <Tooltip title={t("tooltip.description") || ""}>
                                    <Info
                                        fontSize={"small"}
                                    />
                                </Tooltip>
                            </InputAdornment>
                            <TextField
                                size={"small"}
                                fullWidth={true}
                                label={t("word.description")}
                                value={handle?.description ?? ""}
                                variant="outlined"
                                onChange={(event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): void => {
                                    setHandle((handle: OutputDetail | InputDetail | undefined) => ({
                                        ...handle,
                                        description: event.target.value
                                    }));
                                }}
                            />
                        </Stack>
                        <Stack direction={"row"} alignItems={"center"}>
                            <InputAdornment position="start">
                                <Tooltip title={t("tooltip.unit") || ""}>
                                    <Info
                                        fontSize={"small"}
                                    />
                                </Tooltip>
                            </InputAdornment>
                            <TextField
                                size={"small"}
                                fullWidth={true}
                                label={t("word.unit")}
                                value={handle?.unit ?? ""}
                                variant="outlined"
                                onChange={(event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): void => {
                                    setHandle((handle: OutputDetail | InputDetail | undefined) => ({
                                        ...handle,
                                        unit: event.target.value
                                    }));
                                }}
                            />
                        </Stack>
                        <Stack direction={"row"} alignItems={"center"}>
                            <InputAdornment position="start">
                                <Tooltip title={t("tooltip.modelVarName") || ""}>
                                    <Info
                                        fontSize={"small"}
                                    />
                                </Tooltip>
                            </InputAdornment>
                            <TextField
                                size={"small"}
                                fullWidth={true}
                                label={t("word.modelVarName")}
                                error={modelVarnameError}
                                helperText={modelVarnameError ? t("word.required") : ""}
                                value={handle?.modelVarName ?? ""}
                                variant="outlined"
                                required={true}
                                onChange={(event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): void => {
                                    setHandle((handle: OutputDetail | InputDetail | undefined) => ({
                                        ...handle,
                                        modelVarName: event.target.value
                                    }));
                                }}
                            />
                        </Stack>
                        {isInput &&
                            <Stack direction={"row"} alignItems={"center"}>
                                <InputAdornment position="start">
                                    <Tooltip title={t("tooltip.required") || ""}>
                                        <Info
                                            fontSize={"small"}
                                        />
                                    </Tooltip>
                                </InputAdornment>
                                <FormControl size={"small"} fullWidth>
                                    <FormControlLabel
                                        label={t("word.required")}
                                        control={<Switch
                                            checked={(handle as InputDetail)?.required ?? false}
                                            onChange={(event: any): void => {
                                                setHandle((handle: OutputDetail | InputDetail | undefined) => ({
                                                    ...handle,
                                                    defaultValue: event.target.checked ? undefined : (handle as InputDetail).defaultValue,
                                                    required: event.target.checked
                                                }))
                                            }}
                                        />}
                                    />
                                </FormControl>
                            </Stack>
                        }
                        <Stack direction={"row"} alignItems={"center"}>
                            <InputAdornment position="start">
                                <Tooltip title={t("tooltip.type") || ""}>
                                    <Info
                                        fontSize={"small"}
                                    />
                                </Tooltip>
                            </InputAdornment>
                            <FormControl size={"small"} fullWidth error={typeError}>
                                <InputLabel>{t("word.type")}</InputLabel>
                                <Select
                                    size={"small"}
                                    variant="outlined"
                                    value={handle?.type ?? ""}
                                    label={t("word.type")}
                                    onChange={(event: SelectChangeEvent<InputDetailTypeEnum>): void => {
                                        const handleType: string = event.target.value
                                        setHandle((handle: OutputDetail | InputDetail | undefined) => ({
                                            ...handle,
                                            type: isInput ? handleType as InputDetailTypeEnum : handleType as OutputDetailTypeEnum
                                        }));
                                    }}>
                                    <MenuItem
                                        value={isInput ? InputDetailTypeEnum.String : OutputDetailTypeEnum.String}>
                                        {isInput ? InputDetailTypeEnum.String : OutputDetailTypeEnum.String}
                                    </MenuItem>
                                    <MenuItem
                                        value={isInput ? InputDetailTypeEnum.Float : OutputDetailTypeEnum.Float}>
                                        {isInput ? InputDetailTypeEnum.Float : OutputDetailTypeEnum.Float}
                                    </MenuItem>
                                    <MenuItem
                                        value={isInput ? InputDetailTypeEnum.Integer : OutputDetailTypeEnum.Integer}>
                                        {isInput ? InputDetailTypeEnum.Integer : OutputDetailTypeEnum.Integer}
                                    </MenuItem>
                                    <MenuItem
                                        value={isInput ? InputDetailTypeEnum.Object : OutputDetailTypeEnum.Object}>
                                        {isInput ? InputDetailTypeEnum.Object : OutputDetailTypeEnum.Object}
                                    </MenuItem>
                                    <MenuItem
                                        value={isInput ? InputDetailTypeEnum.FileName : OutputDetailTypeEnum.FileName}>
                                        {isInput ? InputDetailTypeEnum.FileName : OutputDetailTypeEnum.FileName}
                                    </MenuItem>
                                    <MenuItem
                                        value={isInput ? InputDetailTypeEnum.StringArray : OutputDetailTypeEnum.StringArray}>
                                        {isInput ? InputDetailTypeEnum.StringArray : OutputDetailTypeEnum.StringArray}
                                    </MenuItem>
                                    <MenuItem
                                        value={isInput ? InputDetailTypeEnum.IntegerArray : OutputDetailTypeEnum.IntegerArray}>
                                        {isInput ? InputDetailTypeEnum.IntegerArray : OutputDetailTypeEnum.IntegerArray}
                                    </MenuItem>
                                    <MenuItem
                                        value={isInput ? InputDetailTypeEnum.FloatArray : OutputDetailTypeEnum.FloatArray}>
                                        {isInput ? InputDetailTypeEnum.FloatArray : OutputDetailTypeEnum.FloatArray}
                                    </MenuItem>
                                    <MenuItem
                                        value={isInput ? InputDetailTypeEnum.ObjectArray : OutputDetailTypeEnum.ObjectArray}>
                                        {isInput ? InputDetailTypeEnum.ObjectArray : OutputDetailTypeEnum.ObjectArray}
                                    </MenuItem>
                                </Select>
                                {typeError && (
                                    <Typography paddingLeft={2} paddingTop={0.5} variant="caption"
                                                color="error">
                                        {t("word.required")}
                                    </Typography>
                                )}
                            </FormControl>
                        </Stack>
                        <Stack direction={"row"} alignItems={"center"}>
                            <InputAdornment position="start">
                                <Tooltip title={t("tooltip.communicationType") || ""}>
                                    <Info
                                        fontSize={"small"}
                                    />
                                </Tooltip>
                            </InputAdornment>
                            <FormControl size={"small"} fullWidth error={communicationTypeError}>
                                <InputLabel>{t("word.communicationType")}</InputLabel>
                                <Select
                                    size={"small"}
                                    variant="outlined"
                                    value={handle?.communicationType ?? ""}
                                    label={t("word.communicationType")}
                                    onChange={(event: SelectChangeEvent<InputDetailCommunicationTypeEnum>): void => {
                                        const handleCommunicationType: string = event.target.value;
                                        setHandle((handle: OutputDetail | InputDetail | undefined) => ({
                                            ...handle,
                                            defaultValue: (handle as InputDetail)?.defaultValue,
                                            communicationType: isInput ? handleCommunicationType as InputDetailCommunicationTypeEnum : handleCommunicationType as OutputDetailCommunicationTypeEnum
                                        }));
                                    }}>
                                    <MenuItem
                                        value={isInput ? InputDetailCommunicationTypeEnum.Stepbased : OutputDetailCommunicationTypeEnum.Stepbased}>
                                        {isInput ? InputDetailCommunicationTypeEnum.Stepbased : OutputDetailCommunicationTypeEnum.Stepbased}
                                    </MenuItem>
                                    {/* <MenuItem
                                    value={isInput ? InputDetailCommunicationTypeEnum.Event : OutputDetailCommunicationTypeEnum.Event}>
                                    {isInput ? InputDetailCommunicationTypeEnum.Event : OutputDetailCommunicationTypeEnum.Event}
                                </MenuItem>
                                <MenuItem
                                    value={isInput ? InputDetailCommunicationTypeEnum.EventStatic : OutputDetailCommunicationTypeEnum.EventStatic}>
                                    {isInput ? InputDetailCommunicationTypeEnum.EventStatic : OutputDetailCommunicationTypeEnum.EventStatic}
                                </MenuItem> */}
                                    <MenuItem
                                        value={isInput ? InputDetailCommunicationTypeEnum.StepbasedStatic : OutputDetailCommunicationTypeEnum.StepbasedStatic}>
                                        {isInput ? InputDetailCommunicationTypeEnum.StepbasedStatic : OutputDetailCommunicationTypeEnum.StepbasedStatic}
                                    </MenuItem>
                                </Select>
                                {communicationTypeError && (
                                    <Typography paddingLeft={2} paddingTop={0.5} variant="caption"
                                                color="error">
                                        {t("word.required")}
                                    </Typography>
                                )}
                            </FormControl>
                        </Stack>
                        <Stack direction={"row"} alignItems={"center"}>
                            <InputAdornment position="start">
                                <Tooltip title={t("tooltip.phase") || ""}>
                                    <Info
                                        fontSize={"small"}
                                    />
                                </Tooltip>
                            </InputAdornment>
                            <FormControl size={"small"} fullWidth error={phaseError}>
                                <InputLabel>{t("word.phase")}</InputLabel>
                                <Select
                                    size={"small"}
                                    variant="outlined"
                                    value={handle?.phase ?? ""}
                                    label={t("word.phase")}
                                    onChange={(event: SelectChangeEvent<InputDetailPhaseEnum | OutputDetailPhaseEnum>): void => {
                                        const phase: string = event.target.value;
                                        setHandle((handle: OutputDetail | InputDetail | undefined) => ({
                                            ...handle,
                                            phase: isInput ? phase as InputDetailPhaseEnum : phase as OutputDetailPhaseEnum
                                        }));
                                    }}>
                                    <MenuItem
                                        value={isInput ? InputDetailPhaseEnum.Create : OutputDetailPhaseEnum.Create}>
                                        {isInput ? InputDetailPhaseEnum.Create : OutputDetailPhaseEnum.Create}
                                    </MenuItem>
                                    <MenuItem
                                        value={isInput ? InputDetailPhaseEnum.Init : OutputDetailPhaseEnum.Init}>
                                        {isInput ? InputDetailPhaseEnum.Init : OutputDetailPhaseEnum.Init}
                                    </MenuItem>
                                    {(isInput ? (handle as InputDetail)?.communicationType !== InputDetailCommunicationTypeEnum.StepbasedStatic : (handle as OutputDetail)?.communicationType !== OutputDetailCommunicationTypeEnum.StepbasedStatic) &&
                                        <MenuItem
                                            value={isInput ? InputDetailPhaseEnum.Execute : OutputDetailPhaseEnum.Execute}>
                                            {isInput ? InputDetailPhaseEnum.Execute : OutputDetailPhaseEnum.Execute}
                                        </MenuItem>
                                    }
                                    {(isInput ? (handle as InputDetail)?.communicationType !== InputDetailCommunicationTypeEnum.StepbasedStatic : (handle as OutputDetail)?.communicationType !== OutputDetailCommunicationTypeEnum.StepbasedStatic) &&
                                        <MenuItem
                                            value={isInput ? InputDetailPhaseEnum.Finalize : OutputDetailPhaseEnum.Finalize}>
                                            {isInput ? InputDetailPhaseEnum.Finalize : OutputDetailPhaseEnum.Finalize}
                                        </MenuItem>
                                    }
                                    {(isInput ? (handle as InputDetail)?.communicationType !== InputDetailCommunicationTypeEnum.StepbasedStatic : (handle as OutputDetail)?.communicationType !== OutputDetailCommunicationTypeEnum.StepbasedStatic) &&
                                        <MenuItem
                                            value={isInput ? InputDetailPhaseEnum.Shutdown : OutputDetailPhaseEnum.Shutdown}>
                                            {isInput ? InputDetailPhaseEnum.Shutdown : OutputDetailPhaseEnum.Shutdown}
                                        </MenuItem>
                                    }
                                </Select>
                                {phaseError && (
                                    <Typography paddingLeft={2} paddingTop={0.5} variant="caption"
                                                color="error">
                                        {t("word.required")}
                                    </Typography>
                                )}
                            </FormControl>
                        </Stack>
                        {isInput && (handle as InputDetail)?.communicationType !== InputDetailCommunicationTypeEnum.StepbasedStatic &&
                            <Stack direction={"row"} alignItems={"center"}>
                                <InputAdornment position="start">
                                    <Tooltip title={t("tooltip.startValue") || ""}>
                                        <Info
                                            fontSize={"small"}
                                        />
                                    </Tooltip>
                                </InputAdornment>
                                <TextField
                                    size={"small"}
                                    fullWidth={true}
                                    label={t("word.startValue")}
                                    value={(handle as InputDetail)?.startValue ?? ""}
                                    variant="outlined"
                                    required={false}
                                    onChange={(event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): void => {
                                        setHandle((handle: OutputDetail | InputDetail | undefined) => ({
                                            ...handle,
                                            startValue: event.target.value
                                        }));
                                    }}
                                />
                            </Stack>
                        }
                        {isInput &&
                            <Stack direction={"row"} alignItems={"center"}>
                                <InputAdornment position="start">
                                    <Tooltip title={t("tooltip.defaultValue") || ""}>
                                        <Info
                                            fontSize={"small"}
                                        />
                                    </Tooltip>
                                </InputAdornment>
                                <TextField
                                    size={"small"}
                                    fullWidth={true}
                                    label={t("word.defaultValue")}
                                    error={modelVarnameError}
                                    helperText={modelVarnameError ? t("word.required") : ""}
                                    value={(handle as InputDetail)?.defaultValue ?? ""}
                                    variant="outlined"
                                    required={true}
                                    onChange={(event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): void => {
                                        setHandle((handle: OutputDetail | InputDetail | undefined) => ({
                                            ...handle,
                                            defaultValue: event.target.value
                                        }));
                                    }}
                                />
                            </Stack>
                        }
                    </Stack>
                    <Box sx={{display: "flex", justifyContent: "flex-end"}}>
                        <Button
                            onClick={(): void => handleAddInput()}
                            sx={{mb: 2, ml: 2}}
                            color={"primary"}>
                            {t("action.add")}
                        </Button>
                    </Box>
                </Box>
            </Dialog>
        </Fragment>
    );
};

export default AddHandleDialog;
