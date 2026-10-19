import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Autocomplete,
    Box,
    Button,
    Card,
    Divider,
    FormLabel,
    IconButton,
    Paper,
    Stack,
    TextField,
    Theme,
    Tooltip,
    Typography,
    useTheme
} from "@mui/material";
import {toInt} from "validator";
import React, {Dispatch, Fragment, ReactNode, SetStateAction, useContext, useEffect, useState} from "react";
import {BlockDetail, StepBasedConfigurationDetail} from "@kit-iai-proof/proof-config-manager-client";
import {useTranslation} from "react-i18next";
import Grid from "@mui/material/Grid2";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {IAppContext} from "../../../../provider/AppProvider.tsx";
import {Info} from "@mui/icons-material";
import {AppContext} from "../../../../provider/AppContext.tsx";

interface IProps {
    blocks: BlockDetail[] | undefined,
    stepBasedConfig: StepBasedConfigurationDetail | undefined,
    setStepBasedConfig: (stepBasedConfig: StepBasedConfigurationDetail | undefined) => void,
    keyErrors: { [key: string]: boolean },
    setKeyErrors: Dispatch<SetStateAction<{ [p: string]: boolean }>>
}

const WorkflowStepBasedConfigPanel: ({
                                         blocks,
                                         stepBasedConfig,
                                         setStepBasedConfig,
                                         keyErrors,
                                         setKeyErrors
                                     }: IProps) => ReactNode = ({
                                                                    blocks,
                                                                    stepBasedConfig,
                                                                    setStepBasedConfig,
                                                                    keyErrors,
                                                                    setKeyErrors
                                                                }: IProps): ReactNode => {

    const {t} = useTranslation();
    const theme: Theme = useTheme();
    const {hasUnsavedChanges, updateHasUnsavedChanges} = useContext<IAppContext>(AppContext);

    const [editingKeys, setEditingKeys] = useState<{ [originalKey: string]: string }>({});
    const [definitionsExpanded, setDefinitionsExpanded] = useState<Record<string, boolean>>({});
    const [editingStepSizeKeys, setEditingStepSizeKeys] = useState<{
        [stepSizeDefinitionId: string]: { [id: string]: string }
    }>({});

    useEffect(() => {
        if (stepBasedConfig?.stepSizeDefinitions) {
            const definitionKeys = Object.keys(stepBasedConfig.stepSizeDefinitions);
            const initialEditingKeys = definitionKeys.reduce((acc, key) => {
                acc[key] = key;
                return acc;
            }, {} as { [originalKey: string]: string });

            setEditingKeys(initialEditingKeys);
        }
    }, [stepBasedConfig?.stepSizeDefinitions]);

    return (
        <Fragment>
            <Paper sx={{background: theme.palette.elevated.default}}>
                <Box padding={2}>
                    <Typography variant={"subtitle1"}>
                        {t("word.stepBasedConfiguration")}
                        <Tooltip title={t("tooltip.stepBasedConfiguration")}>
                            <Info
                                sx={{ml: 1, cursor: "pointer"}}
                                fontSize={"small"}
                            />
                        </Tooltip>
                    </Typography>
                    <Stack padding={2} spacing={1}>
                        <TextField
                            fullWidth={true}
                            size="small"
                            variant={"outlined"}
                            type={"number"}
                            label={
                                <Stack direction={"row"}>
                                    <Typography>
                                        {t("word.startTime")}
                                    </Typography>
                                    <Tooltip title={t("tooltip.startTime")}>
                                        <Info
                                            fontSize={"small"}
                                            sx={{ml: 1, cursor: "pointer"}}
                                        />
                                    </Tooltip>
                                </Stack>
                            }
                            value={stepBasedConfig?.startTime ?? ""}
                            onChange={(event) => {
                                if (!hasUnsavedChanges) updateHasUnsavedChanges(true)
                                setStepBasedConfig({
                                    ...stepBasedConfig,
                                    startTime: event.target.value === "" ? undefined : toInt(event.target.value)
                                })
                            }}
                        />
                        <TextField
                            fullWidth={true}
                            size="small"
                            variant={"outlined"}
                            type={"number"}
                            label={
                                <Stack direction={"row"}>
                                    <Typography>
                                        {t("word.endTime")}
                                    </Typography>
                                    <Tooltip title={t("tooltip.endTime")}>
                                        <Info
                                            fontSize={"small"}
                                            sx={{ml: 1, cursor: "pointer"}}
                                        />
                                    </Tooltip>
                                </Stack>
                            }
                            value={stepBasedConfig?.endTime ?? ""}
                            onChange={(event) => {
                                if (!hasUnsavedChanges) updateHasUnsavedChanges(true)
                                setStepBasedConfig({
                                    ...stepBasedConfig,
                                    endTime: event.target.value === "" ? undefined : toInt(event.target.value)
                                })
                            }}
                        />
                        <TextField
                            fullWidth={true}
                            size="small"
                            variant={"outlined"}
                            type={"number"}
                            label={
                                <Stack direction={"row"}>
                                    <Typography>
                                        {t("word.simulationStartPoint")}
                                    </Typography>
                                    <Tooltip title={t("tooltip.simulationStartPoint")}>
                                        <Info
                                            fontSize={"small"}
                                            sx={{ml: 1, cursor: "pointer"}}
                                        />
                                    </Tooltip>
                                </Stack>
                            }
                            value={stepBasedConfig?.startPoint ?? ""}
                            onChange={(event) => {
                                if (!hasUnsavedChanges) updateHasUnsavedChanges(true)
                                setStepBasedConfig({
                                    ...stepBasedConfig,
                                    startPoint: event.target.value === "" ? undefined : toInt(event.target.value)
                                })
                            }}
                        />
                        <TextField
                            fullWidth={true}
                            size="small"
                            variant={"outlined"}
                            type={"number"}
                            label={
                                <Stack direction={"row"}>
                                    <Typography>
                                        {t("word.simulationEndPoint")}
                                    </Typography>
                                    <Tooltip title={t("tooltip.simulationEndPoint")}>
                                        <Info
                                            fontSize={"small"}
                                            sx={{ml: 1, cursor: "pointer"}}
                                        />
                                    </Tooltip>
                                </Stack>
                            }
                            value={stepBasedConfig?.endPoint ?? ""}
                            onChange={(event) => {
                                if (!hasUnsavedChanges) updateHasUnsavedChanges(true)
                                setStepBasedConfig({
                                    ...stepBasedConfig,
                                    endPoint: event.target.value === "" ? undefined : toInt(event.target.value)
                                })
                            }}
                        />
                        <TextField
                            fullWidth={true}
                            size="small"
                            variant={"outlined"}
                            type={"number"}
                            label={
                                <Stack direction={"row"}>
                                    <Typography>
                                        {t("word.simulationDefaultStepSize")}
                                    </Typography>
                                    <Tooltip title={t("tooltip.simulationDefaultStepSize")}>
                                        <Info
                                            fontSize={"small"}
                                            sx={{ml: 1, cursor: "pointer"}}
                                        />
                                    </Tooltip>
                                </Stack>
                            }
                            value={stepBasedConfig?.defaultStepSize ?? ""}
                            onChange={(event) => {
                                if (!hasUnsavedChanges) updateHasUnsavedChanges(true)
                                setStepBasedConfig({
                                    ...stepBasedConfig,
                                    defaultStepSize: event.target.value === "" ? undefined : toInt(event.target.value)
                                })
                            }}
                        />
                        <Stack direction={"row"} alignItems={"center"} spacing={1}>
                            <TextField
                                fullWidth={true}
                                size="small"
                                variant={"outlined"}
                                type={"number"}
                                label={
                                    <Stack direction={"row"}>
                                        <Typography>
                                            {t("word.duration")}
                                        </Typography>
                                        <Tooltip title={t("tooltip.duration")}>
                                            <Info
                                                fontSize={"small"}
                                                sx={{ml: 1, cursor: "pointer"}}
                                            />
                                        </Tooltip>
                                    </Stack>
                                }
                                value={stepBasedConfig?.duration ?? ""}
                                onChange={(event) => {
                                    if (!hasUnsavedChanges) updateHasUnsavedChanges(true)
                                    setStepBasedConfig({
                                        ...stepBasedConfig,
                                        duration: event.target.value === "" ? undefined : toInt(event.target.value)
                                    })
                                }}
                            />
                            <FormLabel color={"primary"} sx={{fontSize: "0.875rem"}}>ms</FormLabel>
                        </Stack>
                        <Stack direction={"row"} alignItems={"center"} spacing={2}>
                            <TextField
                                fullWidth={true}
                                size="small"
                                variant={"outlined"}
                                type={"number"}
                                label={
                                    <Stack direction={"row"}>
                                        <Typography>
                                            {t("word.timeoutWorker")}
                                        </Typography>
                                        <Tooltip title={t("tooltip.timeoutWorker")}>
                                            <Info
                                                fontSize={"small"}
                                                sx={{ml: 1, cursor: "pointer"}}
                                            />
                                        </Tooltip>
                                    </Stack>
                                }
                                value={stepBasedConfig?.workerTimeout ?? ""}
                                onChange={(event) => {
                                    if (!hasUnsavedChanges) updateHasUnsavedChanges(true)
                                    setStepBasedConfig({
                                        ...stepBasedConfig,
                                        workerTimeout: event.target.value === "" ? undefined : parseInt(event.target.value)
                                    })
                                }}
                            />
                            <FormLabel color={"primary"} sx={{fontSize: "0.875rem"}}>s</FormLabel>
                        </Stack>
                        <Stack direction={"row"} alignItems={"center"} spacing={2}>
                            <TextField
                                fullWidth={true}
                                size="small"
                                variant={"outlined"}
                                type={"number"}
                                label={
                                    <Stack direction={"row"}>
                                        <Typography>
                                            {t("word.timeoutInput")}
                                        </Typography>
                                        <Tooltip title={t("tooltip.timeoutInput")}>
                                            <Info
                                                fontSize={"small"}
                                                sx={{ml: 1, cursor: "pointer"}}
                                            />
                                        </Tooltip>
                                    </Stack>
                                }
                                value={stepBasedConfig?.inputTimeout ?? ""}
                                onChange={(event) => {
                                    if (!hasUnsavedChanges) updateHasUnsavedChanges(true)
                                    setStepBasedConfig({
                                        ...stepBasedConfig,
                                        inputTimeout: event.target.value === "" ? undefined : parseInt(event.target.value)
                                    })
                                }}
                            />
                            <FormLabel color={"primary"} sx={{fontSize: "0.875rem"}}>s</FormLabel>
                        </Stack>
                    </Stack>
                    <Card sx={{padding: 2, margin: 2}}>
                        <Stack paddingX={2}>
                            <Stack direction={"row"} display={"flex"} alignItems={"center"}
                                   justifyContent={"space-between"}>
                                <Typography variant={"subtitle1"}>
                                    {t("word.stepSizeDefinitions")}
                                    <Tooltip title={t("tooltip.stepSizeDefinitions")}>
                                        <Info
                                            sx={{ml: 1, cursor: "pointer"}}
                                            fontSize={"small"}
                                        />
                                    </Tooltip>
                                </Typography>
                                <Button
                                    variant="outlined"
                                    disabled={
                                        // Disable if all blocks already have definitions
                                        blocks?.every(block =>
                                            String(block.index) in (stepBasedConfig?.stepSizeDefinitions ?? {})
                                        ) ?? true
                                    }
                                    onClick={() => {
                                        if (!hasUnsavedChanges) updateHasUnsavedChanges(true)
                                        const existingDefinitions = stepBasedConfig?.stepSizeDefinitions ?? {};

                                        // Find the first available block index that doesn't have a definition yet
                                        const availableBlock = blocks?.find(block =>
                                            !(String(block.index) in existingDefinitions)
                                        );

                                        if (!availableBlock) return;

                                        const newKey = String(availableBlock.index);
                                        const newDefinition = {
                                            step: "",
                                            startPoint: 0,
                                            endPoint: 1,
                                            defaultSize: 1
                                        };

                                        const updated = {
                                            ...existingDefinitions,
                                            [newKey]: newDefinition
                                        };

                                        setStepBasedConfig?.({
                                            ...stepBasedConfig!,
                                            stepSizeDefinitions: updated
                                        });
                                    }}
                                >
                                    {t("action.add")}
                                </Button>
                            </Stack>
                            {
                                stepBasedConfig?.stepSizeDefinitions && Object.entries(stepBasedConfig.stepSizeDefinitions).map(([key, value]) => (
                                    <Accordion
                                        key={key}
                                        expanded={definitionsExpanded[key]}
                                        onChange={() => setDefinitionsExpanded(prev => ({...prev, [key]: !prev[key]}))}
                                        disableGutters={true}
                                        sx={{
                                            mt: 2,
                                            backgroundColor: theme.palette.elevated.default,
                                            borderRadius: 2,
                                            '&:before': {display: 'none'}
                                        }}
                                    >
                                        <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                                            <Stack direction="row" alignItems="center" spacing={1} sx={{width: '100%'}}>
                                                <Typography sx={{flexGrow: 1}}>
                                                    {blocks?.find(block => String(block.index) === (editingKeys[key] ?? key))?.label ?? `${t("word.blockIndex")}: ${key}`} (Index: {editingKeys[key] ?? key})
                                                </Typography>
                                                <Button
                                                    variant="outlined"
                                                    color="primary"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (!hasUnsavedChanges) updateHasUnsavedChanges(true)
                                                        const updated = {...stepBasedConfig?.stepSizeDefinitions};
                                                        delete updated[key];

                                                        setStepBasedConfig?.({
                                                            ...stepBasedConfig!,
                                                            stepSizeDefinitions: updated
                                                        });
                                                    }}
                                                >
                                                    {t("action.delete")}
                                                </Button>
                                            </Stack>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <Box sx={{mb: 2}}>
                                                <Typography
                                                    variant="subtitle2"
                                                    sx={{mb: 2}}
                                                    gutterBottom
                                                >
                                                    {t("word.stepSizeDefinitionKey")}
                                                    <Tooltip title={t("tooltip.stepSizeDefinitionKey")}>
                                                        <Info
                                                            sx={{ml: 1, cursor: "pointer"}}
                                                            fontSize={"small"}
                                                        />
                                                    </Tooltip>
                                                </Typography>
                                                <Grid container spacing={1}>
                                                    <Grid size={1}>
                                                        <TextField
                                                            fullWidth
                                                            size="small"
                                                            variant="outlined"
                                                            label={t("word.blockIndex")}
                                                            error={keyErrors[key]}
                                                            helperText={keyErrors[key] ? t("word.sameBlockIndex") : ""}
                                                            value={editingKeys[key] ?? key}
                                                            disabled={true}
                                                            sx={{
                                                                '& .MuiInputLabel-root': {
                                                                    color: 'text.disabled',
                                                                },
                                                                '& .MuiInputBase-input': {
                                                                    color: 'text.disabled',
                                                                }
                                                            }}
                                                        />
                                                    </Grid>
                                                    <Grid size={11}>
                                                        <Autocomplete
                                                            size="small"
                                                            value={blocks?.find(block => String(block.index) === (editingKeys[key] ?? key)) ? {
                                                                label: `${blocks.find(block => String(block.index) === (editingKeys[key] ?? key))?.label ?? 'Block'} (Index: ${editingKeys[key] ?? key})`,
                                                                value: editingKeys[key] ?? key
                                                            } : null}
                                                            options={blocks?.map(block => ({
                                                                label: `${block.label ?? 'Block'} (Index: ${block.index})`,
                                                                value: String(block.index)
                                                            })) ?? []}
                                                            getOptionLabel={(option) => option.label}
                                                            isOptionEqualToValue={(option, value) => option.value === value.value}
                                                            renderInput={(params) => (
                                                                <TextField
                                                                    {...params}
                                                                    label={t("action.selectBlock")}
                                                                />
                                                            )}
                                                            onChange={(_, selectedOption) => {
                                                                if (selectedOption) {
                                                                    if (!hasUnsavedChanges) updateHasUnsavedChanges(true);
                                                                    const blockIndex = selectedOption.value;

                                                                    // Check if this block index already exists (and it's not the current one)
                                                                    const currentDefinitions = stepBasedConfig?.stepSizeDefinitions ?? {};
                                                                    if (blockIndex in currentDefinitions && blockIndex !== key) {
                                                                        setKeyErrors(prev => ({...prev, [key]: true}));
                                                                        return;
                                                                    }

                                                                    setKeyErrors(prev => {
                                                                        const newErrors = {...prev};
                                                                        delete newErrors[key];
                                                                        return newErrors;
                                                                    });

                                                                    // Update the key
                                                                    const updated = {...currentDefinitions};
                                                                    updated[blockIndex] = updated[key];
                                                                    if (blockIndex !== key) {
                                                                        delete updated[key];
                                                                    }

                                                                    setStepBasedConfig?.({
                                                                        ...stepBasedConfig!,
                                                                        stepSizeDefinitions: updated,
                                                                    });

                                                                    // Update editing keys
                                                                    setEditingKeys(prev => {
                                                                        const newEditingKeys = {...prev};
                                                                        delete newEditingKeys[key];
                                                                        return newEditingKeys;
                                                                    });
                                                                }
                                                            }}
                                                        />
                                                    </Grid>
                                                </Grid>
                                            </Box>

                                            <Divider sx={{mb: 1}}/>

                                            <Box>
                                                <Typography variant="subtitle2" gutterBottom>
                                                    {t("word.stepSizeDefinitionValue")}
                                                    <Tooltip title={t("tooltip.stepSizeDefinitionValue")}>
                                                        <Info
                                                            sx={{ml: 1, cursor: "pointer"}}
                                                            fontSize={"small"}
                                                        />
                                                    </Tooltip>
                                                </Typography>
                                                <Stack spacing={1} padding={2}>
                                                    <TextField
                                                        fullWidth
                                                        size="small"
                                                        type="number"
                                                        variant="outlined"
                                                        label={
                                                            <Stack direction={"row"}>
                                                                <Typography>
                                                                    {t("word.blockStartPoint")}
                                                                </Typography>
                                                                <Tooltip title={t("tooltip.blockStartPoint")}>
                                                                    <Info
                                                                        fontSize={"small"}
                                                                        sx={{ml: 1, cursor: "pointer"}}
                                                                    />
                                                                </Tooltip>
                                                            </Stack>
                                                        }
                                                        value={value.startPoint ?? ""}
                                                        onChange={(e) => {
                                                            if (!hasUnsavedChanges) updateHasUnsavedChanges(true)
                                                            const updated = {
                                                                ...stepBasedConfig?.stepSizeDefinitions,
                                                                [key]: {
                                                                    ...value,
                                                                    startPoint: e.target.value === "" ? undefined : toInt(e.target.value),
                                                                },
                                                            };
                                                            setStepBasedConfig?.({
                                                                ...stepBasedConfig!,
                                                                stepSizeDefinitions: updated,
                                                            });
                                                        }}
                                                    />
                                                    <TextField
                                                        fullWidth
                                                        size="small"
                                                        type="number"
                                                        variant="outlined"
                                                        label={
                                                            <Stack direction={"row"}>
                                                                <Typography>
                                                                    {t("word.blockEndPoint")}
                                                                </Typography>
                                                                <Tooltip title={t("tooltip.blockEndPoint")}>
                                                                    <Info
                                                                        fontSize={"small"}
                                                                        sx={{ml: 1, cursor: "pointer"}}
                                                                    />
                                                                </Tooltip>
                                                            </Stack>
                                                        }
                                                        value={value.endPoint ?? ""}
                                                        onChange={(e) => {
                                                            if (!hasUnsavedChanges) updateHasUnsavedChanges(true)
                                                            const updated = {
                                                                ...stepBasedConfig?.stepSizeDefinitions,
                                                                [key]: {
                                                                    ...value,
                                                                    endPoint: e.target.value === "" ? undefined : toInt(e.target.value),
                                                                },
                                                            };
                                                            setStepBasedConfig?.({
                                                                ...stepBasedConfig!,
                                                                stepSizeDefinitions: updated,
                                                            });
                                                        }}
                                                    />
                                                    <TextField
                                                        fullWidth
                                                        size="small"
                                                        type="number"
                                                        variant="outlined"
                                                        label={
                                                            <Stack direction={"row"}>
                                                                <Typography>
                                                                    {t("word.blockDefaultStepSize")}
                                                                </Typography>
                                                                <Tooltip title={t("tooltip.blockDefaultStepSize")}>
                                                                    <Info
                                                                        fontSize={"small"}
                                                                        sx={{ml: 1, cursor: "pointer"}}
                                                                    />
                                                                </Tooltip>
                                                            </Stack>
                                                        }
                                                        value={value.defaultSize ?? ""}
                                                        onChange={(e) => {
                                                            if (!hasUnsavedChanges) updateHasUnsavedChanges(true)
                                                            const updated = {
                                                                ...stepBasedConfig?.stepSizeDefinitions,
                                                                [key]: {
                                                                    ...value,
                                                                    defaultSize: e.target.value === "" ? undefined : toInt(e.target.value),
                                                                },
                                                            };
                                                            setStepBasedConfig?.({
                                                                ...stepBasedConfig!,
                                                                stepSizeDefinitions: updated,
                                                            });
                                                        }}
                                                    />
                                                    <Stack paddingX={2} spacing={1}>
                                                        <Typography variant="subtitle2">
                                                            {t("word.stepSizes")}
                                                            <Tooltip title={t("tooltip.stepSizes")}>
                                                                <Info
                                                                    sx={{ml: 1, cursor: "pointer"}}
                                                                    fontSize={"small"}
                                                                />
                                                            </Tooltip>
                                                        </Typography>
                                                        {value.stepSizes && Object.entries(value.stepSizes).map(([stepSizeKey, stepSizeValue], index) => (
                                                            <Grid
                                                                container
                                                                key={`stepSize-${index}`}
                                                                spacing={1}
                                                                alignItems="center"
                                                            >
                                                                <Grid size={5}>
                                                                    <TextField
                                                                        fullWidth
                                                                        size="small"
                                                                        variant="outlined"
                                                                        label={
                                                                            <Stack direction={"row"}>
                                                                                <Typography>
                                                                                    {t("word.stepSizeKey")}
                                                                                </Typography>
                                                                                <Tooltip title={t("tooltip.stepSizeKey")}>
                                                                                    <Info
                                                                                        fontSize={"small"}
                                                                                        sx={{ml: 1, cursor: "pointer"}}
                                                                                    />
                                                                                </Tooltip>
                                                                            </Stack>
                                                                        }
                                                                        value={editingStepSizeKeys[key]?.[stepSizeKey] ?? stepSizeKey}
                                                                        onChange={(e) => {
                                                                            if (!hasUnsavedChanges) updateHasUnsavedChanges(true)
                                                                            setEditingStepSizeKeys(prev => ({
                                                                                ...prev,
                                                                                [key]: {
                                                                                    ...(prev[key] ?? {}),
                                                                                    [stepSizeKey]: e.target.value
                                                                                }
                                                                            }));
                                                                        }}
                                                                        onBlur={() => {
                                                                            if (!hasUnsavedChanges) updateHasUnsavedChanges(true)
                                                                            const newKey = editingStepSizeKeys[key]?.[stepSizeKey];
                                                                            if (!newKey || newKey === stepSizeKey) return;

                                                                            const updatedStepSizes = {...value.stepSizes};

                                                                            if (newKey in updatedStepSizes && newKey !== stepSizeKey) {
                                                                                return;
                                                                            }

                                                                            updatedStepSizes[newKey] = updatedStepSizes[stepSizeKey];
                                                                            delete updatedStepSizes[stepSizeKey];

                                                                            const updatedStepDefinitions = {
                                                                                ...stepBasedConfig?.stepSizeDefinitions,
                                                                                [key]: {
                                                                                    ...value,
                                                                                    stepSizes: updatedStepSizes,
                                                                                },
                                                                            };

                                                                            setEditingStepSizeKeys(prev => {
                                                                                const defMap = {...(prev[key] ?? {})};
                                                                                delete defMap[stepSizeKey];

                                                                                return {
                                                                                    ...prev,
                                                                                    [key]: defMap
                                                                                };
                                                                            });

                                                                            setStepBasedConfig?.({
                                                                                ...stepBasedConfig!,
                                                                                stepSizeDefinitions: updatedStepDefinitions
                                                                            });
                                                                        }}
                                                                    />
                                                                </Grid>
                                                                <Grid size={5}>
                                                                    <TextField
                                                                        fullWidth
                                                                        size="small"
                                                                        variant="outlined"
                                                                        label={
                                                                            <Stack direction={"row"}>
                                                                                <Typography>
                                                                                    {t("word.stepSizeValue")}
                                                                                </Typography>
                                                                                <Tooltip title={t("tooltip.stepSizeValue")}>
                                                                                    <Info
                                                                                        fontSize={"small"}
                                                                                        sx={{ml: 1, cursor: "pointer"}}
                                                                                    />
                                                                                </Tooltip>
                                                                            </Stack>
                                                                        }
                                                                        type="number"
                                                                        value={stepSizeValue ?? ""}
                                                                        onChange={(e) => {
                                                                            if (!hasUnsavedChanges) updateHasUnsavedChanges(true)
                                                                            const updatedStepSizes = {
                                                                                ...value.stepSizes,
                                                                                [stepSizeKey]: e.target.value === "" ? 0 : toInt(e.target.value)
                                                                            };

                                                                            const updatedStepDefinitions = {
                                                                                ...stepBasedConfig?.stepSizeDefinitions,
                                                                                [key]: {
                                                                                    ...value,
                                                                                    stepSizes: updatedStepSizes
                                                                                }
                                                                            };

                                                                            setStepBasedConfig?.({
                                                                                ...stepBasedConfig!,
                                                                                stepSizeDefinitions: updatedStepDefinitions
                                                                            });
                                                                        }}
                                                                    />
                                                                </Grid>
                                                                <Grid size={2}>
                                                                    <IconButton
                                                                        onClick={() => {
                                                                            if (!hasUnsavedChanges) updateHasUnsavedChanges(true)
                                                                            const updatedStepSizes = {...value.stepSizes};
                                                                            delete updatedStepSizes[stepSizeKey];

                                                                            const updatedStepDefinitions = {
                                                                                ...stepBasedConfig?.stepSizeDefinitions,
                                                                                [key]: {
                                                                                    ...value,
                                                                                    stepSizes: updatedStepSizes
                                                                                }
                                                                            };

                                                                            setStepBasedConfig?.({
                                                                                ...stepBasedConfig!,
                                                                                stepSizeDefinitions: updatedStepDefinitions
                                                                            });
                                                                        }}
                                                                    >
                                                                        <DeleteIcon color="error"/>
                                                                    </IconButton>
                                                                </Grid>
                                                            </Grid>
                                                        ))}

                                                        <Grid size={1}>
                                                            <Button
                                                                variant="outlined"
                                                                onClick={() => {
                                                                    if (!hasUnsavedChanges) updateHasUnsavedChanges(true)
                                                                    const newKey = `${Object.keys(value.stepSizes ?? {}).length + 1}`;

                                                                    const updatedStepSizes = {
                                                                        ...(value.stepSizes ?? {}),
                                                                        [newKey]: 1
                                                                    };

                                                                    const updatedStepDefinitions = {
                                                                        ...stepBasedConfig?.stepSizeDefinitions,
                                                                        [key]: {
                                                                            ...value,
                                                                            stepSizes: updatedStepSizes
                                                                        }
                                                                    };

                                                                    setStepBasedConfig?.({
                                                                        ...stepBasedConfig!,
                                                                        stepSizeDefinitions: updatedStepDefinitions
                                                                    });
                                                                }}
                                                            >
                                                                {t("action.addStepSize")}
                                                            </Button>
                                                        </Grid>
                                                    </Stack>

                                                </Stack>
                                            </Box>
                                        </AccordionDetails>
                                    </Accordion>
                                ))}
                        </Stack>
                    </Card>
                </Box>
            </Paper>
        </Fragment>
    )
}

export default React.memo(WorkflowStepBasedConfigPanel);