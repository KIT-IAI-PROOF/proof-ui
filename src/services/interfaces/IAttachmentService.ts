import {AttachmentDetail, AttachmentPagingModelListing, RequestListing as Request} from "@kit-iai-proof/proof-config-manager-client";

export interface IAttachmentService {

    searchAttachments(signal: AbortSignal | undefined, request: Request): Promise<AttachmentPagingModelListing>;

    getAttachments(signal: AbortSignal | undefined): Promise<AttachmentDetail[]>;

    getAttachment(attachmentId: string, signal: AbortSignal | undefined): Promise<AttachmentDetail>;

    createAttachmentWithFile(attachment: AttachmentDetail, file: File | undefined, signal: AbortSignal | undefined, sessionKey: string): Promise<AttachmentDetail>;

    updateAttachmentWithFile(attachmentId: string, attachment: AttachmentDetail, file: File | undefined, signal: AbortSignal | undefined, sessionKey: string): Promise<AttachmentDetail>;

    deleteAttachment(attachmentId: string, signal: AbortSignal | undefined, sessionKey: string): Promise<boolean>;
}