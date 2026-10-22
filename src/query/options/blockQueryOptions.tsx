import {keepPreviousData, queryOptions, UseQueryOptions} from "@tanstack/react-query";
import {AxiosError} from "axios";
import {blockService} from "../../services/instances.ts";
import {BlockDetail, BlockPagingModelListing, RequestListing} from "@kit-iai-proof/proof-config-manager-client";
import {BLOCKS_KEY} from "../../utils/constants.ts";

export const searchBlocksQueryOptions: (blocksRequest: RequestListing) => UseQueryOptions<BlockPagingModelListing, AxiosError, BlockPagingModelListing, (string | RequestListing)[]> = (blocksRequest: RequestListing): UseQueryOptions<BlockPagingModelListing, AxiosError, BlockPagingModelListing, (string | RequestListing)[]> => {
    return queryOptions({
            queryKey: [BLOCKS_KEY, blocksRequest],
            refetchOnWindowFocus: true,
            retry: 2,
            enabled: !!blocksRequest,
            placeholderData: keepPreviousData,
            queryFn: async ({queryKey, signal}: any): Promise<BlockPagingModelListing> => {
                return await blockService.searchBlocks(signal, queryKey[1]);
            }
        }
    )
}

export const blocksQueryOptions: () => UseQueryOptions<BlockDetail[], AxiosError, BlockDetail[], string[]> = (): UseQueryOptions<BlockDetail[], AxiosError, BlockDetail[], string[]> => {
    return queryOptions({
            queryKey: [BLOCKS_KEY],
            refetchOnWindowFocus: true,
            retry: 2,
            queryFn: async ({signal}: any): Promise<BlockDetail[]> => {
                return await blockService.getBlocks(signal);
            }
        }
    )
};

export const blockQueryOptions: (blockId: string | undefined) => UseQueryOptions<BlockDetail, AxiosError, BlockDetail, (string | undefined)[]> = (blockId: string | undefined): UseQueryOptions<BlockDetail, AxiosError, BlockDetail, (string | undefined)[]> => {
    return queryOptions({
            queryKey: [BLOCKS_KEY, blockId],
            enabled: !!blockId,
            refetchOnWindowFocus: true,
            retry: 2,
            queryFn: async ({queryKey, signal}: any): Promise<BlockDetail> => {
                return await blockService.getBlock(queryKey[1], signal);
            }
        }
    )
};