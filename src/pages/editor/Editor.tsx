import {Fragment, ReactNode, useContext, useEffect, useState} from "react";
import {
    Box,
    Button,
    ButtonGroup,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Popover,
    Select,
    SelectChangeEvent,
    Stack,
    Theme,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import EditorBoard from "./components/EditorBoard.tsx";
import AccountTreeRoundedIcon from "@mui/icons-material/AccountTreeRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import {IEditorContext} from "../../provider/EditorProvider.tsx";
import {useTranslation} from "react-i18next";
import {InputDetailTypeEnum, WorkflowDetail, WorkflowDetailCommunicationParadigmEnum, WorkflowDetailSimulationStrategyEnum} from "@webis/proof-config-manager-client";
import {NavigateFunction, useLocation, useNavigate, useParams} from "react-router-dom";
import {convertRemoteBlocks, convertRemoteEdges} from "../../utils/storage/outboundConverter.ts";
import TerminalIcon from "@mui/icons-material/Terminal";
import SaveIcon from "@mui/icons-material/Save";
import SettingsIcon from "@mui/icons-material/Settings";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import {Info} from "@mui/icons-material";
import {saveAs} from "file-saver";
import {getTypeColor} from "../../utils/palette.ts";
import {EditorContext} from "../../provider/EditorContext.tsx";
import {IAppContext} from "../../provider/AppProvider.tsx";
import {AppContext} from "../../provider/AppContext.tsx";
import {ENTITY_TYPES, INVALIDATION_KEYS, PAGE_CONTAINER_PADDING, STEPBASEDCONFIG_DEFAULT, WORKFLOWS_KEY} from "../../utils/constants.ts";
import dayjs from "dayjs";
import {useMutation, UseMutationResult, useQuery, useQueryClient, UseQueryResult} from "@tanstack/react-query";
import {AxiosError} from "axios";
import {workflowService} from "../../services/instances.ts";
import {v4 as uuidv4} from "uuid";
import {getErrorMessage} from "../../utils/error.ts";
import {workflowQueryOptions, workflowsQueryOptions} from "../../query/options/workflowQueryOptions.tsx";

const Editor: () => ReactNode = (): ReactNode => {

    const {t} = useTranslation();
    const {workflowId} = useParams();
    const theme: Theme = useTheme();
    const navigate: NavigateFunction = useNavigate();
    const location = useLocation();
    const queryClient = useQueryClient();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const [anchorEl, setAnchorEl] = useState(null);
    const open: boolean = Boolean(anchorEl);

    const {edges, nodes, updateWorkflow, resetEditor} = useContext<IEditorContext>(EditorContext);
    const {
        hasUnsavedChanges,
        publishEntityMessage,
        sessionKey,
        updateHasUnsavedChanges,
        palette,
        lastUsedWorkflowId,
        updateError
    } = useContext<IAppContext>(AppContext);

    const {data: workflow}: UseQueryResult<WorkflowDetail, AxiosError> = useQuery(workflowQueryOptions(workflowId));
    const {data: workflows}: UseQueryResult<WorkflowDetail[], AxiosError> = useQuery(workflowsQueryOptions());

    const workflowsMutation: UseMutationResult<WorkflowDetail, AxiosError, WorkflowDetail, any> = useMutation({
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

    const handleOpenLegend: (event: any) => void = (event: any): void => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseLegend: () => void = (): void => {
        setAnchorEl(null);
    };

    useEffect((): void => {
        if (workflow) updateWorkflow(workflow);
    }, [workflow, updateWorkflow]);

    useEffect((): void => {
        const from: any = location.state?.from;
        if (!(from && (from.includes('/editor') || from.includes('/configs/workflows')))) {
            if (lastUsedWorkflowId && lastUsedWorkflowId !== workflowId) {
                publishEntityMessage(lastUsedWorkflowId, "workflows");
                resetEditor();
                navigate(`/editor/${lastUsedWorkflowId}`, {state: {from: location.pathname}});
            }
        }
    }, [lastUsedWorkflowId, location, navigate, publishEntityMessage, resetEditor, workflowId]);

    return (
        <Fragment>
            <Box
                {...PAGE_CONTAINER_PADDING}
            >
                <Paper>
                    <Box padding={3}>
                        <Grid
                            container={true}
                            justifyContent={"space-between"}
                            alignItems={"center"}
                            paddingBottom={1}
                            spacing={1}
                        >
                            <Grid>
                                <Stack
                                    direction={"row"}
                                    spacing={1}>
                                    <AccountTreeRoundedIcon
                                        color={"primary"}
                                        fontSize={"large"}
                                    />
                                    <Typography variant={"h4"}>{t("page.header.editor")}</Typography>
                                </Stack>
                            </Grid>
                            <Grid size={{xs: 12, lg: "auto"}}>
                                <Stack direction={"row"} spacing={1}>
                                    <Box>
                                        {
                                            workflows && <FormControl
                                                fullWidth={true}
                                                color={"primary"}
                                                variant={"outlined"}
                                                size={"small"}
                                                sx={{minWidth: "150px"}}
                                            >
                                                <InputLabel id={"workflow-label"}>Workflow</InputLabel>
                                                <Select
                                                    color={"primary"}
                                                    labelId="workflow-label"
                                                    id="workflow"
                                                    label="Workflow"
                                                    variant={"outlined"}
                                                    value={workflowId ?? ""}
                                                    onChange={(event: SelectChangeEvent): void => {
                                                        publishEntityMessage(event.target.value, "workflows")
                                                        resetEditor();
                                                        navigate(`/editor/${event.target.value}`, {state: {from: location.pathname}})
                                                    }}
                                                >

                                                    <MenuItem value={""}>
                                                        <Typography
                                                            variant={"body1"}
                                                            fontStyle={"italic"}>{t("word.unselected")}
                                                        </Typography>
                                                    </MenuItem>
                                                    {
                                                        workflows?.map((workflow: WorkflowDetail): ReactNode => {
                                                            return (
                                                                <MenuItem
                                                                    key={workflow.id}
                                                                    value={workflow.id}
                                                                    style={{fontWeight: lastUsedWorkflowId === workflow.id ? "bold" : "inherit"}}
                                                                >
                                                                    {workflow.label}
                                                                </MenuItem>
                                                            );
                                                        })
                                                    }
                                                </Select>
                                            </FormControl>
                                        }
                                    </Box>
                                    <Box>
                                        <Tooltip title={t("action.addWorkflow")}>
                                            <IconButton
                                                color={"primary"}
                                                onClick={async (): Promise<void> => {
                                                    await workflowsMutation
                                                        .mutateAsync({
                                                            label: `workflow-${dayjs().format("DD.MM.YYYY")}`,
                                                            description: `workflow-${dayjs().format("DD.MM.YYYY")}`,
                                                            communicationParadigm: WorkflowDetailCommunicationParadigmEnum.Stepbased,
                                                            simulationStrategy: WorkflowDetailSimulationStrategyEnum.WaitAndContinue,
                                                            stepBasedConfig: STEPBASEDCONFIG_DEFAULT,
                                                            blocks: [],
                                                            connections: []
                                                        })
                                                        .then((result: WorkflowDetail): void => {
                                                            if (result.id) {
                                                                publishEntityMessage(result.id, "workflows")
                                                                resetEditor();
                                                                navigate(`/configs/workflows/${result.id}?workflowId=${result.id}`, {state: {from: location.pathname}})
                                                            }
                                                        });
                                                }}
                                            >
                                                <AddRoundedIcon color={"primary"}/>
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </Stack>
                            </Grid>
                            <Grid size={{xs: 12, lg: "auto"}}>
                                <Stack direction={"row"} spacing={1}>
                                    <ButtonGroup
                                        orientation={isMobile ? "vertical" : "horizontal"}
                                    >
                                        <Button
                                            startIcon={<SaveIcon/>}
                                            disabled={!workflow || !hasUnsavedChanges}
                                            onClick={async (): Promise<void> => {
                                                await workflowsMutation.mutateAsync({
                                                    ...workflow,
                                                    connections: convertRemoteEdges(edges),
                                                    blocks: convertRemoteBlocks(nodes)
                                                });
                                                if (hasUnsavedChanges) updateHasUnsavedChanges(false);
                                            }}
                                            color={"primary"}
                                            variant={"outlined"}
                                        >
                                            {t("action.save")}
                                        </Button>
                                        <Button
                                            onClick={(): void => navigate(`/monitoring/execution/${workflow?.id}`)}
                                            startIcon={<TerminalIcon/>}
                                            disabled={!workflow}
                                            color={"primary"}
                                            variant={"outlined"}
                                        >
                                            {t("action.run")}
                                        </Button>
                                        <Button
                                            onClick={(): void => navigate(`/configs/workflows/${workflow?.id}?workflowId=${workflow?.id}`)}
                                            disabled={!workflow}
                                            startIcon={<SettingsIcon/>}
                                            color={"primary"}
                                            variant={"outlined"}
                                        >
                                            {t("action.settings")}
                                        </Button>
                                        <Button
                                            onClick={async (): Promise<void> => {
                                                if (workflow?.id) {
                                                    const file: File = await workflowService.exportWorkflow(workflow.id, undefined);
                                                    saveAs(file, "workflow-" + workflow.label + "_" + workflow.id + ".proof");
                                                }
                                            }}
                                            disabled={!workflow}
                                            startIcon={<FileDownloadIcon/>}
                                            color={"primary"}
                                            variant={"outlined"}
                                        >
                                            {t("action.export")}
                                        </Button>
                                    </ButtonGroup>
                                    <Box>
                                        <Tooltip title={t("action.showLegend")}>
                                            <IconButton color="primary" onClick={handleOpenLegend}>
                                                <Info color={"primary"}/>
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </Stack>
                            </Grid>
                            <Popover
                                open={open}
                                anchorEl={anchorEl}
                                onClose={handleCloseLegend}
                                anchorOrigin={{
                                    vertical: "bottom",
                                    horizontal: "left",
                                }}
                                transformOrigin={{
                                    vertical: "top",
                                    horizontal: "left",
                                }}
                                sx={{margin: 1}}
                            >
                                <Paper sx={{padding: 2, width: 250}}>
                                    <Typography variant="h6" gutterBottom>
                                        {t("popover.header.legend")}
                                    </Typography>
                                    {
                                        Object.values(InputDetailTypeEnum)
                                            .filter((type: string) => !type.endsWith("_ARRAY"))
                                            .map((type: string): ReactNode => {
                                                return (
                                                    <Stack
                                                        direction={"row"}
                                                        spacing={1}
                                                        paddingBottom={1}
                                                        sx={{alignItems: "center", justifyContent: "space-between"}}
                                                        key={type}>
                                                        <div style={{
                                                            width: "50px",
                                                            height: "25px",
                                                            borderRadius: "5px",
                                                            background: getTypeColor(type, palette)
                                                        }}></div>
                                                        <Typography variant={"body1"}>{type}</Typography>
                                                    </Stack>
                                                );
                                            })
                                    }
                                </Paper>
                            </Popover>
                        </Grid>
                        <EditorBoard/>
                    </Box>
                </Paper>
            </Box>
        </Fragment>
    );

};

export default Editor;