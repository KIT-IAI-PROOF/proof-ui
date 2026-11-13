import {keepPreviousData, queryOptions, UseQueryOptions} from "@tanstack/react-query";
import {AxiosError} from "axios";
import {workflowService} from "../../services/instances.ts";
import {ExecutionListing, RequestListing, WorkflowDetail, WorkflowPagingModelListing} from "@kit-iai-proof/proof-config-manager-client";
import {EXECUTIONS_KEY, WORKFLOWS_KEY} from "../../utils/constants.ts";

export const searchWorkflowsQueryOptions: (workflowsRequest: RequestListing) => UseQueryOptions<WorkflowPagingModelListing, AxiosError, WorkflowPagingModelListing, (string | RequestListing)[]> = (workflowsRequest: RequestListing): UseQueryOptions<WorkflowPagingModelListing, AxiosError, WorkflowPagingModelListing, (string | RequestListing)[]> => {
    return queryOptions({
            queryKey: [WORKFLOWS_KEY, workflowsRequest],
            refetchOnWindowFocus: true,
            retry: 2,
            enabled: !!workflowsRequest,
            placeholderData: keepPreviousData,
            queryFn: async ({queryKey, signal}: any): Promise<WorkflowPagingModelListing> => {
                return await workflowService.searchWorkflows(signal, queryKey[1]);
            }
        }
    )
}

export const workflowsQueryOptions: () => UseQueryOptions<WorkflowDetail[], AxiosError, WorkflowDetail[], string[]> = (): UseQueryOptions<WorkflowDetail[], AxiosError, WorkflowDetail[], string[]> => {
    return queryOptions({
            queryKey: [WORKFLOWS_KEY],
            refetchOnWindowFocus: true,
            retry: 2,
            queryFn: async ({signal}: any): Promise<WorkflowDetail[]> => {
                return await workflowService.getWorkflows(signal);
            }
        }
    )
};

export const workflowQueryOptions: (workflowId: string | undefined) => UseQueryOptions<WorkflowDetail, AxiosError, WorkflowDetail, (string | undefined)[]> = (workflowId: string | undefined): UseQueryOptions<WorkflowDetail, AxiosError, WorkflowDetail, (string | undefined)[]> => {
    return queryOptions({
            queryKey: [WORKFLOWS_KEY, workflowId],
            enabled: !!workflowId,
            refetchOnWindowFocus: true,
            retry: 2,
            queryFn: async ({queryKey, signal}: any): Promise<WorkflowDetail> => {
                return await workflowService.getWorkflow(queryKey[1], signal);
            }
        }
    )
};

export const executionsForWorkflowQueryOptions: (workflowId: string | undefined) => UseQueryOptions<ExecutionListing[], AxiosError, ExecutionListing[], (string | undefined)[]> = (workflowId: string | undefined): UseQueryOptions<ExecutionListing[], AxiosError, ExecutionListing[], (string | undefined)[]> => {
    return queryOptions({
            queryKey: [EXECUTIONS_KEY, "workflow", workflowId],
            refetchOnWindowFocus: true,
            enabled: !!workflowId,
            retry: 2,
            queryFn: async ({queryKey, signal}: any): Promise<ExecutionListing[]> => {
                return await workflowService.getExecutionsForWorkflow(queryKey[2], signal);
            }
        }
    )
};