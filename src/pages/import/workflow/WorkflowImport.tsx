import {Fragment, ReactNode, useContext, useState} from "react";
import {Box, Button, Divider, Paper, Tooltip} from "@mui/material";
import {useTranslation} from "react-i18next";
import {FileUpload, Save} from "@mui/icons-material";
import {WorkflowDetail} from "@webis/proof-config-manager-client";
import {QueryClient, useMutation, UseMutationResult, useQueryClient} from "@tanstack/react-query";
import {AxiosError} from "axios";
import {v4 as uuidv4} from "uuid";
import {ENTITY_TYPES, INVALIDATION_KEYS, PAGE_CONTAINER_PADDING, WORKFLOWS_KEY} from "../../../utils/constants.ts";
import {getErrorMessage} from "../../../utils/error.ts";
import {workflowService} from "../../../services/instances.ts";
import {AppContext} from "../../../provider/AppContext.tsx";
import {IAppContext} from "../../../provider/AppProvider.tsx";
import PageHeader from "../../../app/components/PageHeader.tsx";
import UploadPanel from "../../../app/components/UploadPanel.tsx";

const WorkflowImport: () => ReactNode = (): ReactNode => {

    const {t} = useTranslation();
    const queryClient: QueryClient = useQueryClient();
    const {updateError, sessionKey} = useContext<IAppContext>(AppContext);
    const [value, setValue] = useState<WorkflowDetail | undefined>(undefined);
    const [error, setError] = useState<string>();

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

    const handleChange: (e: any) => void = (e: any) => {
        const fileReader = new FileReader();
        fileReader.readAsText(e.target.files[0], "UTF-8");
        fileReader.onload = ({target}): void => {
            if (target) {
                const content: string | undefined = target?.result?.toString();
                if (content) {
                    const value: WorkflowDetail = JSON.parse(content);
                    setValue(value);
                }
            }
        };
    };

    return (
        <Fragment>
            <Box
                {...PAGE_CONTAINER_PADDING}
            >
                <Paper elevation={0}>
                    <Box padding={3}>
                        <PageHeader
                            headerKey={"page.header.import.workflow"}
                            tooltipTitle={"tooltip.workflow"}
                            icon={
                                <Fragment>
                                    <FileUpload
                                        color={"primary"}
                                        fontSize={"large"}
                                    />
                                </Fragment>
                            }
                            subHeaderValue={""}
                            buttons={
                                <Fragment>
                                    <Tooltip title={t("action.importWorkflow")}>
                                        <Button
                                            disabled={!value}
                                            startIcon={<Save/>}
                                            variant={"outlined"}
                                            onClick={async (): Promise<void> => {
                                                if (value) {
                                                    await workflowMutation.mutateAsync(value)
                                                }
                                            }}
                                            color={"primary"}>
                                            {t("action.import")}
                                        </Button>
                                    </Tooltip>
                                </Fragment>
                            }
                        />
                        <Divider/>
                        <UploadPanel
                            accept={"application/json"}
                            handleChange={handleChange}
                            value={value}
                            setValue={setValue}
                            error={error}
                            setError={setError}
                        />
                    </Box>
                </Paper>
            </Box>
        </Fragment>
    );

};

export default WorkflowImport;