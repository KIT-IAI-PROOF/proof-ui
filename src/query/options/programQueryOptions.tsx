import {keepPreviousData, queryOptions, UseQueryOptions} from "@tanstack/react-query";
import {AxiosError} from "axios";
import {programService} from "../../services/instances.ts";
import {ProgramDetail, ProgramPagingModelListing, RequestListing} from "@kit-iai-proof/proof-config-manager-client";
import {PROGRAMS_KEY} from "../../utils/constants.ts";

export const searchProgramsQueryOptions: (programsRequest: RequestListing) => UseQueryOptions<ProgramPagingModelListing, AxiosError, ProgramPagingModelListing, (string | RequestListing)[]> = (programsRequest: RequestListing): UseQueryOptions<ProgramPagingModelListing, AxiosError, ProgramPagingModelListing, (string | RequestListing)[]> => {
    return queryOptions({
            queryKey: [PROGRAMS_KEY, programsRequest],
            refetchOnWindowFocus: true,
            retry: 2,
            enabled: !!programsRequest,
            placeholderData: keepPreviousData,
            queryFn: async ({queryKey, signal}: any): Promise<ProgramPagingModelListing> => {
                return await programService.searchPrograms(signal, queryKey[1]);
            }
        }
    )
}

export const programsQueryOptions: () => UseQueryOptions<ProgramDetail[], AxiosError, ProgramDetail[], string[]> = (): UseQueryOptions<ProgramDetail[], AxiosError, ProgramDetail[], string[]> => {
    return queryOptions({
            queryKey: [PROGRAMS_KEY],
            refetchOnWindowFocus: true,
            retry: 2,
            queryFn: async ({signal}: any): Promise<ProgramDetail[]> => {
                return await programService.getPrograms(signal);
            }
        }
    )
};

export const programQueryOptions: (programId: string | undefined) => UseQueryOptions<ProgramDetail, AxiosError, ProgramDetail, (string | undefined)[]> = (programId: string | undefined): UseQueryOptions<ProgramDetail, AxiosError, ProgramDetail, (string | undefined)[]> => {
    return queryOptions({
            queryKey: [PROGRAMS_KEY, programId],
            enabled: !!programId,
            refetchOnWindowFocus: true,
            retry: 2,
            queryFn: async ({queryKey, signal}: any): Promise<ProgramDetail> => {
                return await programService.getProgram(queryKey[1], signal);
            }
        }
    )
};