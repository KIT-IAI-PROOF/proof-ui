import {Configuration, RequestListing as Request, TemplateControllerApi, TemplateDetail, TemplatePagingModelListing, WorkflowDetail} from "@kit-iai-proof/proof-config-manager-client";
import type {AxiosResponse, RawAxiosRequestConfig} from "axios";
import axios from "../utils/axios";
import {ITemplateService} from "./interfaces/ITemplateService.ts";

class TemplateService implements ITemplateService {

    private templateApi: TemplateControllerApi;

    constructor(basePath: string) {
        const config: Configuration = new Configuration({basePath: basePath});
        this.templateApi = new TemplateControllerApi(config, basePath, axios);
    }

    async searchTemplates(signal: AbortSignal | undefined, request: Request): Promise<TemplatePagingModelListing> {
        const options: RawAxiosRequestConfig = {signal: signal};
        const response: AxiosResponse<TemplatePagingModelListing> = await this.templateApi.searchTemplates(request, options);
        return response.data;
    }

    async getTemplates(signal: AbortSignal | undefined): Promise<TemplateDetail[]> {
        const options: RawAxiosRequestConfig = {signal: signal};
        const response: AxiosResponse<TemplateDetail[]> = await this.templateApi.getTemplates(options);
        return response.data;
    }

    async getTemplate(templateId: string, signal: AbortSignal | undefined): Promise<TemplateDetail> {
        const options: RawAxiosRequestConfig = {signal: signal};
        const response: AxiosResponse<TemplateDetail> = await this.templateApi.getTemplate(templateId, options);
        return response.data;
    }

    async saveTemplate(template: TemplateDetail, signal: AbortSignal | undefined, sessionKey: string): Promise<TemplateDetail> {
        const options: RawAxiosRequestConfig = {signal: signal};
        const response: AxiosResponse<TemplateDetail> = await this.templateApi.createTemplate(template, sessionKey, options);
        return response.data;
    }

    async updateTemplate(templateId: string, template: TemplateDetail, signal: AbortSignal | undefined, sessionKey: string): Promise<TemplateDetail> {
        const options: RawAxiosRequestConfig = {signal: signal};
        const response: AxiosResponse<TemplateDetail> = await this.templateApi.updateTemplate(templateId, template, sessionKey, options);
        return response.data;
    }

    async deleteTemplate(templateId: string, signal: AbortSignal | undefined, sessionKey: string): Promise<boolean> {
        const options: RawAxiosRequestConfig = {signal: signal};
        await this.templateApi.deleteTemplate(templateId, sessionKey, options);
        return true;
    }

    async getWorkflowsForTemplate(templateId: string, signal: AbortSignal | undefined): Promise<WorkflowDetail[]> {
        const options: RawAxiosRequestConfig = {signal: signal};
        const response: AxiosResponse<WorkflowDetail[]> = await this.templateApi.getWorkflowsForTemplate(templateId, options);
        return response.data;
    }

    async getContainerImages(signal: AbortSignal | undefined): Promise<string[]> {
        const options: RawAxiosRequestConfig = {signal: signal};
        const response: AxiosResponse<string[]> = await this.templateApi.getContainerImages(options);
        return response.data;
    }

    async exportTemplate(templateId: string, signal: AbortSignal | undefined): Promise<File> {
        const options: RawAxiosRequestConfig = {
            signal: signal,
            responseType: "blob",
            headers: {
                Accept: "application/octet-stream",
            }
        };
        const response: AxiosResponse = await this.templateApi.exportTemplate(templateId, options);
        return response.data;
    }

}

export default TemplateService;