import {GridFilterModel, GridPaginationModel, GridSortModel} from "@mui/x-data-grid";
import {EAlgorithm} from "../model/EAlgorithm.ts";

export const DEFAULT_ALGORITHM: EAlgorithm.BezierCatmullRom = EAlgorithm.BezierCatmullRom;
export const DEFAULT_MONITORING_SORTING: GridSortModel = [{field: "startedAt", sort: "desc"}];
export const DEFAULT_CONFIGS_SORTING: GridSortModel = [{field: "label", sort: "asc"}];
export const DEFAULT_TEMPLATES_SORTING: GridSortModel = [{field: "name", sort: "asc"}];
export const DEFAULT_PAGINATION: GridPaginationModel = {page: 0, pageSize: 25};
export const DEFAULT_FILTER: GridFilterModel = {items: []};
export const VALID_ACTIONS: string[] = ['CREATED', 'UPDATED', 'DELETED'];

export const WORKFLOWS_KEY: string = "workflows";
export const EXECUTIONS_KEY: string = "executions";
export const BLOCKS_KEY: string = "blocks";
export const PROGRAMS_KEY: string = "programs";
export const ATTACHMENTS_KEY: string = "attachments";
export const TEMPLATES_KEY: string = "templates";

export const INVALIDATION_KEYS: any = {
    [WORKFLOWS_KEY]: [EXECUTIONS_KEY, WORKFLOWS_KEY, BLOCKS_KEY, TEMPLATES_KEY, PROGRAMS_KEY, ATTACHMENTS_KEY],
    [TEMPLATES_KEY]: [EXECUTIONS_KEY, WORKFLOWS_KEY, BLOCKS_KEY, TEMPLATES_KEY, PROGRAMS_KEY, ATTACHMENTS_KEY],
    [BLOCKS_KEY]: [EXECUTIONS_KEY, WORKFLOWS_KEY, BLOCKS_KEY, TEMPLATES_KEY, PROGRAMS_KEY, ATTACHMENTS_KEY],
    [EXECUTIONS_KEY]: [EXECUTIONS_KEY, WORKFLOWS_KEY, BLOCKS_KEY, TEMPLATES_KEY, PROGRAMS_KEY, ATTACHMENTS_KEY],
    [PROGRAMS_KEY]: [EXECUTIONS_KEY, WORKFLOWS_KEY, BLOCKS_KEY, TEMPLATES_KEY, PROGRAMS_KEY, ATTACHMENTS_KEY],
    [ATTACHMENTS_KEY]: [EXECUTIONS_KEY, WORKFLOWS_KEY, BLOCKS_KEY, TEMPLATES_KEY, PROGRAMS_KEY, ATTACHMENTS_KEY],
};

export const ENTITY_TYPES: any = {
    [WORKFLOWS_KEY]: 'workflow',
    [TEMPLATES_KEY]: 'template',
    [BLOCKS_KEY]: 'block',
    [EXECUTIONS_KEY]: 'execution',
    [PROGRAMS_KEY]: 'program',
    [ATTACHMENTS_KEY]: 'attachment',
};

export const STEPBASEDCONFIG_DEFAULT = {startTime: 0, endTime: 1000, startPoint: 0, endPoint: 1000, defaultStepSize: 1, duration: 500, workerTimeout: 10, inputTimeout: 10, stepSizeDefinitions: {}};

// Outer padding of each page's top-level Box (wraps the page's Paper). Adjust here to change the
// whitespace around page content across the whole app at once.
export const PAGE_CONTAINER_PADDING = {paddingY: 5, paddingLeft: 8.5};