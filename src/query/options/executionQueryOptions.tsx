import {keepPreviousData, queryOptions, UseQueryOptions} from "@tanstack/react-query";
import {AxiosError} from "axios";
import {ExecutionDetail, ExecutionPagingModelListing, RequestListing} from "@kit-iai-proof/proof-config-manager-client";
import {EXECUTIONS_KEY} from "../../utils/constants.ts";
import {executionService} from "../../services/instances.ts";

export const searchExecutionsQueryOptions: (executionsRequest: RequestListing) => UseQueryOptions<ExecutionPagingModelListing, AxiosError, ExecutionPagingModelListing, (string | RequestListing)[]> = (executionssRequest: RequestListing): UseQueryOptions<ExecutionPagingModelListing, AxiosError, ExecutionPagingModelListing, (string | RequestListing)[]> => {
    return queryOptions({
            queryKey: [EXECUTIONS_KEY, executionssRequest],
            refetchOnWindowFocus: true,
            retry: 2,
            enabled: !!executionssRequest,
            placeholderData: keepPreviousData,
            queryFn: async ({queryKey, signal}: any): Promise<ExecutionPagingModelListing> => {
                return await executionService.searchExecutions(signal, queryKey[1]);
            }
        }
    )
}

export const executionsQueryOptions: () => UseQueryOptions<ExecutionDetail[], AxiosError, ExecutionDetail[], string[]> = (): UseQueryOptions<ExecutionDetail[], AxiosError, ExecutionDetail[], string[]> => {
    return queryOptions({
            queryKey: [EXECUTIONS_KEY],
            refetchOnWindowFocus: true,
            retry: 2,
            queryFn: async ({signal}: any): Promise<ExecutionDetail[]> => {
                return await executionService.getExecutions(signal);
            }
        }
    )
};

export const executionQueryOptions: (executionId: string | undefined) => UseQueryOptions<ExecutionDetail, AxiosError, ExecutionDetail, (string | undefined)[]> = (executionId: string | undefined): UseQueryOptions<ExecutionDetail, AxiosError, ExecutionDetail, (string | undefined)[]> => {
    return queryOptions({
            queryKey: [EXECUTIONS_KEY, executionId],
            enabled: !!executionId,
            refetchOnWindowFocus: true,
            retry: 2,
            queryFn: async ({queryKey, signal}: any): Promise<ExecutionDetail> => {
                return await executionService.getExecution(queryKey[1], signal);
            }
        }
    )
};