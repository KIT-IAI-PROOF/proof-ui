import {Fragment, ReactNode, useCallback, useContext, useEffect, useMemo, useState} from "react";
import {Alert, Box, Button, ButtonGroup, IconButton, Paper, Stack, Tooltip, Typography} from "@mui/material";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AddIcon from '@mui/icons-material/Add';
import {DataGrid, GridColDef, GridFilterModel, GridPaginationModel, GridRenderCellParams, GridRowParams, GridRowSelectionModel, GridSortModel} from "@mui/x-data-grid";
import {BlockDetail, TemplateDetail, TemplateListing, TemplatePagingModelListing, WorkflowDetail} from "@kit-iai-proof/proof-config-manager-client";
import {useTranslation} from "react-i18next";
import {NavigateFunction, useNavigate} from "react-router-dom";
import {useIsFetching, useMutation, UseMutationResult, useQuery, useQueryClient, UseQueryResult} from "@tanstack/react-query";
import {DEFAULT_FILTER, DEFAULT_PAGINATION, DEFAULT_TEMPLATES_SORTING, ENTITY_TYPES, INVALIDATION_KEYS, PAGE_CONTAINER_PADDING, TEMPLATES_KEY} from "../../../utils/constants.ts";
import {EditNoteRounded} from "@mui/icons-material";
import PageHeader from "../../../app/components/PageHeader.tsx";
import {AxiosError} from "axios";
import {IAppContext} from "../../../provider/AppProvider.tsx";
import {AppContext} from "../../../provider/AppContext.tsx";
import {searchTemplatesQueryOptions, templateQueryOptions, workflowsForTemplateQueryOptions} from "../../../query/options/templateQueryOptions.tsx";
import ConfirmDialog from "../../../app/components/ConfirmDialog.tsx";
import ConfigsTableFooter from "../components/ConfigsTableFooter.tsx";
import DeleteIcon from "@mui/icons-material/Delete";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import {getBlockColor} from "../../../utils/palette.ts";
import {usePersistedState} from "../../../hooks/usePersistedState.ts";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import {templateService} from "../../../services/instances.ts";
import {v4 as uuidv4} from "uuid";
import {saveAs} from "file-saver";
import {getErrorMessage} from "../../../utils/error.ts";

const TemplateConfigs: () => ReactNode = (): ReactNode => {

    const queryClient = useQueryClient();
    const {t} = useTranslation();
    const navigate: NavigateFunction = useNavigate();
    const {publishEntityMessage, palette, sessionKey, updateError} = useContext<IAppContext>(AppContext);
    const [templatesRequest, setTemplatesRequest] = useState<any>();
    const [templatesSortModel, setTemplatesSortModel] = useState<GridSortModel>(DEFAULT_TEMPLATES_SORTING);
    const [templatesFilterModel, setTemplatesFilterModel] = useState<GridFilterModel>(DEFAULT_FILTER);
    const [templatesPaginationModel, setTemplatesPaginationModel] = useState<GridPaginationModel>(DEFAULT_PAGINATION);
    const [deleteTemplate, setDeleteTemplate] = useState<string>();
    const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>([]);
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState<boolean>(false);
    const [bulkWorkflows, setBulkWorkflows] = useState<WorkflowDetail[]>([]);
    const [copyDialogOpen, setCopyDialogOpen] = useState<boolean>(false);
    const [templateId, setTemplateId] = useState<string>();

    const isFetching: number = useIsFetching({queryKey: [TEMPLATES_KEY, templatesRequest], exact: true});

    const {data: template}: UseQueryResult<TemplateDetail, AxiosError> = useQuery(templateQueryOptions(templateId));
    const {data: workflowsForTemplate}: UseQueryResult<WorkflowDetail[], AxiosError> = useQuery(workflowsForTemplateQueryOptions(templateId));

    const templateMutation: UseMutationResult<TemplateDetail, AxiosError, TemplateDetail, any> = useMutation({
        retry: false,
        mutationFn: async (template: TemplateDetail): Promise<TemplateDetail> => {
            if (template.id) return await templateService.updateTemplate(template.id, template, undefined, sessionKey);
            else return await templateService.saveTemplate({...template, id: uuidv4()}, undefined, sessionKey);
        },
        onMutate: async (): Promise<void> => {
            return await queryClient.cancelQueries({queryKey: [TEMPLATES_KEY]});
        },
        onSuccess: async (result: TemplateDetail): Promise<void> => {
            for (const queryKey of INVALIDATION_KEYS[TEMPLATES_KEY]) await queryClient.invalidateQueries({
                queryKey: [queryKey],
                exact: false
            });
            await queryClient.setQueryData([TEMPLATES_KEY, result.id], result);
        },
        onError: (error: AxiosError): void => {
            updateError(getErrorMessage(error, ENTITY_TYPES[TEMPLATES_KEY], t));
        }
    });

    const templateDeletion: UseMutationResult<boolean, AxiosError, string, void> = useMutation({
        retry: false,
        mutationFn: async (templateId: string): Promise<boolean> => {
            return await templateService.deleteTemplate(templateId, undefined, sessionKey);
        },
        onSuccess: async (): Promise<void> => {
            for (const queryKey of INVALIDATION_KEYS[TEMPLATES_KEY]) await queryClient.invalidateQueries({
                queryKey: [queryKey],
                exact: false
            });
        },
        onError: (error: AxiosError): void => {
            updateError(getErrorMessage(error, ENTITY_TYPES[TEMPLATES_KEY], t));
        }
    });

    const selectedTemplateIds: Set<string> = new Set(rowSelectionModel.map((id): string => id.toString()));

    const selectedTemplates: () => TemplateListing[] = (): TemplateListing[] => {
        return (templates?.results ?? []).filter((template: TemplateListing): boolean => !!template.id && selectedTemplateIds.has(template.id));
    };

    // Aggregate (deduplicated) the workflows whose blocks reference any selected template, so the bulk
    // dialog can show which blocks still depend on the selection and block the deletion accordingly.
    const openBulkDelete: () => Promise<void> = async (): Promise<void> => {
        const targets: TemplateListing[] = selectedTemplates();
        const workflowsPerTemplate: WorkflowDetail[][] = await Promise.all(
            targets.map((template: TemplateListing): Promise<WorkflowDetail[]> => queryClient.ensureQueryData(workflowsForTemplateQueryOptions(template.id)))
        );
        const merged: Map<string, WorkflowDetail> = new Map<string, WorkflowDetail>();
        workflowsPerTemplate.flat().forEach((workflow: WorkflowDetail): void => {
            if (workflow.id) merged.set(workflow.id, workflow);
        });
        setBulkWorkflows(Array.from(merged.values()));
        setBulkDeleteOpen(true);
    };

    const handleBulkDelete: () => Promise<void> = async (): Promise<void> => {
        const targets: TemplateListing[] = selectedTemplates();
        await Promise.allSettled(targets.map((template: TemplateListing): Promise<boolean> => templateDeletion.mutateAsync(template.id!)));
        setRowSelectionModel([]);
        setBulkWorkflows([]);
    };

    const handleCopy: () => Promise<void> = async (): Promise<void> => {
        const outputsWithoutId = template?.outputs!.map(({id, ...rest}) => rest)
        const inputsWithoutId = template?.inputs!.map(({id, ...rest}) => rest)
        await templateMutation.mutateAsync({
            name: `${template?.name} - Copy`,
            description: `${template?.description}`,
            containerImage: template?.containerImage,
            blockType: template?.blockType,
            syncStrategy: template?.syncStrategy,
            communicationParadigm: template?.communicationParadigm,
            program: template?.program,
            outputs: outputsWithoutId,
            inputs: inputsWithoutId,
            shutdownRelevant: template?.shutdownRelevant,
            textColor: template?.textColor,
            color: getBlockColor(template?.blockType, palette),
            type: "block"
        }).then((template): void => {
            navigate(`/configs/templates/${template.id}`);
        })
    }

    const [columnWidths, setColumnWidths] = usePersistedState<Record<string, number>>({}, "templateConfigsColumnWidths");

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
                field: "name",
                headerName: t("word.label"),
                flex: 1,
                editable: false,
                ...applyWidth("name")
            },
            {
                field: "description",
                headerName: t("word.description"),
                flex: 1,
                editable: false,
                ...applyWidth("description")
            },
            {
                field: "bottonGroup",
                headerName: t("word.actions"),
                width: 140,
                align: "right",
                headerAlign: "right",
                editable: false,
                ...applyWidth("buttonGroup"),
                renderCell: (params: GridRenderCellParams<TemplateListing>): ReactNode => (
                    <ButtonGroup
                        size="small"
                        variant="outlined"
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                    >
                        <Tooltip
                            title={t("action.copy")}
                        >
                            <Box>
                                <IconButton
                                    onClick={async (e): Promise<void> => {
                                        e.stopPropagation()
                                        setCopyDialogOpen(true)
                                        setTemplateId(params.row.id);
                                    }}
                                >
                                    <ContentCopyIcon/>
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
                                            const file: File = await templateService.exportTemplate(params.row.id, undefined);
                                            saveAs(file, "template-" + params.row.name + "_" + params.row.id + ".proof");
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
                                        setDeleteTemplate(params.row.id)
                                        setTemplateId(params.row.id)
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
    }, [columnWidths, t])

    useEffect((): void => {
        setTemplatesRequest({
            sort: templatesSortModel,
            filter: templatesFilterModel,
            pagination: templatesPaginationModel
        })
    }, [templatesSortModel, templatesFilterModel, templatesPaginationModel]);

    const onSortModelChange = useCallback((sortModel: GridSortModel) => {
        setTemplatesSortModel(sortModel);
    }, []);

    const onFilterModelChange = useCallback((filterModel: GridFilterModel) => {
        setTemplatesFilterModel(filterModel);
    }, []);

    const onPaginationModelChange = useCallback((paginationModel: GridPaginationModel) => {
        setTemplatesPaginationModel(paginationModel);
    }, []);

    const {data: templates}: UseQueryResult<TemplatePagingModelListing, AxiosError> = useQuery(searchTemplatesQueryOptions(templatesRequest));

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
                            headerKey={"page.header.configs.templates"}
                            tooltipTitle={t("tooltip.templates")}
                            subHeaderValue={""}
                            buttons={
                                <Fragment>
                                    <Tooltip title={t("action.resetColumnWidths")}>
                                        <Button
                                            startIcon={<RestartAltIcon/>}
                                            variant={"outlined"}
                                            color={"primary"}
                                            onClick={resetColumnWidths}
                                            disabled={Object.keys(columnWidths).length === 0}
                                        >
                                            {t('action.resetColumnWidths')}
                                        </Button>
                                    </Tooltip>
                                    <Tooltip title={t("action.addTemplate")}>
                                        <Button
                                            startIcon={<AddIcon/>}
                                            variant={"outlined"}
                                            onClick={async (): Promise<void> => {
                                                navigate("/configs/templates/create")
                                            }}
                                            color={"primary"}>
                                            {t("action.add")}
                                        </Button>
                                    </Tooltip>
                                    {/* <Tooltip title={t("action.importTemplate")}>
                                        <Button
                                            startIcon={<Upload/>}
                                            variant={"outlined"}
                                            onClick={async (): Promise<void> => {
                                                updateTemplateId(undefined);
                                                navigate("/configs/templates/import")
                                            }}
                                            color={"primary"}>
                                            {t("action.import")}
                                        </Button>
                                    </Tooltip> */}
                                </Fragment>
                            }
                        />
                        <Box sx={{overflowX: "auto"}}>
                            <DataGrid<TemplateListing>
                                disableRowSelectionOnClick={true}
                                checkboxSelection={true}
                                onRowSelectionModelChange={(newRowSelectionModel) => {
                                    setRowSelectionModel(newRowSelectionModel);
                                }}
                                rowSelectionModel={rowSelectionModel}
                                loading={!!isFetching}
                                rows={templates?.results ?? []}
                                rowCount={templates?.rowCount ?? 0}
                                columns={columns}
                                sortingMode={"server"}
                                paginationMode={"server"}
                                filterMode={"server"}
                                sortModel={templatesSortModel}
                                filterModel={templatesFilterModel}
                                paginationModel={templatesPaginationModel}
                                onSortModelChange={(sortModel: GridSortModel) => {
                                    onSortModelChange(sortModel);
                                }}
                                onFilterModelChange={(filterModel: GridFilterModel) => {
                                    onFilterModelChange(filterModel);
                                }}
                                onPaginationModelChange={(paginationModel: GridPaginationModel) => {
                                    onPaginationModelChange(paginationModel);
                                }}
                                onRowClick={(params: GridRowParams<TemplateListing>): void => {
                                    if (params.row.id) {
                                        publishEntityMessage(params.row.id, "templates")
                                        navigate(`/configs/templates/${params.row.id}`);
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
                open={!!deleteTemplate}
                setOpen={() => setDeleteTemplate(undefined)}
                disableAction={workflowsForTemplate && workflowsForTemplate.length > 0}
                extraContent={
                    <Fragment>
                        {
                            workflowsForTemplate && workflowsForTemplate.length > 0 && <Alert severity="error">
                                <Typography paddingBottom={1}>{t("action.dependingBlocks")}:</Typography>
                                <Stack spacing={1}>
                                    {
                                        workflowsForTemplate.map((workflow: WorkflowDetail): ReactNode => {
                                            return (
                                                <Fragment key={workflow.id}>
                                                    <Stack direction={"column"} spacing={1}>
                                                        <Typography>Workflow: {workflow.label}</Typography>
                                                        {
                                                            workflow.blocks?.filter((block: BlockDetail) => block.templateId === deleteTemplate).map((block: BlockDetail) => {
                                                                return <Typography paddingLeft={2} variant={"body2"}
                                                                                   key={`${workflow.id}-${block.id}`}>Block: {block.label} ({block.index})</Typography>
                                                            })
                                                        }
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
                    if (deleteTemplate) {
                        templateDeletion
                            .mutateAsync(deleteTemplate)
                            .catch((): void => {
                                navigate(`/templates/`);
                            });
                    }
                }}
            />
            <ConfirmDialog
                dialogTitle={rowSelectionModel.length === 1 ? t("dialog.header.confirmDelete") : t("dialog.header.confirmDeleteMultiple")}
                confirmAction={t("action.delete")}
                open={bulkDeleteOpen}
                setOpen={() => setBulkDeleteOpen(false)}
                disableAction={bulkWorkflows.length > 0}
                extraContent={
                    <Fragment>
                        {
                            bulkWorkflows.length > 0 && <Alert severity="error">
                                <Typography paddingBottom={1}>{t("action.dependingBlocks")}:</Typography>
                                <Stack spacing={1}>
                                    {
                                        bulkWorkflows.map((workflow: WorkflowDetail): ReactNode => {
                                            return (
                                                <Fragment key={workflow.id}>
                                                    <Stack direction={"column"} spacing={1}>
                                                        <Typography>Workflow: {workflow.label}</Typography>
                                                        {
                                                            workflow.blocks?.filter((block: BlockDetail) => block.templateId && selectedTemplateIds.has(block.templateId)).map((block: BlockDetail) => {
                                                                return <Typography paddingLeft={2} variant={"body2"}
                                                                                   key={`${workflow.id}-${block.id}`}>Block: {block.label} ({block.index})</Typography>
                                                            })
                                                        }
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
            <ConfirmDialog
                dialogTitle={t("dialog.header.confirmCopy")}
                confirmAction={t("action.copy")}
                open={copyDialogOpen}
                setOpen={setCopyDialogOpen}
                callback={handleCopy}
            />
        </Fragment>
    );
}

export default TemplateConfigs;