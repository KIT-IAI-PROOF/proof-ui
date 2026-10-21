import {RequestListing as Request, TemplateDetail, TemplatePagingModelListing, WorkflowDetail} from "@webis/proof-config-manager-client";

export interface ITemplateService {

    searchTemplates(signal: AbortSignal | undefined, request: Request): Promise<TemplatePagingModelListing>;

    getTemplates(signal: AbortSignal | undefined): Promise<TemplateDetail[]>;

    getTemplate(templateId: string, signal: AbortSignal | undefined): Promise<TemplateDetail>;

    saveTemplate(template: TemplateDetail, signal: AbortSignal | undefined, sessionKey: string): Promise<TemplateDetail>;

    updateTemplate(templateId: string, template: TemplateDetail, signal: AbortSignal | undefined, sessionKey: string): Promise<TemplateDetail>;

    deleteTemplate(templateId: string, signal: AbortSignal | undefined, sessionKey: string): Promise<boolean>;

    getWorkflowsForTemplate(s: string, signal: any): Promise<WorkflowDetail[]>;

    getContainerImages(signal: AbortSignal | undefined): Promise<string[]>;

    exportTemplate(templateId: string, signal: AbortSignal | undefined): Promise<File>;

}