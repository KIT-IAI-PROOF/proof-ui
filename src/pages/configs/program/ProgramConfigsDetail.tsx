import {useTranslation} from "react-i18next";
import {NavigateFunction, useNavigate, useParams} from "react-router-dom";
import {ChangeEvent, Fragment, ReactNode, useContext, useEffect, useState} from "react";
import {Box, Button, Divider, FormControl, IconButton, InputLabel, MenuItem, Paper, Select, SelectChangeEvent, Stack, TextField, Theme, Tooltip, Typography, useTheme} from "@mui/material";
import Grid from "@mui/material/Grid2";
import DeleteIcon from '@mui/icons-material/Delete';
import {AttachmentDetail, ProgramDetail, ProgramDetailRuntimeEnum} from "@kit-iai-proof/proof-config-manager-client";
import AddIcon from "@mui/icons-material/Add";
import {EditNoteRounded, Info} from "@mui/icons-material";
import PageHeader from "../../../app/components/PageHeader.tsx";
import {useMutation, UseMutationResult, useQuery, useQueryClient, UseQueryResult} from "@tanstack/react-query";
import ConfirmDialog from "../../../app/components/ConfirmDialog.tsx";
import AddAttachmentsDialog from "../components/program/AddAttachmentsDialog.tsx";
import {IAppContext} from "../../../provider/AppProvider.tsx";
import {AppContext} from "../../../provider/AppContext.tsx";
import dayjs from "dayjs";
import {AxiosError} from "axios";
import {ENTITY_TYPES, INVALIDATION_KEYS, PAGE_CONTAINER_PADDING, PROGRAMS_KEY} from "../../../utils/constants.ts";
import {programService} from "../../../services/instances.ts";
import {v4 as uuidv4} from "uuid";
import {getErrorMessage} from "../../../utils/error.ts";
import {programQueryOptions} from "../../../query/options/programQueryOptions.tsx";
import LabeledFieldsGrid from "../../../app/components/LabeledFieldsGrid.tsx";
import LabeledField from "../../../app/components/LabeledField.tsx";

const ProgramConfigsDetail: () => ReactNode = (): ReactNode => {

    const theme: Theme = useTheme();
    const {t} = useTranslation();
    const navigate: NavigateFunction = useNavigate();
    const {programId} = useParams();
    const queryClient = useQueryClient();
    const {
        hasUnsavedChanges,
        sessionKey,
        updateHasUnsavedChanges,
        updateError,
        updateAllowNavigation
    } = useContext<IAppContext>(AppContext);

    const [label, setLabel] = useState<string | undefined>(undefined);
    const [description, setDescription] = useState<string | undefined>(undefined);
    const [entryPoint, setEntryPoint] = useState<string | undefined>(undefined);
    const [runTime, setRunTime] = useState<ProgramDetailRuntimeEnum | undefined>(ProgramDetailRuntimeEnum.Python);
    const [programAttachments, setProgramAttachments] = useState<AttachmentDetail[] | undefined>(undefined);
    const [addAttachment, setAddAttachment] = useState<boolean>(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
    const [labelError, setLabelError] = useState(false);
    const [entryPointError, setEntryPointError] = useState(false);

    const {data: program}: UseQueryResult<ProgramDetail, AxiosError> = useQuery(programQueryOptions(programId));

    const programMutation: UseMutationResult<ProgramDetail, AxiosError, ProgramDetail, any> = useMutation({
        retry: false,
        mutationFn: async (program: ProgramDetail): Promise<ProgramDetail> => {
            if (program.id) return await programService.updateProgram(program.id, program, undefined, sessionKey);
            else return await programService.saveProgram({...program, id: uuidv4()}, undefined, sessionKey);
        },
        onMutate: async (): Promise<void> => {
            return await queryClient.cancelQueries({queryKey: [PROGRAMS_KEY]});
        },
        onSuccess: async (result: ProgramDetail): Promise<void> => {
            for (const queryKey of INVALIDATION_KEYS[PROGRAMS_KEY]) await queryClient.invalidateQueries({
                queryKey: [queryKey],
                exact: false
            });
            await queryClient.setQueryData([PROGRAMS_KEY, result.id], result);
        },
        onError: (error: AxiosError): void => {
            updateError(getErrorMessage(error, ENTITY_TYPES[PROGRAMS_KEY], t));
        }
    });

    const programDeletion: UseMutationResult<boolean, AxiosError, string, void> = useMutation({
        retry: false,
        mutationFn: async (programId: string): Promise<boolean> => {
            return await programService.deleteProgram(programId, undefined, sessionKey);
        },
        onSuccess: async (): Promise<void> => {
            for (const queryKey of INVALIDATION_KEYS[PROGRAMS_KEY]) await queryClient.invalidateQueries({
                queryKey: [queryKey],
                exact: false
            });
        },
        onError: (error: AxiosError): void => {
            updateError(getErrorMessage(error, ENTITY_TYPES[PROGRAMS_KEY], t));
        }
    });

    const handleSave = async () => {
        let valid = true;

        if (!label || label.trim() === "") {
            setLabelError(true);
            valid = false;
        } else {
            setLabelError(false);
        }

        if (!entryPoint || entryPoint.trim() === "") {
            setEntryPointError(true);
            valid = false;
        } else {
            setEntryPointError(false);
        }

        if (!valid) return;

        if (programId) {
            await programMutation.mutateAsync({
                ...program,
                label,
                description,
                entryPoint,
                runtime: runTime,
                attachments: programAttachments
            }).finally(() => {
                if (hasUnsavedChanges) updateHasUnsavedChanges(false);
            });
        } else {
            updateAllowNavigation(true);
            await programMutation
                .mutateAsync({
                    ...program,
                    label,
                    description,
                    entryPoint,
                    runtime: runTime,
                    attachments: programAttachments
                })
                .then(() => {
                    if (hasUnsavedChanges) updateHasUnsavedChanges(false);
                    updateAllowNavigation(false);
                    navigate("/configs/programs");
                });
        }
    };

    useEffect((): void => {
        setLabel(program?.label ?? "");
        setDescription(program?.description ?? "");
        setEntryPoint(program?.entryPoint ?? "");
        setRunTime(program?.runtime ?? ProgramDetailRuntimeEnum.Python);
        setProgramAttachments(program?.attachments ?? []);
    }, [program?.attachments, program?.description, program?.entryPoint, program?.label, program?.runtime]);

    useEffect((): void => {
        if (programAttachments && programAttachments.length === 0) {
            setEntryPoint("");
        }
    }, [programAttachments, entryPoint]);

    return (
        <Fragment>
            <Box
                {...PAGE_CONTAINER_PADDING}
            >
                <Paper elevation={0}>
                    <Box padding={3}>
                        <PageHeader
                            icon={
                                <Fragment>
                                    <EditNoteRounded
                                        color={"primary"}
                                        fontSize={"large"}
                                    />
                                </Fragment>
                            }
                            headerKey={"page.header.configs.program"}
                            tooltipTitle={t("tooltip.program")}
                            subHeaderValue={program?.label ?? ""}
                            buttons={
                                <Fragment>
                                    <Button
                                        variant={"outlined"}
                                        onClick={async (): Promise<void> => {
                                            navigate('/configs/programs');
                                        }}
                                        color={"primary"}>
                                        {t("action.close")}
                                    </Button>
                                    <Button
                                        disabled={!!programId && !hasUnsavedChanges}
                                        variant={"outlined"}
                                        onClick={handleSave}
                                        color={"primary"}>
                                        {programId ? t("action.save") : t("action.create")}
                                    </Button>
                                    {
                                        programId && <Button
                                            variant={"outlined"}
                                            color={"error"}
                                            onClick={(): void => {
                                                setDeleteDialogOpen(true)
                                            }}
                                        >
                                            {t("action.delete")}
                                        </Button>
                                    }
                                </Fragment>
                            }
                        />
                        <Divider/>
                        <LabeledFieldsGrid>
                            {
                                programId && <LabeledField labelKey={"word.id"} tooltipKey={"tooltip.id"}>
                                    <TextField
                                        fullWidth={true}
                                        value={program?.id ?? ""}
                                        size={"small"}
                                        label={t("word.id")}
                                        variant="outlined"
                                        disabled/>
                                </LabeledField>
                            }
                            <LabeledField labelKey={"word.label"} tooltipKey={"tooltip.label"} required={true}>
                                <TextField
                                    required={true}
                                    fullWidth={true}
                                    value={label ?? ""}
                                    size={"small"}
                                    label={t("word.label")}
                                    variant="outlined"
                                    error={labelError}
                                    helperText={labelError ? t("word.required") : ""}
                                    onChange={(event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): void => {
                                        const label: string = event.target.value;
                                        setLabel(label);
                                        if (!hasUnsavedChanges) updateHasUnsavedChanges(true);
                                    }}/>
                            </LabeledField>
                            <LabeledField labelKey={"word.description"} tooltipKey={"tooltip.description"}>
                                <TextField
                                    fullWidth={true}
                                    value={description ?? ""}
                                    size={"small"}
                                    label={t("word.description")}
                                    variant="outlined"
                                    onChange={(event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): void => {
                                        const description: string = event.target.value;
                                        setDescription(description);
                                        if (!hasUnsavedChanges) updateHasUnsavedChanges(true);
                                    }}/>
                            </LabeledField>
                            <LabeledField labelKey={"word.entryPoint"} tooltipKey={"tooltip.entryPoint"} required={true}>
                                <FormControl fullWidth={true} error={entryPointError}>
                                    <Select
                                        displayEmpty={true}
                                        value={entryPoint ?? ""}
                                        size={"small"}
                                        onChange={(event: SelectChangeEvent): void => {
                                            const entryPoint: string = event.target.value;
                                            setEntryPoint(entryPoint);
                                            if (!hasUnsavedChanges) updateHasUnsavedChanges(true);
                                        }}
                                        renderValue={(selected: string) => {
                                            if (selected === "") {
                                                return <Typography>{t("word.missingAttachment")}</Typography>;
                                            } else {
                                                const attachment = programAttachments?.find(att => att.id === selected);
                                                return attachment ? (attachment.label + " (" + attachment.id + ")") : selected;
                                            }
                                        }}
                                    >
                                        {
                                            programAttachments && programAttachments.map((attachment: AttachmentDetail): ReactNode =>
                                                <MenuItem
                                                    key={attachment.id}
                                                    value={attachment.id}
                                                >
                                                    {attachment.label} (
                                                    <Typography component="span"
                                                                sx={{fontStyle: "italic"}}>{attachment.id}</Typography>
                                                    )
                                                </MenuItem>
                                            )}
                                    </Select>
                                    {entryPointError && (
                                        <Typography paddingLeft={2} paddingTop={0.5} variant="caption" color="error">
                                            {t("word.required")}
                                        </Typography>
                                    )}
                                </FormControl>
                            </LabeledField>
                            <LabeledField labelKey={"word.runTime"} tooltipKey={"tooltip.runTime"}>
                                <FormControl fullWidth sx={{pb: 2}}>
                                    <InputLabel>{t("word.runTime")}</InputLabel>
                                    <Select
                                        size={"small"}
                                        variant="outlined"
                                        value={runTime}
                                        label={t("word.runTime")}
                                        onChange={(event: SelectChangeEvent<"PYTHON" | "MATLAB" | "JAVA">): void => {
                                            const runTime: string = event.target.value
                                            setRunTime(runTime as ProgramDetailRuntimeEnum);
                                            if (!hasUnsavedChanges) updateHasUnsavedChanges(true);
                                        }}>
                                        <MenuItem
                                            value={ProgramDetailRuntimeEnum.Python}>
                                            {ProgramDetailRuntimeEnum.Python}
                                        </MenuItem>
                                        <MenuItem
                                            value={ProgramDetailRuntimeEnum.Java}>
                                            {ProgramDetailRuntimeEnum.Java}
                                        </MenuItem>
                                        <MenuItem
                                            value={ProgramDetailRuntimeEnum.Matlab}>
                                            {ProgramDetailRuntimeEnum.Matlab}
                                        </MenuItem>
                                    </Select>
                                </FormControl>
                            </LabeledField>
                            {(programId && program) &&
                                <>
                                    <LabeledField labelKey={"word.lastModifiedBy"} tooltipKey={"tooltip.lastModifiedBy"}>
                                        <TextField
                                            fullWidth={true}
                                            value={program.lastModifiedBy ?? ""}
                                            size={"small"}
                                            label={t("word.lastModifiedBy")}
                                            variant="outlined"
                                            disabled/>
                                    </LabeledField>
                                    <LabeledField labelKey={"word.lastModifiedDate"}
                                                  tooltipKey={"tooltip.lastModifiedDate"}>
                                        <TextField
                                            fullWidth={true}
                                            value={program.lastModifiedDate ? dayjs.unix(Number(program.lastModifiedDate)).format("DD.MM.YYYY HH:mm [Uhr]") : ""}
                                            size={"small"}
                                            label={t("word.lastModifiedDate")}
                                            variant="outlined"
                                            disabled/>
                                    </LabeledField>
                                    <LabeledField labelKey={"word.createdBy"} tooltipKey={"tooltip.createdBy"}>
                                        <TextField
                                            fullWidth={true}
                                            value={program.createdBy ?? ""}
                                            size={"small"}
                                            label={t("word.createdBy")}
                                            variant="outlined"
                                            disabled/>
                                    </LabeledField>
                                    <LabeledField labelKey={"word.creationDate"} tooltipKey={"tooltip.creationDate"}>
                                        <TextField
                                            fullWidth={true}
                                            value={program.creationDate ? dayjs.unix(Number(program.creationDate)).format("DD.MM.YYYY HH:mm [Uhr]") : ""}
                                            size={"small"}
                                            label={t("word.creationDate")}
                                            variant="outlined"
                                            disabled/>
                                    </LabeledField>
                                </>
                            }
                        </LabeledFieldsGrid>
                        <Paper style={{background: theme.palette.elevated.default}}>
                            <Stack spacing={1} padding={2}>
                                <Stack direction={"row"} alignItems={"center"} spacing={1}>
                                    <Typography variant={"h5"} color={"textPrimary"}>
                                        {t("word.attachments")}
                                    </Typography>
                                    <Tooltip title={t("tooltip.attachment")}>
                                        <Info
                                            color={"action"}
                                            sx={{cursor: "pointer"}}
                                        />
                                    </Tooltip>
                                </Stack>
                                <Stack spacing={1} paddingLeft={{xs: 1, sm: 2}} paddingRight={{xs: 1, sm: 2}}>
                                    {
                                        programAttachments && programAttachments.length > 0 && programAttachments
                                            .map((item: AttachmentDetail) => (
                                                <Paper
                                                    key={item.id}
                                                    elevation={0}
                                                    sx={{
                                                        padding: 2,
                                                        paddingLeft: 5,
                                                        borderRadius: 2,
                                                        background: theme.palette.elevated.paper
                                                    }}
                                                >
                                                    <Grid
                                                        container
                                                        spacing={1}
                                                        alignItems="center"
                                                    >
                                                        <Grid size={11}>
                                                            <Grid
                                                                container={true}
                                                                alignItems="center"
                                                            >
                                                                <Typography
                                                                    variant="body1"
                                                                    color="primary"
                                                                >
                                                                    {t("word.id")}
                                                                </Typography>
                                                                <Typography
                                                                    variant="body2"
                                                                    component="span"
                                                                    sx={{pl: 10}}
                                                                >
                                                                    {item.id}
                                                                </Typography>
                                                            </Grid>
                                                            <Grid
                                                                container={true}
                                                                alignItems="center"
                                                            >
                                                                <Typography
                                                                    variant="body1"
                                                                    color="primary"
                                                                >
                                                                    {t("word.label")}
                                                                </Typography>
                                                                <Typography
                                                                    variant="body2"
                                                                    component="span"
                                                                    sx={{pl: 7}}
                                                                >
                                                                    {item.label}
                                                                </Typography>
                                                            </Grid>
                                                            <Grid
                                                                container={true}
                                                                alignItems="center"
                                                            >
                                                                <Typography
                                                                    variant="body1"
                                                                    color="primary"
                                                                >
                                                                    {t("word.description")}
                                                                </Typography>
                                                                <Typography
                                                                    variant="body2"
                                                                    component="span"
                                                                    sx={{pl: 2}}
                                                                >
                                                                    {item.description}
                                                                </Typography>
                                                            </Grid>
                                                            <Grid
                                                                container={true}
                                                                alignItems="center"
                                                            >
                                                                <Typography
                                                                    variant="body1"
                                                                    color="primary"
                                                                >
                                                                    {t("word.path")}
                                                                </Typography>
                                                                <Typography
                                                                    variant="body2"
                                                                    component="span"
                                                                    sx={{pl: 8}}
                                                                >
                                                                    {item.path}
                                                                </Typography>
                                                            </Grid>
                                                        </Grid>
                                                        <Grid size={1}>
                                                            <IconButton
                                                                size="small"
                                                                onClick={(): void => setProgramAttachments(prevAttachments => prevAttachments!.filter(attachment => attachment.id !== item.id))}
                                                            >
                                                                <DeleteIcon fontSize="small"/>
                                                            </IconButton>
                                                        </Grid>
                                                    </Grid>
                                                </Paper>
                                            ))
                                    }
                                    <Box>
                                        <Button
                                            color={"inherit"}
                                            size="small"
                                            startIcon={<AddIcon/>}
                                            type="button"
                                            sx={{
                                                borderRadius: "8px",
                                                borderColor: "primary.main",
                                            }}
                                            onClick={() => setAddAttachment(true)}
                                        >
                                            <Typography textTransform={"initial"}>{t("action.add")}</Typography>
                                        </Button>
                                    </Box>
                                </Stack>
                            </Stack>
                        </Paper>
                    </Box>
                </Paper>
            </Box>
            <AddAttachmentsDialog
                programId={programId ?? undefined}
                addAttachment={addAttachment}
                setAddAttachment={setAddAttachment}
                setProgramAttachments={setProgramAttachments}
                programAttachments={programAttachments ?? []}
            />
            <ConfirmDialog
                dialogTitle={t("dialog.header.confirmDelete")}
                confirmAction={t("action.delete")}
                open={deleteDialogOpen}
                setOpen={setDeleteDialogOpen}
                callback={() => {
                    updateAllowNavigation(true)
                    programDeletion
                        .mutateAsync(programId!)
                        .then(() => {
                            if (hasUnsavedChanges) updateHasUnsavedChanges(false);
                            updateAllowNavigation(false);
                            navigate("/configs/programs")
                        })
                        .catch((): void => {
                            navigate("/configs/programs")
                        });
                }}
            />
        </Fragment>
    )
}

export default ProgramConfigsDetail;