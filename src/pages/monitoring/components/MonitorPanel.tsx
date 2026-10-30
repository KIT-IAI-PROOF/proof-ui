import {Fragment, ReactNode, useContext, useState} from "react";
import {Box, Button, ButtonGroup, Paper, Stack, Theme, Typography, useColorScheme, useMediaQuery, useTheme} from "@mui/material";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import {Background, BackgroundVariant, ReactFlow} from "@xyflow/react";
import {TEdge} from "../../../model/TEdge.ts";
import {TBlock} from "../../../model/TBlock.ts";
import Grid from "@mui/material/Grid2";
import {ExecutionDetail, ExecutionDetailStatusEnum, ExecutionListingStatusEnum} from "@kit-iai-proof/proof-config-manager-client";
import {saveAs} from 'file-saver';
import {useTranslation} from "react-i18next";
import {NavigateFunction, useNavigate, useParams} from "react-router-dom";
import {useMutation, UseMutationResult, useQuery, useQueryClient, UseQueryResult} from "@tanstack/react-query";
import {IAppContext} from "../../../provider/AppProvider.tsx";
import {AppContext} from "../../../provider/AppContext.tsx";
import {IMonitoringContext} from "../../../provider/MonitoringProvider.tsx";
import {MonitoringContext} from "../../../provider/MonitoringContext.tsx";
import {AxiosError} from "axios";
import {executionQueryOptions} from "../../../query/options/executionQueryOptions.tsx";
import {ENTITY_TYPES, EXECUTIONS_KEY, INVALIDATION_KEYS, PAGE_CONTAINER_PADDING} from "../../../utils/constants.ts";
import {getErrorMessage} from "../../../utils/error.ts";
import ConfirmDialog from "../../../app/components/ConfirmDialog.tsx";
import {executionService, orchestrationService} from "../../../services/instances.ts";
import ExecutionSettingsPanel from "./ExecutionSettingsPanel.tsx";
import {IWindowContext} from "../../../provider/WindowProvider.tsx";
import {WindowContext} from "../../../provider/WindowContext.tsx";
import {v4 as uuidv4} from "uuid";

const MonitorPanel: () => ReactNode = (): ReactNode => {

    const navigate: NavigateFunction = useNavigate();
    const {mode} = useColorScheme();
    const theme: Theme = useTheme();
    const {t} = useTranslation();
    const {executionId} = useParams();
    const queryClient = useQueryClient();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const [deleteExecutionDialogOpen, setDeleteExecutionDialogOpen] = useState<boolean>(false);

    const {sessionKey}: IAppContext = useContext<IAppContext>(AppContext);

    const {nodes, nodeTypes, edgeTypes, edges, resetEditor} = useContext<IMonitoringContext>(MonitoringContext);
    const {handleOpenWindow} = useContext<IWindowContext>(WindowContext);

    const {data: execution}: UseQueryResult<ExecutionDetail, AxiosError> = useQuery(executionQueryOptions(executionId));

    const executionDeletion: UseMutationResult<boolean, AxiosError, string, void> = useMutation({
        retry: false,
        mutationFn: async (executionId: string): Promise<boolean> => {
            return await executionService.deleteExecution(executionId, undefined, sessionKey);
        },
        onSuccess: async (): Promise<void> => {
            // Deactivate the status/value websocket before the detail view unmounts, otherwise the
            // STOMP client keeps reconnecting and RabbitMQ re-declares the deleted stream queues.
            resetEditor();
            for (const queryKey of INVALIDATION_KEYS[EXECUTIONS_KEY]) await queryClient.invalidateQueries({
                queryKey: [queryKey],
                exact: false
            });
        },
        onError: (error: AxiosError): void => {
            getErrorMessage(error, ENTITY_TYPES[EXECUTIONS_KEY], t)
        }
    });

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

    const restartExecution = async (): Promise<void> => {
        if (!execution) return;
        const executionToRestart: ExecutionDetail = await executionMutation.mutateAsync({
            ...execution,
            id: undefined,
            startedAt: undefined,
            stoppedAt: undefined,
            status: ExecutionDetailStatusEnum.Unknown,
        });
        if (executionToRestart.id) {
            navigate(`/monitoring/${executionToRestart.id}`);
            await orchestrationService.startExecution(undefined, executionToRestart.id);
        }
    }

    return (
        <Fragment>
            <Box{...PAGE_CONTAINER_PADDING}>
                <Paper elevation={0} sx={{pb: 3}}>
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
                                        fontSize={"large"}
                                    />
                                    <Typography variant={"h4"}>{t("page.header.monitoring.detail")}</Typography>
                                </Stack>
                            </Grid>
                            <Grid size={{xs: 12, lg: "auto"}}>
                                <Stack
                                    direction={"row"}
                                    justifyContent={"flex-end"}
                                    spacing={1}
                                >
                                    <ButtonGroup
                                        orientation={isMobile ? "vertical" : "horizontal"}
                                    >
                                        <Button
                                            color={"primary"}
                                            variant={"outlined"}
                                            disabled={execution?.status !== ExecutionListingStatusEnum.Stopped && execution?.status !== ExecutionListingStatusEnum.Aborted && execution?.status !== ExecutionListingStatusEnum.ShutDown}
                                            onClick={async (): Promise<void> => {
                                                await restartExecution()
                                            }}
                                        >
                                            {t('action.restart')}
                                        </Button>
                                        <Button
                                            color={"primary"}
                                            variant={"outlined"}
                                            disabled={execution?.status === ExecutionDetailStatusEnum.Stopped || execution?.status === ExecutionDetailStatusEnum.Aborted || execution?.status === ExecutionDetailStatusEnum.ShutDown}
                                            onClick={async (): Promise<void> => {
                                                if (execution?.id) await orchestrationService.abortExecution(undefined, execution.id)
                                            }}
                                        >
                                            {t('action.stop')}
                                        </Button>
                                        <Button
                                            color={"primary"}
                                            variant={"outlined"}
                                            onClick={(): void => {
                                                if (executionId) handleOpenWindow(executionId, `execution.${executionId}`, "log");
                                            }}
                                        >
                                            {t("action.logs")} (Orchestrator)
                                        </Button>
                                        <Button
                                            color={"primary"}
                                            variant={"outlined"}
                                            onClick={async (): Promise<void> => {
                                                if (execution?.id) {
                                                    const file: File = await executionService.exportExecution(execution.id, undefined);
                                                    saveAs(file, "export-" + execution.label + "_" + execution.id + ".proof");
                                                }
                                            }}
                                        >
                                            {t('action.export')}
                                        </Button>
                                        <Button
                                            variant={"outlined"}
                                            color={"error"}
                                            onClick={(): void => {
                                                setDeleteExecutionDialogOpen(true)
                                            }}
                                        >
                                            {t("action.delete")}
                                        </Button>
                                    </ButtonGroup>
                                </Stack>
                            </Grid>
                        </Grid>
                        <Stack spacing={1}>
                            {execution && <ExecutionSettingsPanel execution={execution}/>}
                            <Paper variant={"outlined"}>
                                <Box height={"calc(80vh - 250px)"}>
                                    <ReactFlow<TBlock, TEdge>
                                        id={"monitoring"}
                                        key={"monitoring"}
                                        fitView={true}
                                        zoomOnScroll={false}
                                        zoomOnDoubleClick={false}
                                        zoomOnPinch={false}
                                        draggable={false}
                                        panOnDrag={false}
                                        panOnScroll={false}
                                        style={{borderRadius: "5px"}}
                                        nodes={nodes}
                                        edges={edges}
                                        proOptions={{account: "paid-pro", hideAttribution: true}}
                                        nodeTypes={nodeTypes}
                                        edgeTypes={edgeTypes}
                                        colorMode={mode}
                                        nodesFocusable={false}
                                        nodesConnectable={false}
                                        nodesDraggable={false}
                                        onNodeClick={(_event: any, node: TBlock): void => {
                                            const id: string | undefined = node.data.id;
                                            if (id) handleOpenWindow(id, `block.${id}.execution.${executionId}`, "log")
                                        }}
                                    >
                                        <Background
                                            bgColor={theme.palette.elevated.default}
                                            variant={BackgroundVariant.Dots}
                                        />
                                    </ReactFlow>
                                </Box>
                            </Paper>
                        </Stack>
                    </Box>
                </Paper>
            </Box>
            <ConfirmDialog
                dialogTitle={t("dialog.header.confirmDelete")}
                confirmAction={t("action.delete")}
                open={deleteExecutionDialogOpen}
                setOpen={setDeleteExecutionDialogOpen}
                callback={() => {
                    if (execution?.id) {
                        executionDeletion
                            .mutateAsync(execution.id)
                            .then((): void => {
                                navigate(`/monitoring/`);
                            })
                            .catch((): void => {
                                navigate(`/monitoring/`);
                            });
                    }
                }}
            />
        </Fragment>
    );

}

export default MonitorPanel;