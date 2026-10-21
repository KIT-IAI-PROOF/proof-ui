import {ChangeEvent, Fragment, ReactNode, useContext, useEffect, useState} from "react";
import {Box, Button, Divider, Paper, Stack, TextField, Theme, Typography, useTheme} from "@mui/material";
import {NavigateFunction, useLocation, useNavigate, useParams} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {EditNoteRounded, UploadRounded} from "@mui/icons-material";
import {IAppContext} from "../../../provider/AppProvider.tsx";
import {useMutation, UseMutationResult, useQuery, useQueryClient, UseQueryResult} from "@tanstack/react-query";
import {ATTACHMENTS_KEY, ENTITY_TYPES, INVALIDATION_KEYS, PAGE_CONTAINER_PADDING} from "../../../utils/constants.ts";
import PageHeader from "../../../app/components/PageHeader.tsx";
import ConfirmDialog from "../../../app/components/ConfirmDialog.tsx";
import {AppContext} from "../../../provider/AppContext.tsx";
import dayjs from "dayjs";
import {AttachmentDetail} from "@webis/proof-config-manager-client";
import {AxiosError} from "axios";
import {v4 as uuidv4} from "uuid";
import {getErrorMessage} from "../../../utils/error.ts";
import {attachmentService} from "../../../services/instances.ts";
import {attachmentQueryOptions} from "../../../query/options/attachmentQueryOptions.tsx";
import LabeledFieldsGrid from "../../../app/components/LabeledFieldsGrid.tsx";
import LabeledField from "../../../app/components/LabeledField.tsx";

const AttachmentConfigsDetail: () => ReactNode = (): ReactNode => {

    const theme: Theme = useTheme();
    const {attachmentId} = useParams();
    const {t} = useTranslation();
    const navigate: NavigateFunction = useNavigate();
    const location = useLocation();
    const queryClient = useQueryClient();
    const {
        hasUnsavedChanges,
        updateError,
        sessionKey,
        updateHasUnsavedChanges,
        updateAllowNavigation,
    } = useContext<IAppContext>(AppContext);

    const [file, setFile] = useState<File | undefined>(undefined);
    const [label, setLabel] = useState<string | undefined>(undefined);
    const [description, setDescription] = useState<string | undefined>(undefined);
    const [path, setPath] = useState<string | undefined>(undefined);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
    const [labelError, setLabelError] = useState<boolean>();

    const {data: attachment}: UseQueryResult<AttachmentDetail, AxiosError> = useQuery(attachmentQueryOptions(attachmentId));

    const attachmentMutation: UseMutationResult<AttachmentDetail, AxiosError, {
        attachment: AttachmentDetail,
        file: File | undefined
    }, any> = useMutation({
        retry: false,
        mutationFn: async ({attachment, file}): Promise<AttachmentDetail> => {
            if (attachment.id) return await attachmentService.updateAttachmentWithFile(attachment.id, attachment, file, undefined, sessionKey);
            else return await attachmentService.createAttachmentWithFile({
                ...attachment,
                id: uuidv4()
            }, file, undefined, sessionKey);
        },
        onMutate: async (): Promise<void> => {
            return await queryClient.cancelQueries({queryKey: [ATTACHMENTS_KEY]});
        },
        onSuccess: async (result: AttachmentDetail): Promise<void> => {
            for (const queryKey of INVALIDATION_KEYS[ATTACHMENTS_KEY]) await queryClient.invalidateQueries({
                queryKey: [queryKey],
                exact: false
            });
            await queryClient.setQueryData([ATTACHMENTS_KEY, result.id], result);
        },
        onError: (error: AxiosError): void => {
            updateError(getErrorMessage(error, ENTITY_TYPES[ATTACHMENTS_KEY], t))
        }
    });

    const attachmentDeletion: UseMutationResult<boolean, AxiosError, string, void> = useMutation({
        retry: false,
        mutationFn: async (attachmentId: string): Promise<boolean> => {
            return await attachmentService.deleteAttachment(attachmentId, undefined, sessionKey);
        },
        onSuccess: async (): Promise<void> => {
            for (const queryKey of INVALIDATION_KEYS[ATTACHMENTS_KEY]) await queryClient.invalidateQueries({
                queryKey: [queryKey],
                exact: false
            });
        },
        onError: (error: AxiosError): void => {
            updateError(getErrorMessage(error, ENTITY_TYPES[ATTACHMENTS_KEY], t));
        }
    });

    const handleSave = async () => {
        let valid = true;

        if (!label || label.trim() === "") {
            setLabelError(true);
            valid = false;
        }

        if (!valid) return;

        if (attachmentId) {
            await attachmentMutation.mutateAsync({
                    file: file,
                    attachment: {
                        ...attachment,
                        label: label,
                        description: description,
                        path: path,
                    }
                }
            ).finally(() => {
                if (hasUnsavedChanges) updateHasUnsavedChanges(false);
            })
        } else {
            updateAllowNavigation(true);
            await attachmentMutation.mutateAsync({
                file: file,
                attachment: {
                    ...attachment,
                    label: label,
                    description: description,
                    path: path,
                }
            }).then(() => {
                if (hasUnsavedChanges) updateHasUnsavedChanges(false);
                updateAllowNavigation(false);
                if (location.state?.from.includes("/configs/programs")) navigate(location.state.from)
                else navigate("/configs/attachments");
            });
        }
    }

    useEffect(() => {
        setLabel(attachment?.label ?? "");
        setDescription(attachment?.description ?? "");
        setPath(attachment?.path ?? "");
    }, [attachment?.description, attachment?.label, attachment?.path]);

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
                            headerKey={"page.header.configs.attachment"}
                            tooltipTitle={t("tooltip.attachment")}
                            subHeaderValue={attachment?.label ?? ""}
                            buttons={
                                <Fragment>
                                    <Button
                                        variant={"outlined"}
                                        onClick={async (): Promise<void> => {
                                            if (location.state?.from.includes("/configs/programs"))
                                                navigate(location.state.from)
                                            else
                                                navigate("/configs/attachments");
                                        }}
                                        color={"primary"}>
                                        {t("action.close")}
                                    </Button>
                                    <Button
                                        disabled={!!attachmentId && !hasUnsavedChanges}
                                        variant={"outlined"}
                                        onClick={handleSave}
                                        color={"primary"}
                                    >
                                        {attachmentId ? t("action.save") : t("action.create")}
                                    </Button>
                                    {attachmentId &&
                                        <Button
                                            variant={"outlined"}
                                            onClick={(): void => {
                                                setDeleteDialogOpen(true)
                                            }}
                                            color={"error"}
                                        >
                                            {t("action.delete")}
                                        </Button>
                                    }
                                </Fragment>
                            }
                        />
                        <Divider/>
                        <LabeledFieldsGrid>
                            {attachmentId &&
                                <LabeledField labelKey={"word.id"} tooltipKey={"tooltip.id"}>
                                    <TextField
                                        fullWidth={true}
                                        value={attachment?.id ?? ""}
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
                            <LabeledField labelKey={"word.fileName"} tooltipKey={"tooltip.fileName"}>
                                <TextField
                                    fullWidth={true}
                                    disabled={true}
                                    value={file?.name ? file.name : (path?.split("/").at(-1) ?? "")}
                                    size={"small"}
                                    label={t("word.fileName")}
                                    variant={"outlined"}
                                />
                            </LabeledField>
                            <LabeledField labelKey={"word.file"} tooltipKey={"tooltip.file"} required={true}>
                                <Stack direction={"row"} alignItems={"center"}>
                                    <input
                                        id={"file"}
                                        type={"file"}
                                        onChange={async (event: any): Promise<void> => {
                                            const file: File = event.target.files[0];
                                            setFile(file);
                                            if (!hasUnsavedChanges) updateHasUnsavedChanges(true);
                                        }}
                                        multiple={false}
                                        style={{display: "none"}}
                                    />
                                    <label
                                        htmlFor={"file"}
                                        style={{
                                            cursor: "pointer",
                                            color: theme.palette.primary.main,
                                            border: "1px solid " + theme.palette.primary.main,
                                            padding: "5px 20px",
                                            borderRadius: "4px",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <Stack direction={"row"} spacing={1}>
                                            <UploadRounded/>
                                            <Typography variant={"body1"}>
                                                Upload
                                            </Typography>
                                        </Stack>
                                    </label>
                                </Stack>
                            </LabeledField>
                            {(attachmentId && attachment) &&
                                <Fragment>
                                    <LabeledField labelKey={"word.lastModifiedBy"} tooltipKey={"tooltip.lastModifiedBy"}>
                                        <TextField
                                            fullWidth={true}
                                            value={attachment.lastModifiedBy ?? ""}
                                            size={"small"}
                                            label={t("word.lastModifiedBy")}
                                            variant="outlined"
                                            disabled/>
                                    </LabeledField>
                                    <LabeledField labelKey={"word.lastModifiedDate"}
                                                  tooltipKey={"tooltip.lastModifiedDate"}>
                                        <TextField
                                            fullWidth={true}
                                            value={attachment.lastModifiedDate ? dayjs.unix(Number(attachment.lastModifiedDate)).format("DD.MM.YYYY HH:mm [Uhr]") : ""}
                                            size={"small"}
                                            label={t("word.lastModifiedDate")}
                                            variant="outlined"
                                            disabled/>
                                    </LabeledField>
                                    <LabeledField labelKey={"word.createdBy"} tooltipKey={"tooltip.createdBy"}>
                                        <TextField
                                            fullWidth={true}
                                            value={attachment.createdBy ?? ""}
                                            size={"small"}
                                            label={t("word.createdBy")}
                                            variant="outlined"
                                            disabled/>
                                    </LabeledField>
                                    <LabeledField labelKey={"word.creationDate"} tooltipKey={"tooltip.creationDate"}>
                                        <TextField
                                            fullWidth={true}
                                            value={attachment.creationDate ? dayjs.unix(Number(attachment.creationDate)).format("DD.MM.YYYY HH:mm [Uhr]") : ""}
                                            size={"small"}
                                            label={t("word.creationDate")}
                                            variant="outlined"
                                            disabled/>
                                    </LabeledField>
                                </Fragment>
                            }
                        </LabeledFieldsGrid>
                    </Box>
                </Paper>
            </Box>
            <ConfirmDialog
                dialogTitle={t("dialog.header.confirmDelete")}
                confirmAction={t("action.delete")}
                open={deleteDialogOpen}
                setOpen={setDeleteDialogOpen}
                callback={() => {
                    updateAllowNavigation(true);
                    attachmentDeletion
                        .mutateAsync(attachmentId!)
                        .then(() => {
                            if (hasUnsavedChanges) updateHasUnsavedChanges(false);
                            updateAllowNavigation(false);
                            navigate("/configs/attachments")
                        })
                        .catch((): void => {
                            navigate("/configs/attachments")
                        })
                }}
            />
        </Fragment>
    );
}

export default AttachmentConfigsDetail;