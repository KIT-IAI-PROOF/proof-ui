import {BlockControllerApi, BlockDetail, BlockPagingModelListing, Configuration, RequestListing as Request} from "@kit-iai-proof/proof-config-manager-client";
import type {AxiosResponse, RawAxiosRequestConfig} from "axios";
import axios from "../utils/axios";
import {IBlockService} from "./interfaces/IBlockService.ts";

class BlockService implements IBlockService {

    private blockApi: BlockControllerApi;

    constructor(basePath: string) {
        const config: Configuration = new Configuration({basePath: basePath});
        this.blockApi = new BlockControllerApi(config, basePath, axios);
    }

    async searchBlocks(signal: AbortSignal | undefined, request: Request): Promise<BlockPagingModelListing> {
        const options: RawAxiosRequestConfig = {signal: signal};
        const response: AxiosResponse<BlockPagingModelListing> = await this.blockApi.searchBlocks(request, options);
        return response.data;
    }

    async getBlocks(signal: AbortSignal | undefined): Promise<BlockDetail[]> {
        const options: RawAxiosRequestConfig = {signal: signal};
        const response: AxiosResponse<BlockDetail[]> = await this.blockApi.getBlocks(options);
        return response.data;
    }

    async getBlock(blockId: string, signal: AbortSignal | undefined): Promise<BlockDetail> {
        const options: RawAxiosRequestConfig = {signal: signal};
        const response: AxiosResponse<BlockDetail> = await this.blockApi.getBlock(blockId, options);
        return response.data;
    }

    async saveBlock(block: BlockDetail, signal: AbortSignal | undefined, sessionKey: string): Promise<BlockDetail> {
        const options: RawAxiosRequestConfig = {signal: signal};
        const response: AxiosResponse<BlockDetail> = await this.blockApi.createBlock(block, sessionKey, options);
        return response.data;
    }

    async updateBlock(blockId: string, block: BlockDetail, signal: AbortSignal | undefined, sessionKey: string): Promise<BlockDetail> {
        const options: RawAxiosRequestConfig = {signal: signal};
        const response: AxiosResponse<BlockDetail> = await this.blockApi.updateBlock(blockId, block, sessionKey, options);
        return response.data;
    }

    async deleteBlock(blockId: string, signal: AbortSignal | undefined, sessionKey: string): Promise<boolean> {
        const options: RawAxiosRequestConfig = {signal: signal};
        await this.blockApi.deleteBlock(blockId, sessionKey, options);
        return true;
    }

}

export default BlockService;