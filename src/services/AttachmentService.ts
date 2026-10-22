import {IAttachmentService} from "./interfaces/IAttachmentService.ts";
import {AttachmentControllerApi, AttachmentDetail, AttachmentPagingModelListing, Configuration, RequestListing} from "@kit-iai-proof/proof-config-manager-client";
import axios from "../utils/axios.ts";
import {AxiosResponse, RawAxiosRequestConfig} from "axios";

class AttachmentService implements IAttachmentService {

    private config: Configuration;
    private attachmentApi: AttachmentControllerApi;

    constructor(basePath: string) {
        this.config = new Configuration({basePath: basePath});
        this.attachmentApi = new AttachmentControllerApi(this.config, basePath, axios);
    }

    async searchAttachments(signal: AbortSignal | undefined, request: RequestListing): Promise<AttachmentPagingModelListing> {
        const options: RawAxiosRequestConfig = {signal: signal};
        const response: AxiosResponse<AttachmentPagingModelListing> = await this.attachmentApi.searchAttachments(request, options)
        return response.data;
    }

    async getAttachments(signal: AbortSignal | undefined): Promise<AttachmentDetail[]> {
        const options: RawAxiosRequestConfig = {signal: signal};
        const response: AxiosResponse<AttachmentDetail[]> = await this.attachmentApi.getAttachments(options);
        return response.data;
    }

    async getAttachment(attachmentId: string, signal: AbortSignal | undefined): Promise<AttachmentDetail> {
        const options: RawAxiosRequestConfig = {signal: signal};
        const response: AxiosResponse<AttachmentDetail> = await this.attachmentApi.getAttachment(attachmentId, options);
        return response.data;
    }

    async createAttachmentWithFile(attachment: AttachmentDetail, file: File | undefined, signal: AbortSignal | undefined, sessionKey: string): Promise<AttachmentDetail> {
        const options: RawAxiosRequestConfig = {signal: signal};
        const response: AxiosResponse<AttachmentDetail> = await this.attachmentApi.createAttachmentWithFile(sessionKey, file, attachment, options);
        return response.data;
    }

    async updateAttachmentWithFile(attachmentId: string, attachment: AttachmentDetail, file: File | undefined, signal: AbortSignal | undefined, sessionKey: string): Promise<AttachmentDetail> {
        const options: RawAxiosRequestConfig = {signal: signal};
        const response: AxiosResponse<AttachmentDetail> = await this.attachmentApi.updateAttachmentWithFile(attachmentId, sessionKey, file, attachment, options);
        return response.data;
    }

    async deleteAttachment(attachmentId: string, signal: AbortSignal | undefined, sessionKey: string): Promise<boolean> {
        const options: RawAxiosRequestConfig = {signal: signal};
        await this.attachmentApi.deleteAttachment(attachmentId, sessionKey, options);
        return true;
    }
}

export default AttachmentService;