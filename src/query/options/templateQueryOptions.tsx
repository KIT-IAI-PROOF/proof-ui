import {keepPreviousData, queryOptions, UseQueryOptions} from "@tanstack/react-query";
import {AxiosError} from "axios";
import {templateService} from "../../services/instances.ts";
import {RequestListing, TemplateDetail, TemplatePagingModelListing, WorkflowDetail} from "@webis/proof-config-manager-client";
import {TEMPLATES_KEY, WORKFLOWS_KEY} from "../../utils/constants.ts";

export const searchTemplatesQueryOptions: (templatesRequest: RequestListing) => UseQueryOptions<TemplatePagingModelListing, AxiosError, TemplatePagingModelListing, (string | RequestListing)[]> = (templatesRequest: RequestListing): UseQueryOptions<TemplatePagingModelListing, AxiosError, TemplatePagingModelListing, (string | RequestListing)[]> => {
    return queryOptions({
            queryKey: [TEMPLATES_KEY, templatesRequest],
            refetchOnWindowFocus: true,
            retry: 2,
            enabled: !!templatesRequest,
            placeholderData: keepPreviousData,
            queryFn: async ({queryKey, signal}: any): Promise<TemplatePagingModelListing> => {
                return await templateService.searchTemplates(signal, queryKey[1]);
            }
        }
    )
}

export const templatesQueryOptions: () => UseQueryOptions<TemplateDetail[], AxiosError, TemplateDetail[], string[]> = (): UseQueryOptions<TemplateDetail[], AxiosError, TemplateDetail[], string[]> => {
    return queryOptions({
            queryKey: [TEMPLATES_KEY],
            refetchOnWindowFocus: true,
            retry: 2,
            queryFn: async ({signal}: any): Promise<TemplateDetail[]> => {
                return await templateService.getTemplates(signal);
            }
        }
    )
};

export const templateQueryOptions: (templateId: string | undefined) => UseQueryOptions<TemplateDetail, AxiosError, TemplateDetail, (string | undefined)[]> = (templateId: string | undefined): UseQueryOptions<TemplateDetail, AxiosError, TemplateDetail, (string | undefined)[]> => {
    return queryOptions({
            queryKey: [TEMPLATES_KEY, templateId],
            enabled: !!templateId,
            refetchOnWindowFocus: true,
            retry: 2,
            queryFn: async ({queryKey, signal}: any): Promise<TemplateDetail> => {
                return await templateService.getTemplate(queryKey[1], signal);
            }
        }
    )
};

export const workflowsForTemplateQueryOptions: (templateId: string | undefined) => UseQueryOptions<WorkflowDetail[], AxiosError, WorkflowDetail[], (string | undefined)[]> = (templateId: string | undefined): UseQueryOptions<WorkflowDetail[], AxiosError, WorkflowDetail[], (string | undefined)[]> => {
    return queryOptions({
            queryKey: [WORKFLOWS_KEY, "template", templateId],
            refetchOnWindowFocus: true,
            enabled: !!templateId,
            retry: 2,
            queryFn: async ({signal}: any): Promise<WorkflowDetail[]> => {
                return await templateService.getWorkflowsForTemplate(templateId!, signal);
            }
        }
    )
};