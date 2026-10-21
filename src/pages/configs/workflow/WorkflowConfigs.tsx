import {Fragment, ReactNode, useCallback, useContext, useEffect, useMemo, useState} from "react";
import {Alert, Box, Button, ButtonGroup, IconButton, Paper, Stack, Tooltip, Typography} from "@mui/material";
import {useTranslation} from "react-i18next";
import {DataGrid, GridColDef, GridFilterModel, GridPaginationModel, GridRenderCellParams, GridRowParams, GridRowSelectionModel, GridSortModel} from "@mui/x-data-grid";
import {NavigateFunction, useNavigate} from "react-router-dom";
import {ExecutionListing, WorkflowListing, WorkflowPagingModelListing} from "@webis/proof-config-manager-client";
import {ArrowForwardRounded, EditNoteRounded} from "@mui/icons-material";
import {useIsFetching, useMutation, UseMutationResult, useQuery, useQueryClient, UseQueryResult} from "@tanstack/react-query";
import {DEFAULT_CONFIGS_SORTING, DEFAULT_FILTER, DEFAULT_PAGINATION, ENTITY_TYPES, INVALIDATION_KEYS, PAGE_CONTAINER_PADDING, WORKFLOWS_KEY} from "../../../utils/constants.ts";
import PageHeader from "../../../app/components/PageHeader.tsx";
import {AxiosError} from "axios";
import {IAppContext} from "../../../provider/AppProvider.tsx";
import {AppContext} from "../../../provider/AppContext.tsx";
import {executionsForWorkflowQueryOptions, searchWorkflowsQueryOptions} from "../../../query/options/workflowQueryOptions.tsx";
import ConfirmDialog from "../../../app/components/ConfirmDialog.tsx";
import ConfigsTableFooter from "../components/ConfigsTableFooter.tsx";
import DeleteIcon from "@mui/icons-material/Delete";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import {usePersistedState} from "../../../hooks/usePersistedState.ts";
import {workflowService} from "../../../services/instances.ts";
import {getErrorMessage} from "../../../utils/error.ts";
import {saveAs} from "file-saver";

const WorkflowConfigs: () => ReactNode = (): ReactNode => {

    const {t} = useTranslation();
    const navigate: NavigateFunction = useNavigate();
    const {publishEntityMessage, sessionKey, updateError} = useContext<IAppContext>(AppContext);
    const queryClient = useQueryClient();

    const [workflowsRequest, setWorkflowsRequest] = useState<any>();
    const [workflowsSortModel, setWorkflowsSortModel] = useState<GridSortModel>(DEFAULT_CONFIGS_SORTING);
    const [workflowsFilterModel, setWorkflowsFilterModel] = useState<GridFilterModel>(DEFAULT_FILTER);
    const [workflowsPaginationModel, setWorkflowsPaginationModel] = useState<GridPaginationModel>(DEFAULT_PAGINATION);
    const [deleteWorkflow, setDeleteWorkflow] = useState<string>();
    const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>([]);
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState<boolean>(false);
    const [bulkExecutions, setBulkExecutions] = useState<ExecutionListing[]>([]);
    const [workflowId, setWorkflowId] = useState<string>();

    const isFetching: number = useIsFetching({queryKey: [WORKFLOWS_KEY, workflowsRequest], exact: true});

    const {data: executionsForWorkflow}: UseQueryResult<ExecutionListing[], AxiosError> = useQuery(executionsForWorkflowQueryOptions(workflowId));

    const workflowDeletion: UseMutationResult<boolean, AxiosError, string, void> = useMutation({
        retry: false,
        mutationFn: async (workflowId: string): Promise<boolean> => {
            return await workflowService.deleteWorkflow(workflowId, undefined, sessionKey);
        },
        onSuccess: async (): Promise<void> => {
            for (const queryKey of INVALIDATION_KEYS[WORKFLOWS_KEY]) await queryClient.invalidateQueries({
                queryKey: [queryKey],
                exact: false
            });
        },
        onError: (error: AxiosError): void => {
            updateError(getErrorMessage(error, ENTITY_TYPES[WORKFLOWS_KEY], t));
        }
    });


    const selectedWorkflows: () => WorkflowListing[] = (): WorkflowListing[] => {
        const ids: Set<string> = new Set(rowSelectionModel.map((id): string => id.toString()));
        return (workflows?.results ?? []).filter((workflow: WorkflowListing): boolean => !!workflow.id && ids.has(workflow.id));
    };

    const openBulkDelete: () => Promise<void> = async (): Promise<void> => {
        const targets: WorkflowListing[] = selectedWorkflows();
        const executionsPerWorkflow: ExecutionListing[][] = await Promise.all(
            targets.map((workflow: WorkflowListing): Promise<ExecutionListing[]> => queryClient.ensureQueryData(executionsForWorkflowQueryOptions(workflow.id)))
        );
        setBulkExecutions(executionsPerWorkflow.flat());
        setBulkDeleteOpen(true);
    };

    const handleBulkDelete: () => Promise<void> = async (): Promise<void> => {
        const targets: WorkflowListing[] = selectedWorkflows();
        await Promise.allSettled(targets.map((workflow: WorkflowListing): Promise<boolean> => workflowDeletion.mutateAsync(workflow.id!)));
        setRowSelectionModel([]);
        setBulkExecutions([]);
    };

    const [columnWidths, setColumnWidths] = usePersistedState<Record<string, number>>({}, "programConfigsColumnWidths");

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
                width: 120,
                align: "right",
                headerAlign: "right",
                editable: false,
                ...applyWidth("buttonGroup"),
                renderCell: (params: GridRenderCellParams<WorkflowListing>): ReactNode => (
                    <ButtonGroup
                        size="small"
                        variant="outlined"
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                    >
                        <Tooltip
                            title={t("action.export")}
                        >
                            <Box>
                                <IconButton
                                    color="primary"
                                    onClick={async (e): Promise<void> => {
                                        e.stopPropagation()
                                        if (params.row.id) {
                                            const file: File = await workflowService.exportWorkflow(params.row.id, undefined);
                                            saveAs(file, "workflow-" + params.row.label + "_" + params.row.id + ".proof");
                                        }
                                    }}
                                >
                                    <FileDownloadIcon/>
                                </IconButton>
                            </Box>
                        </Tooltip>
                        <Tooltip
                            title={t("action.delete")}
                        >
                            <Box>
                                <IconButton
                                    color="error"
                                    onClick={async (e): Promise<void> => {
                                        e.stopPropagation()
                                        setDeleteWorkflow(params.row.id)
                                        setWorkflowId(params.row.id)
                                    }}
                                >
                                    <DeleteIcon/>
                                </IconButton>
                            </Box>
                        </Tooltip>
                    </ButtonGroup>
                )
            }
        ];
    }, [columnWidths, t, setWorkflowId]);

    useEffect((): void => {
        setWorkflowsRequest({
            sort: workflowsSortModel,
            filter: workflowsFilterModel,
            pagination: workflowsPaginationModel
        });
    }, [workflowsSortModel, workflowsFilterModel, workflowsPaginationModel]);

    const onSortModelChange = useCallback((sortModel: GridSortModel) => {
        setWorkflowsSortModel(sortModel);
    }, []);

    const onFilterModelChange = useCallback((filterModel: GridFilterModel) => {
        setWorkflowsFilterModel(filterModel);
    }, []);

    const onPaginationModelChange = useCallback((paginationModel: GridPaginationModel) => {
        setWorkflowsPaginationModel(paginationModel);
    }, []);

    const {data: workflows}: UseQueryResult<WorkflowPagingModelListing, AxiosError> = useQuery(searchWorkflowsQueryOptions(workflowsRequest));

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
                            headerKey={"page.header.configs.workflows"}
                            tooltipTitle={t("tooltip.workflows")}
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
                                    {/* <Tooltip title={t("action.importWorkflow")}>
                                        <Button
                                            startIcon={<Upload/>}
                                            variant={"outlined"}
                                            onClick={async (): Promise<void> => {
                                                updateWorkflowId(undefined);
                                                navigate("/configs/workflows/import")
                                            }}
                                            color={"primary"}>
                                            {t("action.import")}
                                        </Button>
                                    </Tooltip> */}
                                    <Tooltip title={t("action.goToEditor")}>
                                        <Button
                                            startIcon={<ArrowForwardRounded/>}
                                            variant={"outlined"}
                                            onClick={async (): Promise<void> => {
                                                navigate("/editor")
                                            }}
                                            color={"primary"}>
                                            {t("action.toEditor")}
                                        </Button>
                                    </Tooltip>
                                </Fragment>
                            }
                        />
                        <Box sx={{overflow: "auto"}}>
                            <DataGrid<WorkflowListing>
                                disableRowSelectionOnClick={true}
                                checkboxSelection={true}
                                onRowSelectionModelChange={(newRowSelectionModel) => {
                                    setRowSelectionModel(newRowSelectionModel);
                                }}
                                rowSelectionModel={rowSelectionModel}
                                loading={!!isFetching}
                                rows={workflows?.results ?? []}
                                rowCount={workflows?.rowCount ?? 0}
                                columns={columns}
                                sortingMode={"server"}
                                paginationMode={"server"}
                                filterMode={"server"}
                                sortModel={workflowsSortModel}
                                filterModel={workflowsFilterModel}
                                paginationModel={workflowsPaginationModel}
                                onSortModelChange={(sortModel: GridSortModel) => {
                                    onSortModelChange(sortModel);
                                }}
                                onFilterModelChange={(filterModel: GridFilterModel) => {
                                    onFilterModelChange(filterModel);
                                }}
                                onPaginationModelChange={(paginationModel: GridPaginationModel) => {
                                    onPaginationModelChange(paginationModel);
                                }}
                                onRowClick={(params: GridRowParams<WorkflowListing>): void => {
                                    if (params.row.id) {
                                        publishEntityMessage(params.row.id, "workflows")
                                        navigate(`/configs/workflows/${params.row.id}`);
                                    }
                                }}
                                pageSizeOptions={[10, 25, 50, 100]}
                                slots={{footer: ConfigsTableFooter}}
                                slotProps={{
                                    footer: {
                                        selectedCount: rowSelectionModel.length,
                                        stopLabel: t("action.stop"),
                                        deleteLabel: t("action.delete"),
                                        onBulkDelete: openBulkDelete
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
                open={!!deleteWorkflow}
                setOpen={() => {
                    setDeleteWorkflow(undefined);
                    setWorkflowId(undefined);
                }}
                extraContent={
                    <Fragment>
                        {
                            executionsForWorkflow && executionsForWorkflow.length > 0 && <Alert severity="error">
                                <Typography paddingBottom={1}>{t("action.deleteAllExecutions")}:</Typography>
                                <Stack spacing={1}>
                                    {
                                        executionsForWorkflow.map((execution: ExecutionListing): ReactNode => {
                                            return (
                                                <Fragment key={execution.id}>
                                                    <Stack direction={"row"} spacing={1}>
                                                        <Typography>{execution.label}, {execution.id}</Typography>
                                                    </Stack>
                                                </Fragment>
                                            );
                                        })
                                    }
                                </Stack>
                            </Alert>
                        }
                    </Fragment>
                }
                callback={() => {
                    if (deleteWorkflow) {
                        workflowDeletion
                            .mutateAsync(deleteWorkflow)
                            .catch((): void => {
                                navigate(`/configs/workflows/`);
                            });
                    }
                }}
            />
            <ConfirmDialog
                dialogTitle={rowSelectionModel.length === 1 ? t("dialog.header.confirmDelete") : t("dialog.header.confirmDeleteMultiple")}
                confirmAction={t("action.delete")}
                open={bulkDeleteOpen}
                setOpen={() => setBulkDeleteOpen(false)}
                extraContent={
                    <Fragment>
                        {
                            bulkExecutions.length > 0 && <Alert severity="error">
                                <Typography paddingBottom={1}>{t("action.deleteAllExecutions")}:</Typography>
                                <Stack spacing={1}>
                                    {
                                        bulkExecutions.map((execution: ExecutionListing): ReactNode => {
                                            return (
                                                <Fragment key={execution.id}>
                                                    <Stack direction={"row"} spacing={1}>
                                                        <Typography>{execution.label}, {execution.id}</Typography>
                                                    </Stack>
                                                </Fragment>
                                            );
                                        })
                                    }
                                </Stack>
                            </Alert>
                        }
                    </Fragment>
                }
                callback={handleBulkDelete}
            />
        </Fragment>
    );

};

export default WorkflowConfigs;