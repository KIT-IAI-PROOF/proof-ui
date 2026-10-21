import {Fragment, ReactNode, useCallback, useContext, useEffect, useMemo, useState} from "react";
import {Box, Button, ButtonGroup, IconButton, Paper, Tooltip} from "@mui/material";
import {useTranslation} from "react-i18next";
import {DataGrid, GridColDef, GridFilterModel, GridPaginationModel, GridRenderCellParams, GridRowParams, GridRowSelectionModel, GridSortModel} from "@mui/x-data-grid";
import {ProgramListing, ProgramPagingModelListing} from "@webis/proof-config-manager-client";
import {NavigateFunction, useNavigate} from "react-router-dom";
import {EditNoteRounded} from "@mui/icons-material";
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import {QueryClient, useIsFetching, useMutation, UseMutationResult, useQuery, useQueryClient, UseQueryResult} from "@tanstack/react-query";
import {DEFAULT_CONFIGS_SORTING, DEFAULT_FILTER, DEFAULT_PAGINATION, ENTITY_TYPES, INVALIDATION_KEYS, PAGE_CONTAINER_PADDING, PROGRAMS_KEY} from "../../../utils/constants.ts";
import AddIcon from "@mui/icons-material/Add";
import PageHeader from "../../../app/components/PageHeader.tsx";
import {AxiosError} from "axios";
import {IAppContext} from "../../../provider/AppProvider.tsx";
import {AppContext} from "../../../provider/AppContext.tsx";
import {searchProgramsQueryOptions} from "../../../query/options/programQueryOptions.tsx";
import ConfirmDialog from "../../../app/components/ConfirmDialog.tsx";
import ConfigsTableFooter from "../components/ConfigsTableFooter.tsx";
import DeleteIcon from "@mui/icons-material/Delete";
import {usePersistedState} from "../../../hooks/usePersistedState.ts";
import {programService} from "../../../services/instances.ts";
import {getErrorMessage} from "../../../utils/error.ts";

const ProgramConfigs: () => ReactNode = (): ReactNode => {

    const queryClient: QueryClient = useQueryClient();
    const {t} = useTranslation();
    const navigate: NavigateFunction = useNavigate();
    const {publishEntityMessage, sessionKey, updateError} = useContext<IAppContext>(AppContext);

    const [programsRequest, setProgramsRequest] = useState<any>();
    const [programsSortModel, setProgramsSortModel] = useState<GridSortModel>(DEFAULT_CONFIGS_SORTING);
    const [programsFilterModel, setProgramsFilterModel] = useState<GridFilterModel>(DEFAULT_FILTER);
    const [programsPaginationModel, setProgramsPaginationModel] = useState<GridPaginationModel>(DEFAULT_PAGINATION);
    const [deleteProgram, setDeleteProgram] = useState<string>();
    const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>([]);
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState<boolean>(false);

    const isFetching: number = useIsFetching({queryKey: [PROGRAMS_KEY, programsRequest], exact: true});

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

    const selectedPrograms: () => ProgramListing[] = (): ProgramListing[] => {
        const ids: Set<string> = new Set(rowSelectionModel.map((id): string => id.toString()));
        return (programs?.results ?? []).filter((program: ProgramListing): boolean => !!program.id && ids.has(program.id));
    };

    const handleBulkDelete: () => Promise<void> = async (): Promise<void> => {
        const targets: ProgramListing[] = selectedPrograms();
        await Promise.allSettled(targets.map((program: ProgramListing): Promise<boolean> => programDeletion.mutateAsync(program.id!)));
        setRowSelectionModel([]);
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
                width: 80,
                align: "right",
                headerAlign: "right",
                editable: false,
                ...applyWidth("buttonGroup"),
                renderCell: (params: GridRenderCellParams<ProgramListing>): ReactNode => (
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
                                        setDeleteProgram(params.row.id)
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
        setProgramsRequest({
            sort: programsSortModel,
            filter: programsFilterModel,
            pagination: programsPaginationModel
        })
    }, [programsSortModel, programsFilterModel, programsPaginationModel]);

    const onSortModelChange = useCallback((sortModel: GridSortModel) => {
        setProgramsSortModel(sortModel);
    }, []);

    const onFilterModelChange = useCallback((filterModel: GridFilterModel) => {
        setProgramsFilterModel(filterModel);
    }, []);

    const onPaginationModelChange = useCallback((paginationModel: GridPaginationModel) => {
        setProgramsPaginationModel(paginationModel);
    }, []);

    const {data: programs}: UseQueryResult<ProgramPagingModelListing, AxiosError> = useQuery(searchProgramsQueryOptions(programsRequest));

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
                            headerKey={"page.header.configs.programs"}
                            tooltipTitle={t("tooltip.programs")}
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
                                    <Tooltip title={t("action.addProgram")}>
                                        <Button
                                            startIcon={<AddIcon/>}
                                            variant={"outlined"}
                                            onClick={async (): Promise<void> => {
                                                navigate("/configs/programs/create")
                                            }}
                                            color={"primary"}
                                        >
                                            {t("action.add")}
                                        </Button>
                                    </Tooltip>
                                    {/* <Tooltip title={t("action.importProgram")}>
                                        <Button
                                            startIcon={<Upload/>}
                                            variant={"outlined"}
                                            onClick={async (): Promise<void> => {
                                                updateProgramId(undefined);
                                                navigate("/configs/programs/import")
                                            }}
                                            color={"primary"}>
                                            {t("action.import")}
                                        </Button>
                                    </Tooltip> */}
                                </Fragment>
                            }
                        />
                        <Box sx={{overflow: "auto"}}>
                            <DataGrid<ProgramListing>
                                disableRowSelectionOnClick={true}
                                checkboxSelection={true}
                                onRowSelectionModelChange={(newRowSelectionModel) => {
                                    setRowSelectionModel(newRowSelectionModel);
                                }}
                                rowSelectionModel={rowSelectionModel}
                                loading={!!isFetching}
                                rows={programs?.results ?? []}
                                rowCount={programs?.rowCount ?? 0}
                                columns={columns}
                                sortingMode={"server"}
                                paginationMode={"server"}
                                filterMode={"server"}
                                sortModel={programsSortModel}
                                filterModel={programsFilterModel}
                                paginationModel={programsPaginationModel}
                                onSortModelChange={(sortModel: GridSortModel) => {
                                    onSortModelChange(sortModel);
                                }}
                                onFilterModelChange={(filterModel: GridFilterModel) => {
                                    onFilterModelChange(filterModel);
                                }}
                                onPaginationModelChange={(paginationModel: GridPaginationModel) => {
                                    onPaginationModelChange(paginationModel);
                                }}
                                onRowClick={(params: GridRowParams<ProgramListing>): void => {
                                    if (params.row.id) {
                                        publishEntityMessage(params.row.id, "programs")
                                        navigate(`/configs/programs/${params.row.id}`);
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
                open={!!deleteProgram}
                setOpen={() => setDeleteProgram(undefined)}
                callback={() => {
                    if (deleteProgram) {
                        programDeletion
                            .mutateAsync(deleteProgram)
                            .catch((): void => {
                                navigate(`/configs/programs/`);
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

export default ProgramConfigs;