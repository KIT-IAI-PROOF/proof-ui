import {Fragment, ReactNode, useContext, useEffect, useState} from "react";
import {NavigateFunction, useNavigate, useParams, useSearchParams} from "react-router-dom";
import {Alert, Box, Button, Divider, Paper, Stack, Typography} from "@mui/material";
import WorkflowBasicSettingsPanel from "../components/workflow/WorkflowBasicSettingsPanel.tsx";
import {ExecutionListing, StepBasedConfigurationDetail, WorkflowDetail, WorkflowDetailCommunicationParadigmEnum, WorkflowDetailSimulationStrategyEnum} from "@kit-iai-proof/proof-config-manager-client";
import {useTranslation} from "react-i18next";
import {useMutation, UseMutationResult, useQuery, useQueryClient, UseQueryResult} from "@tanstack/react-query";
import {ENTITY_TYPES, INVALIDATION_KEYS, PAGE_CONTAINER_PADDING, STEPBASEDCONFIG_DEFAULT, WORKFLOWS_KEY} from "../../../utils/constants.ts";
import PageHeader from "../../../app/components/PageHeader.tsx";
import WorkflowStepBasedConfigPanel from "../components/workflow/WorkflowStepBasedConfigPanel.tsx";
import {EditNoteRounded} from "@mui/icons-material";
import ConfirmDialog from "../../../app/components/ConfirmDialog.tsx";
import {IAppContext} from "../../../provider/AppProvider.tsx";
import {AppContext} from "../../../provider/AppContext.tsx";
import {AxiosError} from "axios";
import {workflowService} from "../../../services/instances.ts";
import {v4 as uuidv4} from "uuid";
import {saveAs} from "file-saver";
import {getErrorMessage} from "../../../utils/error.ts";
import {executionsForWorkflowQueryOptions, workflowQueryOptions} from "../../../query/options/workflowQueryOptions.tsx";

const MonitoringDetail: () => ReactNode = (): ReactNode => {

    const {t} = useTranslation();
    const {workflowId} = useParams();
    const [searchParams] = useSearchParams();
    const queryClient = useQueryClient();
    const {
        hasUnsavedChanges,
        updateError,
        sessionKey,
        updateLastUsedWorkflowId,
        updateHasUnsavedChanges,
        updateAllowNavigation
    } = useContext<IAppContext>(AppContext);
    const navigate: NavigateFunction = useNavigate();
    const returnToWorkflowId: string | null = searchParams.get("workflowId");

    const [stepBasedConfig, setStepBasedConfig] = useState<StepBasedConfigurationDetail | undefined>(undefined);
    const [communicationParadigm, setCommunicationParadigm] = useState<WorkflowDetailCommunicationParadigmEnum | undefined>(undefined);
    const [simulationStrategy, setSimulationStrategy] = useState<WorkflowDetailSimulationStrategyEnum | undefined>(undefined);
    const [description, setDescription] = useState<string | undefined>(undefined);
    const [label, setLabel] = useState<string | undefined>(undefined);
    const [id, setId] = useState<string | undefined>(undefined);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
    const [labelError, setLabelError] = useState<boolean>(false);
    const [paradigmError, setParadigmError] = useState<boolean>(false);
    const [simulationStrategyError, setSimulationStrategyError] = useState<boolean>(false);
    const [keyErrors, setKeyErrors] = useState<{ [key: string]: boolean }>({});

    const {data: workflow}: UseQueryResult<WorkflowDetail, AxiosError> = useQuery(workflowQueryOptions(workflowId));
    const {data: executionsForWorkflow}: UseQueryResult<ExecutionListing[], AxiosError> = useQuery(executionsForWorkflowQueryOptions(workflowId));

    const workflowMutation: UseMutationResult<WorkflowDetail, AxiosError, WorkflowDetail, any> = useMutation({
        retry: false,
        mutationFn: async (workflow: WorkflowDetail): Promise<WorkflowDetail> => {
            if (workflow.id) return await workflowService.updateWorkflow(workflow.id, workflow, undefined, sessionKey);
            else return await workflowService.saveWorkflow({...workflow, id: uuidv4()}, undefined, sessionKey);
        },
        onMutate: async (): Promise<void> => {
            return await queryClient.cancelQueries({queryKey: [WORKFLOWS_KEY]});
        },
        onSuccess: async (result: WorkflowDetail): Promise<void> => {
            for (const queryKey of INVALIDATION_KEYS[WORKFLOWS_KEY]) await queryClient.invalidateQueries({
                queryKey: [queryKey],
                exact: false
            });
            await queryClient.setQueryData([WORKFLOWS_KEY, result.id], result);
        },
        onError: (error: AxiosError): void => {
            updateError(getErrorMessage(error, ENTITY_TYPES[WORKFLOWS_KEY], t));
        }
    });

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

    const handleSave = async () => {
        let valid = true;

        if (!label || label.trim() === '') {
            setLabelError(true);
            valid = false;
        } else {
            setLabelError(false);
        }

        if (!communicationParadigm) {
            setParadigmError(true);
            valid = false;
        } else {
            setParadigmError(false);
        }

        if (!simulationStrategy) {
            setSimulationStrategyError(true);
            valid = false;
        } else {
            setSimulationStrategyError(false);
        }

        Object.entries(keyErrors).forEach(([__key, value]) => {
            if (value) valid = false;
        })

        if (!valid) return

        await workflowMutation
            .mutateAsync({
                ...workflow,
                label: label,
                communicationParadigm: communicationParadigm,
                simulationStrategy: simulationStrategy,
                description: description,
                stepBasedConfig: stepBasedConfig,
                id: id
            })
        if (hasUnsavedChanges) updateHasUnsavedChanges(false)
    }

    useEffect((): void => {
        setLabel(workflow?.label);
        setCommunicationParadigm(workflow?.communicationParadigm ?? WorkflowDetailCommunicationParadigmEnum.Stepbased);
        setSimulationStrategy(workflow?.simulationStrategy ?? WorkflowDetailSimulationStrategyEnum.WaitAndContinue);
        setDescription(workflow?.description ?? workflow?.label);
        setStepBasedConfig({...STEPBASEDCONFIG_DEFAULT, ...workflow?.stepBasedConfig});
        setId(workflow?.id);
    }, [workflow?.simulationStrategy, workflow?.communicationParadigm, workflow?.description, workflow?.id, workflow?.label, workflow?.stepBasedConfig, workflowId]);

    return (
        <Fragment>
            <Box
                {...PAGE_CONTAINER_PADDING}
            >
                <Paper elevation={0} sx={{pb: 3}}>
                    <Box padding={3}>
                        <PageHeader
                            headerKey={"page.header.configs.workflow"}
                            tooltipTitle={"tooltip.workflow"}
                            subHeaderValue={workflow?.label ?? ""}
                            icon={
                                <Fragment>
                                    <EditNoteRounded
                                        color={"primary"}
                                        fontSize={"large"}
                                    />
                                </Fragment>
                            }
                            buttons={
                                <Fragment>
                                    <Button
                                        variant={"outlined"}
                                        onClick={async (): Promise<void> => {
                                            navigate(returnToWorkflowId ? `/editor/${returnToWorkflowId}` : `/configs/workflows/`, returnToWorkflowId ? {state: {from: location.pathname}} : {});
                                        }}
                                        color={"primary"}>
                                        {t("action.close")}
                                    </Button>
                                    <Button
                                        disabled={!hasUnsavedChanges}
                                        variant={"outlined"}
                                        onClick={handleSave}
                                        color={"primary"}>
                                        {t("action.save")}
                                    </Button>
                                    <Button
                                        variant={"outlined"}
                                        color={"primary"}
                                        onClick={async (): Promise<void> => {
                                            if (workflow?.id) {
                                                const file: File = await workflowService.exportWorkflow(workflow.id, undefined);
                                                saveAs(file, "workflow-" + workflow.label + "_" + workflow.id + ".proof");
                                            }
                                        }}
                                    >
                                        {t("action.export")}
                                    </Button>
                                    <Button
                                        variant={"outlined"}
                                        color={"error"}
                                        onClick={(): void => {
                                            setDeleteDialogOpen(true)
                                        }}
                                    >
                                        {t("action.delete")}
                                    </Button>
                                </Fragment>
                            }
                        />
                        <Divider/>
                        <WorkflowBasicSettingsPanel
                            id={id}
                            setId={setId}
                            label={label}
                            labelError={labelError}
                            setLabel={setLabel}
                            description={description}
                            setDescription={setDescription}
                            communicationParadigm={communicationParadigm}
                            paradigmError={paradigmError}
                            setCommunicationParadigm={setCommunicationParadigm}
                            simulationStrategy={simulationStrategy}
                            simulationStrategyError={simulationStrategyError}
                            setSimulationStrategy={setSimulationStrategy}
                            stepBasedConfig={stepBasedConfig}
                            modifiedBy={workflow?.lastModifiedBy}
                            createdBy={workflow?.createdBy}
                            modifiedDate={workflow?.lastModifiedDate ? new Date(workflow.lastModifiedDate) : undefined}
                            creationDate={workflow?.creationDate ? new Date(workflow.creationDate) : undefined}
                        />
                        {
                            communicationParadigm === WorkflowDetailCommunicationParadigmEnum.Stepbased &&
                            <WorkflowStepBasedConfigPanel
                                blocks={workflow?.blocks}
                                stepBasedConfig={stepBasedConfig}
                                setStepBasedConfig={setStepBasedConfig}
                                keyErrors={keyErrors}
                                setKeyErrors={setKeyErrors}
                            />
                        }
                    </Box>
                </Paper>
            </Box>
            <ConfirmDialog
                dialogTitle={t("dialog.header.confirmDelete")}
                confirmAction={t("action.delete")}
                open={deleteDialogOpen}
                setOpen={setDeleteDialogOpen}
                extraContent={
                    <Fragment>
                        {
                            executionsForWorkflow && executionsForWorkflow.length > 0 && <Alert severity="error">
                                <Typography paddingBottom={1}>{t("action.deleteAllExecutions")}:</Typography>
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
                            </Alert>
                        }
                    </Fragment>
                }
                callback={() => {
                    updateAllowNavigation(true)
                    if (workflow?.id) {
                        workflowDeletion
                            .mutateAsync(workflow.id)
                            .then((): void => {
                                updateLastUsedWorkflowId("");
                                if (hasUnsavedChanges) updateHasUnsavedChanges(false);
                                updateAllowNavigation(false);
                                navigate(returnToWorkflowId ? `/editor/` : `/configs/workflows/`);
                            })
                            .catch((): void => {
                                navigate(returnToWorkflowId ? `/editor/` : `/configs/workflows/`);
                            });
                    }
                }}
            />
        </Fragment>
    );
};

export default MonitoringDetail;