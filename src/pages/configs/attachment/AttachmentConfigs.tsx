import {useTranslation} from "react-i18next";
import {NavigateFunction, useNavigate} from "react-router-dom";
import {Fragment, ReactNode, useCallback, useContext, useEffect, useMemo, useState} from "react";
import {usePersistedState} from "../../../hooks/usePersistedState.ts";
import {QueryClient, useIsFetching, useMutation, UseMutationResult, useQuery, useQueryClient, UseQueryResult} from "@tanstack/react-query";
import {ATTACHMENTS_KEY, DEFAULT_CONFIGS_SORTING, DEFAULT_FILTER, DEFAULT_PAGINATION, ENTITY_TYPES, INVALIDATION_KEYS, PAGE_CONTAINER_PADDING} from "../../../utils/constants.ts";
import {DataGrid, GridColDef, GridFilterModel, GridPaginationModel, GridRenderCellParams, GridRowParams, GridRowSelectionModel, GridSortModel} from "@mui/x-data-grid";
import {Box, Button, ButtonGroup, IconButton, Paper, Tooltip} from "@mui/material";
import {EditNoteRounded} from "@mui/icons-material";
import {AttachmentListing, AttachmentPagingModelListing} from "@webis/proof-config-manager-client";
import PageHeader from "../../../app/components/PageHeader.tsx";
import AddIcon from "@mui/icons-material/Add";
import {AxiosError} from "axios";
import {IAppContext} from "../../../provider/AppProvider.tsx";
import {AppContext} from "../../../provider/AppContext.tsx";
import {searchAttachmentsQueryOptions} from "../../../query/options/attachmentQueryOptions.tsx";
import ConfirmDialog from "../../../app/components/ConfirmDialog.tsx";
import ConfigsTableFooter from "../components/ConfigsTableFooter.tsx";
import DeleteIcon from "@mui/icons-material/Delete";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import {attachmentService} from "../../../services/instances.ts";
import {getErrorMessage} from "../../../utils/error.ts";

const AttachmentConfigs: () => ReactNode = (): ReactNode => {

    const queryClient: QueryClient = useQueryClient();
    const {t} = useTranslation();
    const navigate: NavigateFunction = useNavigate();
    const {publishEntityMessage, sessionKey, updateError} = useContext<IAppContext>(AppContext);

    const [attachmentsRequest, setAttachmentsRequest] = useState<any>();
    const [attachmentsSortModel, setAttachmentsSortModel] = useState<GridSortModel>(DEFAULT_CONFIGS_SORTING);
    const [attachmentsFilterModel, setAttachmentsFilterModel] = useState<GridFilterModel>(DEFAULT_FILTER);
    const [attachmentsPaginationModel, setAttachmentsPaginationModel] = useState<GridPaginationModel>(DEFAULT_PAGINATION);
    const [deleteAttachment, setDeleteAttachment] = useState<string>();
    const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>([]);
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState<boolean>(false);

    const isFetching: number = useIsFetching({queryKey: [ATTACHMENTS_KEY, attachmentsRequest], exact: true});

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

    const selectedAttachments: () => AttachmentListing[] = (): AttachmentListing[] => {
        const ids: Set<string> = new Set(rowSelectionModel.map((id): string => id.toString()));
        return (attachments?.results ?? []).filter((attachment: AttachmentListing): boolean => !!attachment.id && ids.has(attachment.id));
    };

    const handleBulkDelete: () => Promise<void> = async (): Promise<void> => {
        const targets: AttachmentListing[] = selectedAttachments();
        await Promise.allSettled(targets.map((attachment: AttachmentListing): Promise<boolean> => attachmentDeletion.mutateAsync(attachment.id!)));
        setRowSelectionModel([]);
    };

    const [columnWidths, setColumnWidths] = usePersistedState<Record<string, number>>({}, "attachmentConfigsColumnWidths");

    const resetColumnWidths: () => void = (): void => {
        setColumnWidths({});
    }

    const columns: GridColDef[] = useMemo(() => {
        const applyWidth = (field: string) => {
            return columnWidths[field] ? {width: columnWidths[field], flex: undefined} : {};
        };

        return [
            {
                field: "id",
                headerName: t("word.id"),
                flex: 1,
                editable: false,
                ...applyWidth("id")
            },
            {
                field: "label",
                headerName: t("word.label"),
                flex: 1,
                editable: false,
                ...applyWidth("label")
            },
            {
                field: "description",
                headerName: t("word.description"),
                flex: 1,
                editable: false,
                ...applyWidth("description")
            },
            {
                field: "buttonGroup",
                headerName: t("word.actions"),
                width: 80,
                align: "right",
                headerAlign: "right",
                editable: false,
                ...applyWidth("buttonGroup"),
                renderCell: (params: GridRenderCellParams<AttachmentListing>): ReactNode => (
                    <ButtonGroup
                        size="small"
                        variant="outlined"
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                    >
                        <Tooltip
                            title={t("action.delete")}
                        >
                            <Box>
                                <IconButton
                                    color="error"
                                    onClick={async (e): Promise<void> => {
                                        e.stopPropagation()
                                        setDeleteAttachment(params.row.id)
                                    }}
                                >
                                    <DeleteIcon/>
                                </IconButton>
                            </Box>
                        </Tooltip>
                    </ButtonGroup>
                )
            }
        ]
    }, [columnWidths, t]);

    useEffect(() => {
        setAttachmentsRequest({
            sort: attachmentsSortModel,
            filter: attachmentsFilterModel,
            pagination: attachmentsPaginationModel
        })
    }, [attachmentsFilterModel, attachmentsPaginationModel, attachmentsSortModel]);

    const onSortModelChange = useCallback((sortModel: GridSortModel) => {
        setAttachmentsSortModel(sortModel);
    }, []);

    const onFilterModelChange = useCallback((filterModel: GridFilterModel) => {
        setAttachmentsFilterModel(filterModel);
    }, []);

    const onPaginationModelChange = useCallback((paginationModel: GridPaginationModel) => {
        setAttachmentsPaginationModel(paginationModel);
    }, []);

    const {data: attachments}: UseQueryResult<AttachmentPagingModelListing, AxiosError> = useQuery(searchAttachmentsQueryOptions(attachmentsRequest));

    return (
        <Fragment>
            <Box
                {...PAGE_CONTAINER_PADDING}>
                <Paper>
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
                            headerKey={"page.header.configs.attachments"}
                            tooltipTitle={t("tooltip.attachments")}
                            subHeaderValue={""}
                            buttons={
                                <Fragment>
                                    <Tooltip title="Reset column widths">
                                        <Button
                                            startIcon={<RestartAltIcon/>}
                                            variant={"outlined"}
                                            color={"primary"}
                                            onClick={resetColumnWidths}
                                            disabled={Object.keys(columnWidths).length === 0}
                                        >
                                            {t("action.resetColumnWidths")}
                                        </Button>
                                    </Tooltip>
                                    <Tooltip title={t("action.addAttachment")}>
                                        <Button
                                            startIcon={<AddIcon/>}
                                            variant={"outlined"}
                                            onClick={async (): Promise<void> => {
                                                navigate("/configs/attachments/create")
                                            }}
                                            color={"primary"}>
                                            {t("action.add")}
                                        </Button>
                                    </Tooltip>
                                    {/* <Tooltip title={t("action.importAttachment")}>
                                        <Button
                                            startIcon={<Upload/>}
                                            variant={"outlined"}
                                            onClick={async (): Promise<void> => {
                                                updateAttachmentId(undefined);
                                                navigate("/configs/attachments/import")
                                            }}
                                            color={"primary"}>
                                            {t("action.import")}
                                        </Button>
                                    </Tooltip> */}
                                </Fragment>
                            }
                        />
                        <Box sx={{overflowX: "auto"}}>
                            <DataGrid<AttachmentListing>
                                disableRowSelectionOnClick={true}
                                checkboxSelection={true}
                                onRowSelectionModelChange={(newRowSelectionModel) => {
                                    setRowSelectionModel(newRowSelectionModel);
                                }}
                                rowSelectionModel={rowSelectionModel}
                                loading={!!isFetching}
                                rows={attachments?.results ?? []}
                                rowCount={attachments?.rowCount ?? 0}
                                columns={columns}
                                sortingMode={"server"}
                                paginationMode={"server"}
                                filterMode={"server"}
                                sortModel={attachmentsSortModel}
                                filterModel={attachmentsFilterModel}
                                paginationModel={attachmentsPaginationModel}
                                onSortModelChange={(sortModel: GridSortModel) => {
                                    onSortModelChange(sortModel);
                                }}
                                onFilterModelChange={(filterModel: GridFilterModel) => {
                                    onFilterModelChange(filterModel);
                                }}
                                onPaginationModelChange={(paginationModel: GridPaginationModel) => {
                                    onPaginationModelChange(paginationModel);
                                }}
                                onRowClick={(params: GridRowParams<AttachmentListing>): void => {
                                    if (params.row.id) {
                                        publishEntityMessage(params.row.id, "attachments")
                                        navigate(`/configs/attachments/${params.row.id}`);
                                    }
                                }}
                                pageSizeOptions={[10, 25, 50, 100]}
                                slots={{footer: ConfigsTableFooter}}
                                slotProps={{
                                    footer: {
                                        selectedCount: rowSelectionModel.length,
                                        stopLabel: t("action.stop"),
                                        deleteLabel: t("action.delete"),
                                        onBulkDelete: (): void => setBulkDeleteOpen(true)
                                    }
                                }}
                                onColumnWidthChange={(params) => {
                                    setColumnWidths((prev) => ({...prev, [params.colDef.field]: params.width}));
                                }}
                            />
                        </Box>
                    </Box>
                </Paper>
            </Box>
            <ConfirmDialog
                dialogTitle={t("dialog.header.confirmDelete")}
                confirmAction={t("action.delete")}
                open={!!deleteAttachment}
                setOpen={() => setDeleteAttachment(undefined)}
                callback={() => {
                    if (deleteAttachment) {
                        attachmentDeletion
                            .mutateAsync(deleteAttachment)
                            .catch((): void => {
                                navigate(`/configs/attachments/`);
                            });
                    }
                }}
            />
            <ConfirmDialog
                dialogTitle={rowSelectionModel.length === 1 ? t("dialog.header.confirmDelete") : t("dialog.header.confirmDeleteMultiple")}
                confirmAction={t("action.delete")}
                open={bulkDeleteOpen}
                setOpen={() => setBulkDeleteOpen(false)}
                callback={handleBulkDelete}
            />
        </Fragment>
    );
}

export default AttachmentConfigs;