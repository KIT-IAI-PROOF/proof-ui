import {BlockDetail, BlockPagingModelListing, RequestListing as Request} from "@webis/proof-config-manager-client";

export interface IBlockService {

    searchBlocks(signal: AbortSignal | undefined, request: Request): Promise<BlockPagingModelListing>;

    getBlocks(signal: AbortSignal | undefined): Promise<BlockDetail[]>;

    getBlock(blockId: string, signal: AbortSignal | undefined): Promise<BlockDetail>;

    saveBlock(block: BlockDetail, signal: AbortSignal | undefined, sessionKey: string): Promise<BlockDetail>;

    updateBlock(blockId: string, block: BlockDetail, signal: AbortSignal | undefined, sessionKey: string): Promise<BlockDetail>;

    deleteBlock(blockId: string, signal: AbortSignal | undefined, sessionKey: string): Promise<boolean>;

}