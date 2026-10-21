import {AttachmentDetail} from "@webis/proof-config-manager-client";
import {Dispatch, Fragment, ReactNode, SetStateAction, useContext, useState} from "react";
import {Box, Button, Dialog, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Theme, Typography, useTheme} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CreateIcon from '@mui/icons-material/Create';
import {useTranslation} from "react-i18next";
import {useNavigate} from "react-router-dom";
import {IAppContext} from "../../../../provider/AppProvider.tsx";
import {AppContext} from "../../../../provider/AppContext.tsx";
import {useQuery, UseQueryResult} from "@tanstack/react-query";
import {AxiosError} from "axios";
import {attachmentsQueryOptions} from "../../../../query/options/attachmentQueryOptions.tsx";

interface AddAttachmentsDialogProps {
    programId?: string;
    addAttachment: boolean
    setAddAttachment: (addAttachment: boolean) => void;
    programAttachments: AttachmentDetail[];
    setProgramAttachments: Dispatch<SetStateAction<AttachmentDetail[] | undefined>>
}

const AddAttachmentsDialog = ({
                                  programId,
                                  addAttachment,
                                  setAddAttachment,
                                  programAttachments,
                                  setProgramAttachments
                              }: AddAttachmentsDialogProps) => {

    const theme: Theme = useTheme();
    const {t} = useTranslation();
    const navigate = useNavigate();
    const {hasUnsavedChanges, updateHasUnsavedChanges} = useContext<IAppContext>(AppContext);
    const [selectedAttachment, setSelectedAttachment] = useState<AttachmentDetail | undefined>(undefined);

    const {data: attachments}: UseQueryResult<AttachmentDetail[], AxiosError> = useQuery(attachmentsQueryOptions());

    return (
        <Fragment>
            <Dialog
                fullWidth={true}
                open={addAttachment}
                onClose={(): void => setAddAttachment(false)}>
                <Box style={{background: theme.palette.background.paper}} padding={5}>
                    <FormControl size={"small"} fullWidth={true}>
                        <InputLabel>{t("word.attachment")}</InputLabel>
                        <Select
                            variant={"outlined"}
                            size={"small"}
                            multiple={false}
                            value={selectedAttachment?.id ?? ""}
                            label={t("word.attachment")}
                            onChange={(event: SelectChangeEvent): void => {
                                const attachment: AttachmentDetail | undefined = attachments?.find((attachment: AttachmentDetail): boolean => attachment.id === event.target.value);
                                setSelectedAttachment(attachment);
                            }}
                        >
                            <MenuItem value={""}>
                                <Typography fontStyle={"italic"}>Keine Auswahl</Typography>
                            </MenuItem>
                            {
                                attachments && attachments
                                    .filter((attachment: AttachmentDetail): boolean => !programAttachments.find((item: AttachmentDetail): boolean => attachment.id === item.id))
                                    .map((attachment: AttachmentDetail): ReactNode =>
                                        <MenuItem
                                            key={attachment.id}
                                            value={attachment.id}
                                        >
                                            {attachment.label} ({attachment.id})
                                        </MenuItem>
                                    )
                            }
                        </Select>
                        {
                            selectedAttachment && <Button
                                variant="outlined"
                                color="primary"
                                startIcon={<AddIcon/>}
                                sx={{
                                    mt: 2
                                }}
                                onClick={(): void => {
                                    setProgramAttachments((prev: AttachmentDetail[] | undefined): AttachmentDetail[] => {
                                        if (prev) {
                                            return [...prev, selectedAttachment as AttachmentDetail];
                                        } else {
                                            return [selectedAttachment as AttachmentDetail]
                                        }
                                    })
                                    setAddAttachment(false);
                                    if (!hasUnsavedChanges) updateHasUnsavedChanges(true);
                                }}
                            >
                                <Typography textTransform={"initial"}>{t("action.add")}</Typography>
                            </Button>
                        }
                        <Button
                            variant="outlined"
                            color="primary"
                            startIcon={<CreateIcon/>}
                            sx={{
                                mt: 2
                            }}
                            onClick={(): void => {
                                navigate("/configs/attachments/create", {state: {from: programId ? `/configs/programs/${programId}` : "/configs/programs/create"}})
                            }}
                        >
                            <Typography textTransform={"initial"}>{t("action.create")}</Typography>
                        </Button>
                    </FormControl>
                </Box>
            </Dialog>
        </Fragment>
    );
}

export default AddAttachmentsDialog