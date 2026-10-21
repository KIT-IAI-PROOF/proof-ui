import {Accordion, AccordionDetails, AccordionSummary, Alert, FormLabel, List, ListItem, ListItemText, Paper, Stack, TextField, Theme, Tooltip, Typography, useTheme} from "@mui/material";
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import {Dispatch, Fragment, ReactNode, SetStateAction, SyntheticEvent, useContext, useEffect, useRef, useState} from "react";
import {IMonitoringContext} from "../../../provider/MonitoringProvider.tsx";
import {Info} from "@mui/icons-material";
import {useTranslation} from "react-i18next";
import Grid from "@mui/material/Grid2";
import {BlockDetail, ExecutionDetail, InputDetail, WorkflowDetail} from "@webis/proof-config-manager-client";
import {MonitoringContext} from "../../../provider/MonitoringContext.tsx";
import Handle from "./Handle.tsx";
import {useQuery, UseQueryResult} from "@tanstack/react-query";
import {AxiosError} from "axios";
import {workflowQueryOptions} from "../../../query/options/workflowQueryOptions.tsx";
import {executionsQueryOptions} from "../../../query/options/executionQueryOptions.tsx";
import LabeledField from "../../../app/components/LabeledField.tsx";

interface IProps {
    workflowId: string;
    jsonError: Record<string, string | undefined>;
    setJsonError: Dispatch<SetStateAction<Record<string, string | undefined>>>;
}

/**
 * Initialize input values from last execution and workflow defaults.
 *
 * This helper function consolidates the logic for initializing three types of input values:
 * - Static inputs: Uses execParameters with fallback to input.defaultValue
 * - Non-static start values: Uses execStartValues with fallback to input.startValue
 * - Non-static default values: Uses execDefaultValues with fallback to input.defaultValue
 *
 * @param currentRef - Ref object maintaining current values without triggering re-renders
 * @param lastExecutionProperty - Values from the last execution (can be undefined)
 *        Examples: execution.execParameters, execution.execStartValues, execution.execDefaultValues
 * @param currentInputIds - Set of all input IDs in the current workflow
 * @param workflow - Current workflow definition containing blocks and their inputs
 * @param fallbackValueGetter - Function to extract fallback value from InputDetail
 *        Examples:
 *        - input => input.defaultValue (for static inputs or default values)
 *        - input => input.startValue (for non-static start values)
 * @param shouldProcess - Optional filter function to determine which inputs to process
 *        Example: input => !input.communicationType?.includes("_STATIC") (for non-static only)
 * @returns Object with:
 *          - values: Map of input ID to value (merged from execution and workflow defaults)
 *          - changed: Boolean indicating if values differ from current state
 */
const initializeInputValues = (
    currentRef: React.MutableRefObject<{ [key: string]: string }>,
    lastExecutionProperty: { [key: string]: string } | undefined,
    currentInputIds: Set<string>,
    workflow: WorkflowDetail | undefined,
    fallbackValueGetter: (input: InputDetail) => string | undefined,
    shouldProcess?: (input: InputDetail) => boolean
): { values: { [key: string]: string }; changed: boolean } => {
    const newValues = {...currentRef.current};
    let changed = false;

    // Fill values from last execution
    Object.entries(lastExecutionProperty ?? {})
        .forEach(([key, value]) => {
            if (currentInputIds.has(key) && newValues[key] === undefined) {
                newValues[key] = value;
                changed = true;
            }
        });

    // Fill fallback values from workflow
    workflow?.blocks?.forEach((block: BlockDetail) => {
        block.inputs?.forEach((input: InputDetail) => {
            if (input.id && (!shouldProcess || shouldProcess(input))) {
                const fallback = fallbackValueGetter(input);
                if (newValues[input.id] === undefined && fallback) {
                    newValues[input.id] = fallback;
                    changed = true;
                }
            }
        });
    });

    return {values: newValues, changed};
};

const PreselectedStart: ({workflowId, jsonError, setJsonError}: IProps) => ReactNode = ({workflowId, jsonError, setJsonError}: IProps): ReactNode => {

    const theme: Theme = useTheme();
    const {t} = useTranslation();

    const {
        execParameters,
        updateExecParameters,
        execStartValues,
        updateExecStartValues,
        execDefaultValues,
        updateExecDefaultValues,
        executionLabel,
        updateExecutionLabel,
        executionDescription,
        updateExecutionDescription,
        simulationStartPoint,
        updateSimulationStartPoint,
        simulationEndPoint,
        updateSimulationEndPoint,
        simulationDuration,
        updateSimulationDuration,
        simulationTimeoutWorker,
        updateSimulationTimeoutWorker,
        simulationTimeoutInput,
        updateSimulationTimeoutInput,
        missingRequiredFields
    } = useContext<IMonitoringContext>(MonitoringContext);

    const [startParamsExpanded, setStartParamsExpanded] = useState<boolean>(true);
    const [simulationParamsExpanded, setSimulationParamsExpanded] = useState<boolean>(true);
    const [expandedBlockAccordions, setExpandedBlockAccordions] = useState<Set<string>>(new Set());
    const [expandedSections, setExpandedSections] = useState<Map<string, Set<string>>>(new Map());

    // Auto-expand start parameters if there are any validation errors
    useEffect(() => {
        const hasErrors = Object.values(jsonError).some(error => error !== undefined) ||
            missingRequiredFields.some(field =>
                !field.startsWith("executionRunning") &&
                !field.startsWith("missingBlock") &&
                !field.startsWith("missingHandles") &&
                !field.startsWith("missingProgram") &&
                !field.startsWith("missingParadigm") &&
                !field.startsWith("missingStrategy") &&
                !field.startsWith("missingProgramEntryPoint") &&
                !field.startsWith("missingEntryPointPath")
            );

        if (hasErrors && !startParamsExpanded) {
            setStartParamsExpanded(true);
        }
    }, [jsonError, missingRequiredFields, startParamsExpanded]);

    const handleSectionToggle = (blockId: string, sectionKey: string) => (_event: SyntheticEvent, isExpanded: boolean) => {
        setExpandedSections(prev => {
            const blockSections = new Map(prev);
            let sections = blockSections.get(blockId);
            if (!sections) {
                sections = new Set();
            }
            if (isExpanded) {
                sections.add(sectionKey);
            } else {
                sections.delete(sectionKey);
            }
            blockSections.set(blockId, sections);
            return blockSections;
        });
    };

    const isSectionExpanded = (blockId: string, sectionKey: string): boolean => {
        const sections = expandedSections.get(blockId);
        return sections ? sections.has(sectionKey) : false;
    };

    const {data: workflow}: UseQueryResult<WorkflowDetail, AxiosError> = useQuery(workflowQueryOptions(workflowId));
    const {data: executions}: UseQueryResult<ExecutionDetail[], AxiosError> = useQuery(executionsQueryOptions());

    // Keep a ref so the initialization effect can read current executionParameter without
    // re-running every time the user edits a field.
    const execParameterRef = useRef(execParameters);
    useEffect(() => {
        execParameterRef.current = execParameters;
    });

    // Keep a ref so the initialization effect can read current execStartValues without
    // re-running every time the user edits a field.
    const execStartValuesRef = useRef(execStartValues);
    useEffect(() => {
        execStartValuesRef.current = execStartValues;
    });

    // Keep a ref so the initialization effect can read current execDefaultValues without
    // re-running every time the user edits a field.
    const execDefaultValuesRef = useRef(execDefaultValues);
    useEffect(() => {
        execDefaultValuesRef.current = execDefaultValues;
    });

    // Auto-expand "Required Inputs" section for all blocks on mount and when blocks change
    // Also auto-expand any section that contains validation errors
    useEffect(() => {
        if (!workflow?.blocks) return;
        setExpandedSections(prev => {
            const next = new Map(prev);
            workflow.blocks!.forEach((block: BlockDetail) => {
                // Expand required section if it has required inputs
                const hasRequiredInputs = block.inputs?.some(
                    (input: InputDetail) =>
                        input.communicationType?.includes("_STATIC") && input.required
                );
                if (hasRequiredInputs) {
                    let sections = next.get(block.id!);
                    if (!sections) {
                        sections = new Set();
                    }
                    sections.add('required');
                    next.set(block.id!, sections);
                }

                // Auto-expand sections that have errors
                const requiredInputsWithErrors = block.inputs?.filter(input =>
                    input.communicationType?.includes("_STATIC") && input.required &&
                    (missingRequiredFields.includes(input.id!) || jsonError[input.id!])
                ) ?? [];

                const optionalInputsWithErrors = block.inputs?.filter(input =>
                    input.communicationType?.includes("_STATIC") && !input.required &&
                    (missingRequiredFields.includes(input.id!) || jsonError[input.id!])
                ) ?? [];

                const defaultValuesWithErrors = block.inputs?.filter(input =>
                    !input.communicationType?.includes("_STATIC") &&
                    (missingRequiredFields.includes(input.id!) || jsonError[input.id!])
                ) ?? [];

                let sections = next.get(block.id!);
                if (!sections) {
                    sections = new Set();
                }

                if (requiredInputsWithErrors.length > 0) {
                    sections.add('required');
                }
                if (optionalInputsWithErrors.length > 0) {
                    sections.add('optional');
                }
                if (defaultValuesWithErrors.length > 0) {
                    sections.add('default');
                }

                next.set(block.id!, sections);
            });
            return next;
        });
    }, [workflow?.blocks, missingRequiredFields, jsonError]);

    useEffect((): void => {
        if (workflowId && workflow && executions) {
            const lastExecution: ExecutionDetail | undefined = executions?.sort((a, b) => Number(b.creationDate) - Number(a.creationDate))
                .find((execution: ExecutionDetail) => execution.workflow?.id === workflowId);

            if (!executionDescription && lastExecution?.description) updateExecutionDescription(lastExecution.description);
            if (!executionLabel && lastExecution?.label) updateExecutionLabel(lastExecution.label);
            if (simulationStartPoint === undefined && workflow?.stepBasedConfig?.startPoint) updateSimulationStartPoint(String(workflow.stepBasedConfig.startPoint));
            if (simulationEndPoint === undefined && workflow?.stepBasedConfig?.endPoint) updateSimulationEndPoint(String(workflow.stepBasedConfig.endPoint));
            if (simulationDuration === undefined && workflow?.stepBasedConfig?.duration) updateSimulationDuration(String(workflow.stepBasedConfig.duration));
            if (simulationTimeoutWorker === undefined && workflow?.stepBasedConfig?.workerTimeout) updateSimulationTimeoutWorker(String(workflow.stepBasedConfig.workerTimeout));
            if (simulationTimeoutInput === undefined && workflow?.stepBasedConfig?.inputTimeout) updateSimulationTimeoutInput(String(workflow.stepBasedConfig.inputTimeout));

            const currentInputIds: Set<string> = new Set(workflow?.blocks?.flatMap((block: BlockDetail) => block.inputs?.map((input: InputDetail) => input.id!) ?? []) ?? []);

            // Initialize input parameters (static inputs only)
            const {values: newExecParameters, changed: hasExecParameterChanges} = initializeInputValues(
                execParameterRef,
                lastExecution?.execParameters,
                currentInputIds,
                workflow,
                (input) => (input as any)?.defaultValue,
                (input) => input.communicationType?.includes("_STATIC") ?? false
            );
            if (hasExecParameterChanges) updateExecParameters(newExecParameters);

            // Initialize start values for non-static inputs
            const {values: newExecStartValues, changed: startValuesChanged} = initializeInputValues(
                execStartValuesRef,
                lastExecution?.execStartValues,
                currentInputIds,
                workflow,
                (input) => (input as any)?.startValue,
                (input) => !input.communicationType?.includes("_STATIC")
            );
            if (startValuesChanged) updateExecStartValues(newExecStartValues);

            // Initialize default values for non-static inputs
            const {values: newExecDefaultValues, changed: defaultValuesChanged} = initializeInputValues(
                execDefaultValuesRef,
                lastExecution?.execDefaultValues,
                currentInputIds,
                workflow,
                (input) => (input as any)?.defaultValue,
                (input) => !input.communicationType?.includes("_STATIC")
            );
            if (defaultValuesChanged) updateExecDefaultValues(newExecDefaultValues);
        }
        // execParameter and execStartValues intentionally omitted from deps — read via refs to prevent
        // the effect from re-running (and restoring defaults) on every user input change.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [executions, workflowId, workflow, updateExecParameters, updateExecStartValues, updateExecDefaultValues, updateExecutionDescription, updateExecutionLabel, executionDescription, executionLabel]);

    // Auto-expand block accordions that have values in optional inputs or errors
    useEffect(() => {
        if (!workflow?.blocks) return;
        setExpandedBlockAccordions(prev => {
            const next = new Set(prev);
            workflow.blocks!.forEach((block: BlockDetail) => {
                const optionalInputs = block.inputs?.filter(input => input.communicationType?.includes('_STATIC') && !input.required) ?? [];
                const hasValue = optionalInputs.some(input => {
                    const val = execParameters[input.id!];
                    return !!val;
                });

                // Also check for any errors in this block
                const hasErrors = block.inputs?.some(input =>
                    missingRequiredFields.includes(input.id!) || jsonError[input.id!]
                ) ?? false;

                if (hasValue || hasErrors) {
                    if (!next.has(block.id!))
                        next.add(block.id!);
                }
            });
            return next;
        });
    }, [execParameters, workflow?.blocks, missingRequiredFields, jsonError]);

    const handleBlockAccordionToggle: (blockId: string) => (_event: SyntheticEvent, isExpanded: boolean) => void = (blockId: string) => (_event: SyntheticEvent, isExpanded: boolean) => {
        setExpandedBlockAccordions(prev => {
            const next = new Set(prev);
            if (isExpanded) next.add(blockId);
            else next.delete(blockId);
            return next;
        });
    };

    const sortedBlocks = workflow?.blocks?.sort((block1: BlockDetail, block2: BlockDetail) => {
        if (block1.label && block2.label) {
            // First sort by label alphabetically
            const labelCompare = block1.label.localeCompare(block2.label);
            if (labelCompare !== 0) return labelCompare;
            // If labels are equal, sort by index as secondary criterion
            return (block1.index ?? 0) - (block2.index ?? 0);
        }
        // Blocks without label go to the end
        return 1;
    }).filter((block: BlockDetail): boolean => {
        // Only show blocks that have inputs
        return (block.inputs?.length ?? 0) > 0;
    });

    return (
        <Fragment>
            <Grid size={12} paddingLeft={1}>
                <Stack direction="row" spacing={4} flexWrap="wrap" alignItems="center">
                    <Stack direction="row" spacing={0.5} alignItems="center">
                        <Typography variant="subtitle1">{t("word.workflowLabel")}:</Typography>
                        <Tooltip title={t("tooltip.workflowLabel")}>
                            <Info color="action" fontSize="small" sx={{cursor: "pointer"}}/>
                        </Tooltip>
                        <Typography variant="body1" color="text.secondary">{workflow?.label}</Typography>
                    </Stack>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                        <Typography variant="subtitle1">{t("word.id")}:</Typography>
                        <Tooltip title={t("tooltip.id")}>
                            <Info color="action" fontSize="small" sx={{cursor: "pointer"}}/>
                        </Tooltip>
                        <Typography variant="body1" color="text.secondary">{workflowId}</Typography>
                    </Stack>
                </Stack>
            </Grid>
            <Paper
                elevation={0}
                style={{background: theme.palette.background.default}}>
                <Grid
                    container={true}
                    display={"flex"}
                    alignItems={"center"}
                    paddingX={3}
                    spacing={1}
                >
                    <Grid size={12} paddingY={1}>
                        {
                            missingRequiredFields.some(field =>
                                field.startsWith("executionRunning") ||
                                field.startsWith("missingBlock") ||
                                field.startsWith("missingHandles") ||
                                field.startsWith("missingProgram") ||
                                field.startsWith("missingParadigm") ||
                                field.startsWith("missingStrategy") ||
                                field.startsWith("missingProgramEntryPoint") ||
                                field.startsWith("missingEntryPointPath")
                            ) && (
                                <Alert
                                    severity="error"
                                    sx={{alignItems: "center"}}
                                >
                                    <List dense disablePadding>
                                        {
                                            missingRequiredFields.map((field) => {
                                                if (field.startsWith("executionRunning")) {
                                                    const [, detail] = field.split(":");
                                                    const [label, status] = detail.split("__");
                                                    return (
                                                        <ListItem key={field} disableGutters>
                                                            <ListItemText primary={t("word.executionRunning", {
                                                                label: label,
                                                                status: status
                                                            })}/>
                                                        </ListItem>
                                                    );
                                                }
                                                if (field === "missingBlock") {
                                                    return (
                                                        <ListItem key={field} disableGutters>
                                                            <ListItemText primary={t("word.missingBlock")}/>
                                                        </ListItem>
                                                    );
                                                }
                                                if (field.startsWith('missingHandles')) {
                                                    const [, detail] = field.split(":");
                                                    const [id, label] = detail.split('__');
                                                    return (
                                                        <ListItem key={field} disableGutters>
                                                            <ListItemText
                                                                primary={`${t('word.missingHandles')} ${label} (${id}).`}/>
                                                        </ListItem>
                                                    )
                                                }
                                                if (field.startsWith("missingParadigm")) {
                                                    return (
                                                        <ListItem key={field} disableGutters>
                                                            <ListItemText primary={t("word.missingParadigm")}/>
                                                        </ListItem>
                                                    );
                                                }
                                                if (field.startsWith("missingStrategy")) {
                                                    return (
                                                        <ListItem key={field} disableGutters>
                                                            <ListItemText primary={t("word.missingStrategy")}/>
                                                        </ListItem>
                                                    );
                                                }
                                                if (field.startsWith("missingProgram:")) {
                                                    const [, detail] = field.split(":");
                                                    const [id, label] = detail.split('__')
                                                    return (
                                                        <ListItem key={field} disableGutters>
                                                            <ListItemText
                                                                primary={`${t("word.missingProgram")} ${label} (${id}).`}/>
                                                        </ListItem>
                                                    );
                                                }
                                                if (field.startsWith("missingProgramEntryPoint:")) {
                                                    const [, detail] = field.split(":");
                                                    const [id, label] = detail.split('__')
                                                    return (
                                                        <ListItem key={field} disableGutters>
                                                            <ListItemText
                                                                primary={`${t("word.missingProgramEntryPoint")} ${label} (${id}).`}/>
                                                        </ListItem>
                                                    );
                                                }
                                                if (field.startsWith("missingEntryPointPath:")) {
                                                    const [, detail] = field.split(":");
                                                    const [id, label] = detail.split('__')
                                                    return (
                                                        <ListItem key={field} disableGutters>
                                                            <ListItemText
                                                                primary={`${t("word.missingEntryPointPath")} ${label} (${id}).`}/>
                                                        </ListItem>
                                                    );
                                                }
                                                return null;
                                            })}
                                    </List>
                                </Alert>
                            )}
                    </Grid>
                    <LabeledField labelKey={"word.label"} tooltipKey={"tooltip.label"} required>
                        <TextField
                            value={executionLabel ?? ""}
                            size={"small"}
                            fullWidth={true}
                            onChange={(e) => updateExecutionLabel(e.target.value)}
                            required={true}
                            error={missingRequiredFields.includes('missingLabel')}
                            helperText={
                                missingRequiredFields.includes('missingLabel')
                                    ? t("word.required")
                                    : ""
                            }
                        />
                    </LabeledField>
                    <LabeledField labelKey={"word.description"} tooltipKey={"tooltip.description"} required={false}>
                        <TextField
                            value={executionDescription ?? ""}
                            size={"small"}
                            fullWidth={true}
                            onChange={(e) => updateExecutionDescription(e.target.value)}
                        />
                    </LabeledField>

                </Grid>
                <Grid
                    paddingLeft={3}
                    paddingRight={3}
                    paddingBottom={3}
                    container={true}
                    spacing={1}
                >
                    <Grid pt={2} size={12}>
                        <Accordion
                            expanded={startParamsExpanded}
                            onChange={(_event: SyntheticEvent, isExpanded: boolean) => setStartParamsExpanded(isExpanded)}
                        >
                            <AccordionSummary
                                expandIcon={
                                    <Tooltip
                                        title={startParamsExpanded
                                            ? t("action.collapseOptionalInputs")
                                            : t("action.expandOptionalInputs")
                                        }
                                    >
                                        <ArrowDownwardIcon/>
                                    </Tooltip>
                                }
                            >
                                <Stack direction={"row"} alignItems={"center"} spacing={1}>
                                    <Typography variant="h5" color="primary">
                                        {t("word.startParameters")}
                                    </Typography>
                                    <Tooltip title={t("tooltip.startParameters")}>
                                        <Info sx={{cursor: "pointer"}}/>
                                    </Tooltip>
                                </Stack>
                            </AccordionSummary>
                            <AccordionDetails>
                                {sortedBlocks?.map((block: BlockDetail): ReactNode =>
                                    <Grid
                                        size={12}
                                        key={block.id}
                                        paddingBottom={1}
                                    >
                                        <Accordion
                                            expanded={expandedBlockAccordions.has(block.id!)}
                                            onChange={handleBlockAccordionToggle(block.id!)}
                                            sx={{
                                                backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[100],
                                                borderRadius: 2,
                                                '&:before': {
                                                    display: 'none'
                                                },
                                                boxShadow: theme.shadows[1]
                                            }}
                                        >
                                            <AccordionSummary
                                                expandIcon={
                                                    <Tooltip
                                                        title={expandedBlockAccordions.has(block.id!)
                                                            ? t("action.collapseOptionalInputs")
                                                            : t("action.expandOptionalInputs")
                                                        }
                                                    >
                                                        <ArrowDownwardIcon/>
                                                    </Tooltip>
                                                }
                                            >
                                                <Stack alignItems={"center"} direction={"row"} spacing={1}
                                                       flexWrap={"wrap"}>
                                                    <Typography
                                                        variant="h6"
                                                        color="primary"
                                                        sx={{
                                                            overflow: "hidden",
                                                            textOverflow: "ellipsis",
                                                            whiteSpace: "nowrap",
                                                            flexShrink: 1,
                                                            minWidth: 0
                                                        }}
                                                    >
                                                        {block.label}
                                                    </Typography>
                                                    <Typography
                                                        variant="body1"
                                                        color="textSecondary"
                                                    >
                                                        Index: {block.index}
                                                    </Typography>
                                                </Stack>
                                            </AccordionSummary>
                                            <AccordionDetails>
                                                <Stack spacing={1}>
                                                    {/* Required Inputs Accordion */}
                                                    {
                                                        block.inputs!.filter((handle: InputDetail): boolean | undefined => handle.communicationType?.includes("_STATIC") && handle.required).length! > 0 &&
                                                        <Accordion
                                                            expanded={isSectionExpanded(block.id!, 'required')}
                                                            onChange={handleSectionToggle(block.id!, 'required')}
                                                            sx={{
                                                                backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[50],
                                                                borderRadius: 1,
                                                                '&:before': {display: 'none'},
                                                                boxShadow: 'none'
                                                            }}
                                                        >
                                                            <AccordionSummary
                                                                expandIcon={<ArrowDownwardIcon fontSize="small"/>}
                                                                sx={{py: 0.5}}
                                                            >
                                                                <Typography variant="subtitle1" color="secondary">
                                                                    {t("word.requiredInputs")}
                                                                </Typography>
                                                                <Tooltip title={t("tooltip.requiredInputs")}>
                                                                    <Info sx={{ml: 1, cursor: "pointer"}}
                                                                          fontSize="small"/>
                                                                </Tooltip>
                                                            </AccordionSummary>
                                                            <AccordionDetails sx={{pt: 0}}>
                                                                {
                                                                    block.inputs!.filter((handle: InputDetail): boolean | undefined => handle.communicationType?.includes("_STATIC") && handle.required)
                                                                        .map(handle => <Handle jsonError={jsonError}
                                                                                               setJsonError={setJsonError}
                                                                                               key={handle.id}
                                                                                               handle={handle}/>)
                                                                }
                                                            </AccordionDetails>
                                                        </Accordion>
                                                    }

                                                    {/* Optional Inputs Accordion */}
                                                    {
                                                        block.inputs!.filter((handle: InputDetail): boolean | undefined => handle.communicationType?.includes("_STATIC") && !handle.required).length! > 0 &&
                                                        <Accordion
                                                            expanded={isSectionExpanded(block.id!, 'optional')}
                                                            onChange={handleSectionToggle(block.id!, 'optional')}
                                                            sx={{
                                                                backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[50],
                                                                borderRadius: 1,
                                                                '&:before': {display: 'none'},
                                                                boxShadow: 'none'
                                                            }}
                                                        >
                                                            <AccordionSummary
                                                                expandIcon={<ArrowDownwardIcon fontSize="small"/>}
                                                                sx={{py: 0.5}}
                                                            >
                                                                <Typography variant="subtitle1" color="secondary">
                                                                    {t("word.optionalInputs")}
                                                                </Typography>
                                                                <Tooltip title={t("tooltip.optionalInputs")}>
                                                                    <Info sx={{ml: 1, cursor: "pointer"}}
                                                                          fontSize="small"/>
                                                                </Tooltip>
                                                            </AccordionSummary>
                                                            <AccordionDetails sx={{pt: 0}}>
                                                                {
                                                                    block.inputs!.filter((handle: InputDetail): boolean | undefined => handle.communicationType?.includes("_STATIC") && !handle.required)
                                                                        .map(handle => <Handle key={handle.id}
                                                                                               jsonError={jsonError}
                                                                                               setJsonError={setJsonError}
                                                                                               handle={handle}/>)
                                                                }
                                                            </AccordionDetails>
                                                        </Accordion>
                                                    }

                                                    {/* Default Values (Non-static Inputs) Accordion with Start Value column */}
                                                    {
                                                        block.inputs!.filter((handle: InputDetail): boolean | undefined => !handle.communicationType?.includes("_STATIC")).length! > 0 &&
                                                        <Accordion
                                                            expanded={isSectionExpanded(block.id!, 'default')}
                                                            onChange={handleSectionToggle(block.id!, 'default')}
                                                            sx={{
                                                                backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[50],
                                                                borderRadius: 1,
                                                                '&:before': {display: 'none'},
                                                                boxShadow: 'none'
                                                            }}
                                                        >
                                                            <AccordionSummary
                                                                expandIcon={<ArrowDownwardIcon fontSize="small"/>}
                                                                sx={{py: 0.5}}
                                                            >
                                                                <Grid
                                                                    size={12}
                                                                    container={true}
                                                                    spacing={1}
                                                                    display={"flex"}
                                                                    flexDirection={"row"}
                                                                    alignItems={"center"}
                                                                >
                                                                    <Grid size={{xs: 4, lg: 2}}>
                                                                        <Stack direction={"row"} alignItems={"center"}>
                                                                            <Typography
                                                                                variant="subtitle1"
                                                                                color="secondary"
                                                                                sx={{
                                                                                    overflow: "hidden",
                                                                                    textOverflow: "ellipsis",
                                                                                    whiteSpace: "nowrap",
                                                                                    flexShrink: 1,
                                                                                    minWidth: 0
                                                                                }}
                                                                            >
                                                                                {t("word.nonStaticInputValues")}
                                                                            </Typography>
                                                                            <Tooltip
                                                                                title={t("tooltip.nonStaticInputValues")}>
                                                                                <Info sx={{ml: 1, cursor: "pointer"}}
                                                                                      fontSize="small"/>
                                                                            </Tooltip>
                                                                        </Stack>
                                                                    </Grid>
                                                                    <Grid size={{xs: 4, lg: 5}} sx={{pl: 1}}>
                                                                        <Stack direction={"row"} alignItems={"center"}
                                                                               spacing={2}>
                                                                            <Typography
                                                                                variant="subtitle1"
                                                                                color="secondary"
                                                                            >
                                                                                {t("word.startValue")}
                                                                            </Typography>
                                                                            <Tooltip title={t("tooltip.startValue")}>
                                                                                <Info sx={{ml: 1, cursor: "pointer"}}
                                                                                      fontSize="small"/>
                                                                            </Tooltip>
                                                                        </Stack>
                                                                    </Grid>
                                                                    <Grid size={{xs: 4, lg: 5}} sx={{pl: 2}}>
                                                                        <Stack direction={"row"} alignItems={"center"}
                                                                               spacing={2}>
                                                                            <Typography
                                                                                variant="subtitle1"
                                                                                color="secondary"
                                                                            >
                                                                                {t("word.defaultValue")}
                                                                            </Typography>
                                                                            <Tooltip title={t("tooltip.defaultValue")}>
                                                                                <Info sx={{ml: 1, cursor: "pointer"}}
                                                                                      fontSize="small"/>
                                                                            </Tooltip>
                                                                        </Stack>
                                                                    </Grid>
                                                                </Grid>
                                                            </AccordionSummary>
                                                            <AccordionDetails sx={{pt: 0}}>
                                                                {
                                                                    block.inputs!.filter((handle: InputDetail): boolean | undefined => !handle.communicationType?.includes("_STATIC"))
                                                                        .map(handle => <Handle key={handle.id}
                                                                                               jsonError={jsonError}
                                                                                               setJsonError={setJsonError}
                                                                                               handle={handle}
                                                                                               showLeftColumn={true}/>)
                                                                }
                                                            </AccordionDetails>
                                                        </Accordion>
                                                    }
                                                </Stack>
                                            </AccordionDetails>
                                        </Accordion>
                                    </Grid>
                                )}
                            </AccordionDetails>
                        </Accordion>
                    </Grid>
                    <Grid size={12}>
                        <Accordion
                            expanded={simulationParamsExpanded}
                            onChange={(_event: SyntheticEvent, isExpanded: boolean) => setSimulationParamsExpanded(isExpanded)}
                        >
                            <AccordionSummary
                                expandIcon={
                                    <Tooltip
                                        title={simulationParamsExpanded
                                            ? t("action.collapseOptionalInputs")
                                            : t("action.expandOptionalInputs")
                                        }
                                    >
                                        <ArrowDownwardIcon/>
                                    </Tooltip>
                                }
                            >
                                <Stack direction={"row"} alignItems={"center"} spacing={1}>
                                    <Typography variant="h5" color="primary">
                                        {t("word.simulationParameters")}
                                    </Typography>
                                    <Tooltip title={t("tooltip.simulationParameters")}>
                                        <Info sx={{cursor: "pointer"}}/>
                                    </Tooltip>
                                </Stack>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Grid
                                    container={true}
                                    display={"flex"}
                                    alignItems={"center"}
                                    spacing={0.5}
                                >
                                    <LabeledField labelKey={"word.simulationStartPoint"}
                                                  tooltipKey={"tooltip.simulationStartPoint"} required={false}>
                                        <TextField
                                            value={simulationStartPoint ?? workflow?.stepBasedConfig?.startPoint ?? ""}
                                            size={"small"}
                                            fullWidth={true}
                                            onChange={(e) => updateSimulationStartPoint(e.target.value)}
                                        />
                                    </LabeledField>
                                    <LabeledField labelKey={"word.simulationEndPoint"}
                                                  tooltipKey={"tooltip.simulationEndPoint"} required={false}>
                                        <TextField
                                            value={simulationEndPoint ?? workflow?.stepBasedConfig?.endPoint ?? ""}
                                            size={"small"}
                                            fullWidth={true}
                                            onChange={(e) => updateSimulationEndPoint(e.target.value)}
                                        />
                                    </LabeledField>
                                    <LabeledField labelKey={"word.duration"} tooltipKey={"tooltip.duration"} required={false}>
                                        <Stack direction={"row"} alignItems={"center"} spacing={2}>
                                            <TextField
                                                value={simulationDuration ?? workflow?.stepBasedConfig?.duration ?? ""}
                                                size={"small"}
                                                fullWidth={true}
                                                onChange={(e) => updateSimulationDuration(e.target.value)}
                                            />
                                            <FormLabel color={"primary"} sx={{fontSize: "0.875rem"}}>ms</FormLabel>
                                        </Stack>
                                    </LabeledField>
                                    <LabeledField labelKey={"word.timeoutWorker"} tooltipKey={"tooltip.timeoutWorker"}>
                                        <Stack direction={"row"} alignItems={"center"} spacing={2}>
                                            <TextField
                                                value={simulationTimeoutWorker ?? workflow?.stepBasedConfig?.workerTimeout ?? ""}
                                                size={"small"}
                                                fullWidth={true}
                                                onChange={(e) => updateSimulationTimeoutWorker(e.target.value)}
                                            />
                                            <FormLabel color={"primary"} sx={{fontSize: "0.875rem"}}>s</FormLabel>
                                        </Stack>
                                    </LabeledField>
                                    <LabeledField labelKey={"word.timeoutInput"} tooltipKey={"tooltip.timeoutInput"}>
                                        <Stack direction={"row"} alignItems={"center"} spacing={2}>
                                            <TextField
                                                value={simulationTimeoutInput ?? workflow?.stepBasedConfig?.inputTimeout ?? ""}
                                                size={"small"}
                                                fullWidth={true}
                                                onChange={(e) => updateSimulationTimeoutInput(e.target.value)}
                                            />
                                            <FormLabel color={"primary"} sx={{fontSize: "0.875rem"}}>s</FormLabel>
                                        </Stack>
                                    </LabeledField>
                                </Grid>
                            </AccordionDetails>
                        </Accordion>
                    </Grid>
                </Grid>
            </Paper>
        </Fragment>
    );
};

export default PreselectedStart;