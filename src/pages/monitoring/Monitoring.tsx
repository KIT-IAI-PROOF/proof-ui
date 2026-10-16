import {Fragment, ReactNode, useCallback, useContext, useEffect, useMemo, useState} from "react";
import {Alert, Box, Button, ButtonGroup, Chip, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Paper, Stack, Theme, Tooltip, Typography, useTheme} from "@mui/material";
import StopIcon from '@mui/icons-material/Stop';
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import {DataGrid, GridColDef, GridFilterModel, GridPaginationModel, GridRenderCellParams, GridRowParams, GridRowSelectionModel, GridSortModel} from "@mui/x-data-grid";
import {useTranslation} from "react-i18next";
import {NavigateFunction, useNavigate} from "react-router-dom";
import Grid from "@mui/material/Grid2";
import {ExecutionListing, ExecutionListingStatusEnum, ExecutionPagingModelListing} from "@kit-iai-proof/proof-config-manager-client";
import {QueryClient, useIsFetching, useMutation, UseMutationResult, useQuery, useQueryClient, UseQueryResult} from "@tanstack/react-query";
import {DEFAULT_FILTER, DEFAULT_MONITORING_SORTING, DEFAULT_PAGINATION, ENTITY_TYPES, EXECUTIONS_KEY, INVALIDATION_KEYS, PAGE_CONTAINER_PADDING} from "../../utils/constants.ts";
import {AuthContextProps, useAuth} from "react-oidc-context";
import {IAppContext} from "../../provider/AppProvider.tsx";
import {AppContext} from "../../provider/AppContext.tsx";
import {RestartAlt, UploadRounded} from "@mui/icons-material";
import dayjs from "dayjs";
import DeleteIcon from "@mui/icons-material/Delete";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import {AxiosError} from "axios";
import {isAdmin} from "../../utils/auth.ts";
import ConfirmDialog from "../../app/components/ConfirmDialog.tsx";
import {executionService, orchestrationService} from "../../services/instances.ts";
import {getErrorMessage} from "../../utils/error.ts";
import {MonitoringContext} from "../../provider/MonitoringContext.tsx";
import {IMonitoringContext} from "../../provider/MonitoringProvider.tsx";
import {searchExecutionsQueryOptions} from "../../query/options/executionQueryOptions.tsx";
import MonitoringTableFooter from "./components/MonitoringTableFooter.tsx";
import {usePersistedState} from "../../hooks/usePersistedState.ts";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import {saveAs} from "file-saver";

const STOPPED_STATES: ExecutionListingStatusEnum[] = [
    ExecutionListingStatusEnum.Stopped,
    ExecutionListingStatusEnum.Aborted,
    ExecutionListingStatusEnum.ShutDown
];

const Monitoring: () => ReactNode = (): ReactNode => {

    const {t} = useTranslation();
    const navigate: NavigateFunction = useNavigate();
    const theme: Theme = useTheme();
    const {sessionKey}: IAppContext = useContext<IAppContext>(AppContext);
    const {resetEditor}: IMonitoringContext = useContext<IMonitoringContext>(MonitoringContext);
    const [deleteExecution, setDeleteExecution] = useState<string | undefined>(undefined);
    const {user}: AuthContextProps = useAuth();
    const queryClient: QueryClient = useQueryClient();

    const [importDialogOpen, setImportDialogOpen] = useState<boolean>(false);
    const [value, setValue] = useState<File | undefined>(undefined);
    const [error, setError] = useState<string>();

    const [executionRequest, setExecutionRequest] = useState<any>();
    const [executionSortModel, setExecutionSortModel] = useState<GridSortModel>(DEFAULT_MONITORING_SORTING);
    const [executionFilterModel, setExecutionFilterModel] = useState<GridFilterModel>(DEFAULT_FILTER);
    const [executionPaginationModel, setExecutionPaginationModel] = useState<GridPaginationModel>(DEFAULT_PAGINATION);
    const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>([]);
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState<boolean>(false);

    const isFetching: number = useIsFetching({queryKey: [EXECUTIONS_KEY, executionRequest], exact: true});

    const [columnWidths, setColumnWidths] = usePersistedState<Record<string, number>>({}, "programConfigsColumnWidths");

    const resetColumnWidths: () => void = (): void => {
        setColumnWidths({});
    }

    const columns: GridColDef<ExecutionListing>[] = useMemo(() => {
        const applyWidth = (field: string) => {
            return columnWidths[field] ? {width: columnWidths[field], flex: undefined} : {};
        };

        return [
            {
                field: "label",
                headerName: t("word.label"),
                width: 250,
                filterable: false,
                editable: false,
                ...applyWidth("label")
            },
            {
                field: "description",
                headerName: t("word.description"),
                width: 250,
                filterable: false,
                editable: false,
                ...applyWidth("description")
            },
            {
                field: "workflow",
                headerName: t("word.workflow"),
                width: 250,
                filterable: false,
                editable: false,
                ...applyWidth("workflow"),
                valueGetter: (_value: any, row: ExecutionListing): string => {
                    return row.workflow?.label ?? "";
                }
            },
            {
                field: "id",
                headerName: t("word.id"),
                width: 280,
                filterable: false,
                editable: false,
                ...applyWidth("id")
            },
            {
                field: "status",
                headerName: t("word.status"),
                width: 150,
                filterable: false,
                editable: false,
                ...applyWidth("status"),
                renderCell: (params: GridRenderCellParams<ExecutionListing>): ReactNode => {
                    return (
                        <Chip label={params.row.status}/>
                    );
                }
            },
            {
                field: "startedAt",
                headerName: t("word.startedAt"),
                width: 150,
                filterable: false,
                editable: false,
                ...applyWidth("startedAt"),
                renderCell: (params: GridRenderCellParams<ExecutionListing>): ReactNode => {
                    return (
                        params.row.startedAt ?
                            <Chip label={dayjs(params.row.startedAt).format("DD.MM.YYYY HH:mm")}/> : ""
                    );
                }
            },
            {
                field: "stoppedAt",
                headerName: t("word.stoppedAt"),
                width: 150,
                filterable: false,
                editable: false,
                ...applyWidth("stoppedAt"),
                renderCell: (params: GridRenderCellParams<ExecutionListing>): ReactNode => {
                    return (
                        params.row.startedAt ?
                            <Chip label={dayjs(params.row.stoppedAt).format("DD.MM.YYYY HH:mm")}/> : ""
                    );
                }
            },
            {
                field: "buttonGroup",
                headerName: t("word.actions"),
                width: 190,
                align: "center",
                headerAlign: "left",
                sortable: false,
                editable: false,
                filterable: false,
                ...applyWidth("buttonGroup"),
                renderCell: (params: GridRenderCellParams<ExecutionListing>): ReactNode => (
                    <ButtonGroup
                        size="small"
                        variant="outlined"
                        onClick={async (e): Promise<void> => {
                            e.stopPropagation()
                        }}
                    >
                        <Tooltip
                            title={t("action.stop")}
                        >
                            <Box>
                                <IconButton
                                    color="error"
                                    disabled={params.row.status && STOPPED_STATES.includes(params.row.status)}
                                    onClick={async (e): Promise<void> => {
                                        e.stopPropagation()
                                        if (params.row.id) await orchestrationService.abortExecution(undefined, params.row.id)
                                    }}
                                >
                                    <StopIcon/>
                                </IconButton>
                            </Box>
                        </Tooltip>
                        <Tooltip
                            title={t('action.restart')}
                        >
                            <Box>
                                <IconButton
                                    disabled={params.row.status && !STOPPED_STATES.includes(params.row.status)}
                                    color="primary"
                                    onClick={async (e): Promise<void> => {
                                        e.stopPropagation()
                                        if (params.row.id) await orchestrationService.startExecution(undefined, params.row.id)
                                    }}
                                >
                                    <RestartAlt/>
                                </IconButton>
                            </Box>
                        </Tooltip>
                        <Tooltip
                            title={t("action.export")}
                        >
                            <Box>
                                <IconButton
                                    color="primary"
                                    onClick={async (e): Promise<void> => {
                                        e.stopPropagation()
                                        if (params.row.id) {
                                            const file: File = await executionService.exportExecution(params.row.id, undefined);
                                            saveAs(file, "export-" + params.row.label + "_" + params.row.id + ".proof");
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
                                        setDeleteExecution(params.row.id)
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

    useEffect((): void => {
        setExecutionRequest({
            sort: executionSortModel,
            filter: executionFilterModel,
            pagination: executionPaginationModel
        })
    }, [executionSortModel, executionFilterModel, executionPaginationModel]);

    const onFilterModelChange: (filterModel: GridFilterModel) => void = useCallback((filterModel: GridFilterModel): void => {
        setExecutionFilterModel(filterModel);
    }, []);

    const onSortModelChange: (sortModel: GridSortModel) => void = useCallback((sortModel: GridSortModel): void => {
        setExecutionSortModel(sortModel);
    }, []);

    const onPaginationModelChange: (paginationModel: GridPaginationModel) => void = useCallback((paginationModel: GridPaginationModel): void => {
        setExecutionPaginationModel(paginationModel);
    }, []);

    const {data: executions}: UseQueryResult<ExecutionPagingModelListing, AxiosError> = useQuery(searchExecutionsQueryOptions(executionRequest));

    const selectedExecutions: () => ExecutionListing[] = (): ExecutionListing[] => {
        const ids: Set<string> = new Set(rowSelectionModel.map((id): string => id.toString()));
        return (executions?.results ?? []).filter((execution: ExecutionListing): boolean => !!execution.id && ids.has(execution.id));
    };

    const invalidateExecutions: () => Promise<void> = async (): Promise<void> => {
        for (const queryKey of INVALIDATION_KEYS[EXECUTIONS_KEY]) await queryClient.invalidateQueries({
            queryKey: [queryKey],
            exact: false
        });
    };

    const executionImport: UseMutationResult<void, AxiosError, File, any> = useMutation({
        retry: false,
        mutationFn: async (file: File): Promise<void> => {
            await executionService.importExecution(file, undefined, sessionKey)
        },
        onMutate: async (): Promise<void> => {
            return await queryClient.cancelQueries({queryKey: [EXECUTIONS_KEY]});
        },
        onSuccess: async (): Promise<void> => invalidateExecutions()
    });

    const executionDeletion: UseMutationResult<boolean, AxiosError, string, void> = useMutation({
        retry: false,
        mutationFn: async (executionId: string): Promise<boolean> => {
            return await executionService.deleteExecution(executionId, undefined, sessionKey);
        },
        // Deactivate any still-mounted status/value websocket, otherwise the STOMP client keeps
        // reconnecting and RabbitMQ re-declares the deleted stream queues.
        onSuccess: async (): Promise<void> => {
            resetEditor();
            await invalidateExecutions();
        },
        onError: (error: AxiosError): void => {
            getErrorMessage(error, ENTITY_TYPES[EXECUTIONS_KEY], t)
        }
    });

    const handleBulkStop: () => Promise<void> = async (): Promise<void> => {
        const targets: ExecutionListing[] = selectedExecutions().filter((execution: ExecutionListing): boolean => !STOPPED_STATES.includes(execution.status as ExecutionListingStatusEnum));
        await Promise.allSettled(targets.map((execution: ExecutionListing): Promise<void> => orchestrationService.abortExecution(undefined, execution.id!)));
        await invalidateExecutions();
        setRowSelectionModel([]);
    };

    const handleBulkDelete: () => Promise<void> = async (): Promise<void> => {
        const targets: ExecutionListing[] = selectedExecutions();
        await Promise.allSettled(targets.map((execution: ExecutionListing): Promise<boolean> => executionDeletion.mutateAsync(execution.id!)));
        setRowSelectionModel([]);
    };

    const handleChange: (e: any) => void = (e: any): void => {
        if (e.target.files && e.target.files[0]) {
            setValue(e.target.files[0]);
            setError(undefined);
        }
    };

    return (
        <Fragment>
            <Box
                {...PAGE_CONTAINER_PADDING}>
                <Paper>
                    <Box padding={3}>
                        <Grid
                            container={true}
                            justifyContent={"space-between"}
                            alignItems={"center"}
                            paddingBottom={2}
                            spacing={1}
                        >
                            <Grid>
                                <Stack
                                    direction={"row"}
                                    spacing={1}>
                                    <MonitorHeartIcon
                                        color={"primary"}
                                        fontSize={"large"}/>
                                    <Typography variant={"h4"}>{t("page.header.monitoring.index")}</Typography>
                                </Stack>
                            </Grid>
                            <Grid size={{sm: 12, md: "auto"}}>
                                <Stack
                                    direction={"row"}
                                    spacing={1}
                                    justifyContent={"flex-end"}
                                >
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
                                    <Button
                                        color={"primary"}
                                        variant={"outlined"}
                                        onClick={(): void => navigate("/monitoring/execution")}
                                    >
                                        {t("action.run")}
                                    </Button>
                                    {
                                        user && isAdmin(user) && <Button
                                            color={"primary"}
                                            variant={"outlined"}
                                            onClick={(): void => setImportDialogOpen(true)}
                                        >
                                            {t("action.import")}
                                        </Button>
                                    }
                                </Stack>
                            </Grid>
                        </Grid>
                        <div style={{display: "flex", flexDirection: "column"}}>
                            <DataGrid<ExecutionListing>
                                disableRowSelectionOnClick={true}
                                checkboxSelection={true}
                                onRowSelectionModelChange={(newRowSelectionModel) => {
                                    setRowSelectionModel(newRowSelectionModel);
                                }}
                                rowSelectionModel={rowSelectionModel}
                                loading={!!isFetching}
                                rows={executions?.results ?? []}
                                rowCount={executions?.rowCount ?? 0}
                                columns={columns}
                                sortingMode={"server"}
                                paginationMode={"server"}
                                filterMode={"server"}
                                filterDebounceMs={500}
                                sortModel={executionSortModel}
                                filterModel={executionFilterModel}
                                paginationModel={executionPaginationModel}
                                onSortModelChange={(model: GridSortModel): void => onSortModelChange(model)}
                                onFilterModelChange={(model: GridFilterModel): void => onFilterModelChange(model)}
                                onPaginationModelChange={(model: GridPaginationModel): void => onPaginationModelChange(model)}
                                onRowClick={(params: GridRowParams<ExecutionListing>): void => {
                                    if (params.row.id) {
                                        resetEditor()
                                        navigate(`/monitoring/${params.row.id}`);
                                    }
                                }}
                                pageSizeOptions={[10, 25, 50, 100]}
                                pagination={true}
                                slots={{footer: MonitoringTableFooter}}
                                slotProps={{
                                    footer: {
                                        selectedCount: rowSelectionModel.length,
                                        stopLabel: t("action.stop"),
                                        deleteLabel: t("action.delete"),
                                        onBulkStop: handleBulkStop,
                                        onBulkDelete: (): void => setBulkDeleteOpen(true)
                                    }
                                }}
                                onColumnWidthChange={(params) => {
                                    setColumnWidths((prev) => ({...prev, [params.colDef.field]: params.width}));
                                }}
                            />
                        </div>
                    </Box>
                </Paper>
            </Box>
            <Dialog
                maxWidth={"xl"}
                fullWidth={true}
                onClose={(): void => setImportDialogOpen(false)}
                open={importDialogOpen}
            >
                <Box
                    style={{background: theme.palette.background.paper}}
                    padding={1}
                >
                    <DialogTitle>{t("dialog.header.import")}</DialogTitle>
                    <DialogContent>
                        <Stack direction={"row"} spacing={1} paddingBottom={1} alignItems={"center"}>
                            <input
                                id={"file"}
                                onChange={handleChange}
                                type={"file"}
                                accept={".proof"}
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
                        <Stack padding={1}>
                            {
                                error && <Alert sx={{marginBottom: 2}} severity={"warning"}>
                                    {error}
                                </Alert>
                            }
                            {
                                value && <Fragment>
                                    <Paper sx={{background: theme.palette.elevated.default, width: "100%"}}>
                                        <Box padding={1} width={"100%"}>
                                            <Typography>{value?.name}</Typography>
                                            <Typography>{value?.size / 1000} kB</Typography>
                                        </Box>
                                    </Paper>
                                </Fragment>
                            }
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Stack paddingX={3} direction={"row"} alignItems={"center"} flexGrow={1}>
                            <Box>
                                <Button
                                    onClick={async (): Promise<void> => {
                                        if (value) {
                                            await executionImport
                                                .mutateAsync(value)
                                                .finally(() => setImportDialogOpen(false))
                                        }
                                    }}
                                >
                                    {t("action.import")}
                                </Button>
                            </Box>
                        </Stack>
                    </DialogActions>
                </Box>
            </Dialog>
            <ConfirmDialog
                dialogTitle={t("dialog.header.confirmDelete")}
                confirmAction={t("action.delete")}
                open={!!deleteExecution}
                setOpen={() => setDeleteExecution(undefined)}
                callback={() => {
                    if (deleteExecution) {
                        executionDeletion
                            .mutateAsync(deleteExecution)
                            .catch((): void => {
                                navigate(`/monitoring/`);
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

};

export default Monitoring;