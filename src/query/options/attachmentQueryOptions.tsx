import {keepPreviousData, queryOptions, UseQueryOptions} from "@tanstack/react-query";
import {AxiosError} from "axios";
import {attachmentService} from "../../services/instances.ts";
import {AttachmentDetail, AttachmentPagingModelListing, RequestListing} from "@webis/proof-config-manager-client";
import {ATTACHMENTS_KEY} from "../../utils/constants.ts";

export const searchAttachmentsQueryOptions: (attachmentsRequest: RequestListing) => UseQueryOptions<AttachmentPagingModelListing, AxiosError, AttachmentPagingModelListing, (string | RequestListing)[]> = (attachmentsRequest: RequestListing): UseQueryOptions<AttachmentPagingModelListing, AxiosError, AttachmentPagingModelListing, (string | RequestListing)[]> => {
    return queryOptions({
            queryKey: [ATTACHMENTS_KEY, attachmentsRequest],
            refetchOnWindowFocus: true,
            retry: 2,
            enabled: !!attachmentsRequest,
            placeholderData: keepPreviousData,
            queryFn: async ({queryKey, signal}: any): Promise<AttachmentPagingModelListing> => {
                return await attachmentService.searchAttachments(signal, queryKey[1]);
            }
        }
    )
}

export const attachmentsQueryOptions: () => UseQueryOptions<AttachmentDetail[], AxiosError, AttachmentDetail[], string[]> = (): UseQueryOptions<AttachmentDetail[], AxiosError, AttachmentDetail[], string[]> => {
    return queryOptions({
            queryKey: [ATTACHMENTS_KEY],
            refetchOnWindowFocus: true,
            retry: 2,
            queryFn: async ({signal}: any): Promise<AttachmentDetail[]> => {
                return await attachmentService.getAttachments(signal);
            }
        }
    )
};

export const attachmentQueryOptions: (attachmentId: string | undefined) => UseQueryOptions<AttachmentDetail, AxiosError, AttachmentDetail, (string | undefined)[]> = (attachmentId: string | undefined): UseQueryOptions<AttachmentDetail, AxiosError, AttachmentDetail, (string | undefined)[]> => {
    return queryOptions({
            queryKey: [ATTACHMENTS_KEY, attachmentId],
            enabled: !!attachmentId,
            refetchOnWindowFocus: true,
            retry: 2,
            queryFn: async ({queryKey, signal}: any): Promise<AttachmentDetail> => {
                return await attachmentService.getAttachment(queryKey[1], signal);
            }
        }
    )
};
