import {ProgramDetail, ProgramPagingModelListing, RequestListing as Request,} from "@webis/proof-config-manager-client";

export interface IProgramService {

    searchPrograms(signal: AbortSignal | undefined, request: Request): Promise<ProgramPagingModelListing>;

    getPrograms(signal: AbortSignal | undefined): Promise<ProgramDetail[]>;

    getProgram(programId: string, signal: AbortSignal | undefined): Promise<ProgramDetail>;

    saveProgram(program: ProgramDetail, signal: AbortSignal | undefined, sessionKey: string): Promise<ProgramDetail>;

    updateProgram(programId: string, program: ProgramDetail, signal: AbortSignal | undefined, sessionKey: string): Promise<ProgramDetail>;

    deleteProgram(programId: string, signal: AbortSignal | undefined, sessionKey: string): Promise<boolean>;
}