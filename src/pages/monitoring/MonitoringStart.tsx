import {Fragment, ReactNode, useContext, useEffect, useState} from "react";
import {NavigateFunction, useNavigate, useParams} from "react-router-dom";
import {Box, Button, ButtonGroup, Paper, Stack, Tooltip, Typography} from "@mui/material";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import {useTranslation} from "react-i18next";
import {IMonitoringContext} from "../../provider/MonitoringProvider";
import PreselectedStart from "./components/PreselectedStart.tsx";
import UnselectedStart from "./components/UnselectedStart.tsx";
import Grid from "@mui/material/Grid2";
import {AttachmentDetail, BlockDetail, ExecutionDetail, ExecutionDetailStatusEnum, InputDetail, WorkflowDetail} from "@kit-iai-proof/proof-config-manager-client";
import {Info} from "@mui/icons-material";
import {MonitoringContext} from "../../provider/MonitoringContext.tsx";
import {IAppContext} from "../../provider/AppProvider.tsx";
import {AppContext} from "../../provider/AppContext.tsx";
import {useMutation, UseMutationResult, useQuery, useQueryClient, UseQueryResult} from "@tanstack/react-query";
import {AxiosError} from "axios";
import {v4 as uuidv4} from "uuid";
import {ENTITY_TYPES, EXECUTIONS_KEY, INVALIDATION_KEYS, PAGE_CONTAINER_PADDING} from "../../utils/constants.ts";
import {getErrorMessage} from "../../utils/error.ts";
import {executionService, orchestrationService} from "../../services/instances.ts";
import {workflowQueryOptions} from "../../query/options/workflowQueryOptions.tsx";
import {executionsQueryOptions} from "../../query/options/executionQueryOptions.tsx";

const MonitoringStart: () => ReactNode = (): ReactNode => {

    const {t} = useTranslation();
    const {workflowId} = useParams();
    const navigate: NavigateFunction = useNavigate();
    const queryClient = useQueryClient();
    const {
        execParameters,
        execStartValues,
        execDefaultValues,
        executionLabel,
        executionDescription,
        simulationStartPoint,
        simulationEndPoint,
        simulationDuration,
        simulationTimeoutWorker,
        simulationTimeoutInput,
        updateMissingRequiredFields
    } = useContext<IMonitoringContext>(MonitoringContext);
    const {sessionKey}: IAppContext = useContext<IAppContext>(AppContext);
    const [jsonError, setJsonError] = useState<{ [key: string]: string | undefined; }>({});

    useEffect(() => {
        updateMissingRequiredFields([])
    }, [updateMissingRequiredFields]);

    const {data: workflow}: UseQueryResult<WorkflowDetail, AxiosError> = useQuery(workflowQueryOptions(workflowId));
    const {data: executions}: UseQueryResult<ExecutionDetail[], AxiosError> = useQuery(executionsQueryOptions());

    const executionMutation: UseMutationResult<ExecutionDetail, AxiosError, ExecutionDetail, any> = useMutation({
        retry: false,
        mutationFn: async (execution: ExecutionDetail): Promise<ExecutionDetail> => {
            if (execution.id) return await executionService.updateExecution(execution.id, execution, undefined, sessionKey);
            else return await executionService.saveExecution({...execution, id: uuidv4()}, undefined, sessionKey);
        },
        onMutate: async (): Promise<void> => {
            return await queryClient.cancelQueries({queryKey: [EXECUTIONS_KEY]});
        },
        onSuccess: async (result: ExecutionDetail): Promise<void> => {
            for (const queryKey of INVALIDATION_KEYS[EXECUTIONS_KEY]) await queryClient.invalidateQueries({
                queryKey: [queryKey],
                exact: false
            });
            await queryClient.setQueryData([EXECUTIONS_KEY, result.id], result);
        },
        onError: (error: AxiosError): void => {
            getErrorMessage(error, ENTITY_TYPES[EXECUTIONS_KEY], t)
        }
    });

    const validateRequiredFields: () => boolean = (): boolean => {
        const missing: string[] = [];

        executions?.forEach((execution: ExecutionDetail): void => {
            if (execution.status !== ExecutionDetailStatusEnum.Stopped && execution.status !== ExecutionDetailStatusEnum.Aborted && execution.status !== ExecutionDetailStatusEnum.ShutDown) {
                missing.push('executionRunning:' + execution.label + '__' + execution.status);
            }
        })

        if (workflow?.blocks?.length === 0) {
            missing.push('missingBlock')
        }

        workflow?.blocks?.forEach((block: BlockDetail): void => {
            if (block.inputs?.length === 0 && block.outputs?.length === 0) {
                if (!missing.includes('missingHandles:' + block.id + '__' + block.label))
                    missing.push('missingHandles:' + block.id + '__' + block.label);
            }

            block.inputs?.forEach((handle: InputDetail): void => {
                if (handle.required && handle.communicationType?.includes("_STATIC")) {
                    const value: string = execParameters[handle.id!];
                    if (value === undefined || value === null || value.toString().trim() === "") {
                        missing.push(handle.id!)
                    }
                }
            });
            if (!block.program) {
                if (!missing.includes('missingProgram:' + block.id + '__' + block.label!))
                    missing.push('missingProgram:' + block.id + '__' + block.label!);
            } else if (!block.program.entryPoint) {
                if (!missing.includes('missingProgramEntryPoint:' + block.program.id + '__' + block.program.label!))
                    missing.push('missingProgramEntryPoint:' + block.program.id + '__' + block.program.label!);
            } else {
                const entryPoint = block.program.attachments!.find((attachment: AttachmentDetail) => attachment.id === block.program?.entryPoint)
                if (!entryPoint?.path || entryPoint.path.trim() === "") {
                    if (!missing.includes('missingEntryPointPath:' + entryPoint?.id + '__' + entryPoint?.label))
                        missing.push('missingEntryPointPath:' + entryPoint?.id + '__' + entryPoint?.label);
                }
            }
        });

        if (!executionLabel || executionLabel === '') {
            missing.push('missingLabel');
        }

        if (!workflow?.simulationStrategy) {
            missing.push('missingStrategy');
        }

        if (!workflow?.communicationParadigm) {
            missing.push('missingParadigm');
        }

        updateMissingRequiredFields(missing);
        return missing.length === 0;
    };

    const startExecution = async () => {
        if (!validateRequiredFields()) return;
        // Create a copy of workflow with updated simulation config
        const workflowWithSimConfig = workflow ? {
            ...workflow,
            stepBasedConfig: {
                ...workflow?.stepBasedConfig,
                startPoint: simulationStartPoint !== undefined ? Number(simulationStartPoint) : workflow?.stepBasedConfig?.startPoint,
                endPoint: simulationEndPoint !== undefined ? Number(simulationEndPoint) : workflow?.stepBasedConfig?.endPoint,
                duration: simulationDuration !== undefined ? Number(simulationDuration) : workflow?.stepBasedConfig?.duration,
                workerTimeout: simulationTimeoutWorker !== undefined ? Number(simulationTimeoutWorker) : workflow?.stepBasedConfig?.workerTimeout,
                inputTimeout: simulationTimeoutInput !== undefined ? Number(simulationTimeoutInput) : workflow?.stepBasedConfig?.inputTimeout
            }
        } : undefined;

        await executionMutation
            .mutateAsync({
                options: {
                    override: false,
                    manual: false
                },
                workflow: workflowWithSimConfig,
                execParameters: execParameters,
                label: executionLabel,
                description: executionDescription,
                status: ExecutionDetailStatusEnum.Unknown,
                ...(execStartValues && Object.keys(execStartValues).length > 0 && {execStartValues: execStartValues}),
                ...(execDefaultValues && Object.keys(execDefaultValues).length > 0 && {execDefaultValues: execDefaultValues})
            } as any)
            .then(async (result: ExecutionDetail): Promise<void> => {
                if (result.id) {
                    navigate(`/monitoring/${result.id}`)
                    await orchestrationService.startExecution(undefined, result.id)
                }
            })
    }

    return (
        <Fragment>
            <Box
                {...PAGE_CONTAINER_PADDING}
            >
                <Paper elevation={0}>
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
                                    <Typography variant={"h4"}>
                                        {t("page.header.execution")}
                                        <Tooltip title={t("tooltip.execution")}>
                                            <Info sx={{ml: 1, cursor: "pointer"}}/>
                                        </Tooltip>
                                    </Typography>
                                </Stack>
                            </Grid>
                            <Grid size={{sm: 12, md: "auto"}}>
                                <Stack
                                    direction={"row"}
                                    justifyContent={"flex-end"}>
                                    <ButtonGroup>
                                        <Button
                                            color={"primary"}
                                            variant={"outlined"}
                                            disabled={!workflowId || Object.values(jsonError).some((error: string | undefined): boolean => error !== undefined)}
                                            onClick={async (): Promise<void> => {
                                                await startExecution();
                                            }}
                                        >
                                            {t("action.execute")}
                                        </Button>
                                    </ButtonGroup>
                                </Stack>
                            </Grid>
                        </Grid>
                        <Stack spacing={1}>
                            {
                                workflowId ?
                                    <PreselectedStart jsonError={jsonError} setJsonError={setJsonError} workflowId={workflowId}></PreselectedStart>
                                    :
                                    <UnselectedStart/>
                            }
                        </Stack>
                    </Box>
                </Paper>
            </Box>
        </Fragment>
    );

};

export default MonitoringStart;