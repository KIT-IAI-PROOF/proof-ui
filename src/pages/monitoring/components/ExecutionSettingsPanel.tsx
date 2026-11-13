import {Accordion, AccordionDetails, AccordionSummary, Checkbox, FormControlLabel, Paper, Stack, Theme, Tooltip, Typography, useTheme} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Grid from "@mui/material/Grid2";
import {Fragment, ReactNode, useState} from "react";
import {ExecutionDetail, InputDetail} from "@kit-iai-proof/proof-config-manager-client";
import {useTranslation} from "react-i18next";
import {Info} from "@mui/icons-material";
import Progress from "./Progress.tsx";
import LabeledField, {LabeledFieldSizes} from "../../../app/components/LabeledField.tsx";

interface IProps {
    execution: ExecutionDetail
}

const ExecutionSettingsPanel: ({execution}: IProps) => ReactNode = ({execution}: IProps): ReactNode => {

    const theme: Theme = useTheme();
    const {t} = useTranslation();

    const staticInputs: { [blockId: string]: InputDetail[] }[] = execution.workflow?.blocks?.map((block) => ({
            [block.label!]: block.inputs?.filter((input) => input.communicationType?.includes("STATIC") && execution.execParameters && Object.keys(execution.execParameters || {}).includes(input.id!)) || []
        })
    ) || []

    const nonStaticInputs: { [blockId: string]: InputDetail[] }[] = execution.workflow?.blocks?.map((block) => ({
            [block.label!]: block.inputs?.filter((input) => !input.communicationType?.includes("_STATIC") && !input.communicationType?.includes("STATIC")) || []
        })
    ) || []

    const [showOnlyWithValues, setShowOnlyWithValues] = useState<boolean>(true);

    // Half-page layout sizes
    const halfPageSizes: LabeledFieldSizes = {
        xs: {label: 3, content: 9},
        lg: {label: 4, content: 8},
        xl: {label: 4, content: 8}
    };

    return (
        <Fragment>
            <Grid
                paddingX={2}
                container={true}
                spacing={2}
            >
                <Grid
                    size={{xs: 12, lg: 6}}
                    alignContent="flex-start"
                >
                    <Accordion sx={{background: theme.palette.background.default}}>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon/>}
                        >
                            <Grid size={12}>
                                <Typography
                                    variant={"h3"}
                                >
                                    {t("word.executionDetails")}
                                    <Tooltip title={t("tooltip.executionDetails")}>
                                        <Info
                                            color={"primary"}
                                            fontSize={"small"}
                                            sx={{ml: 1, cursor: "pointer"}}
                                        />
                                    </Tooltip>
                                </Typography>
                            </Grid>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Grid container={true} paddingX={1} spacing={0.5}>
                                <LabeledField labelKey={"word.id"} tooltipKey={"tooltip.id"} sizes={halfPageSizes}>
                                    <Typography
                                        variant={"body1"}
                                    >
                                        {execution?.id}
                                    </Typography>
                                </LabeledField>
                                <LabeledField labelKey={"word.label"} tooltipKey={"tooltip.label"} sizes={halfPageSizes}>
                                    <Typography
                                        variant={"body1"}
                                    >
                                        {execution?.label}
                                    </Typography>
                                </LabeledField>
                                <LabeledField labelKey={"word.description"} tooltipKey={"tooltip.description"} sizes={halfPageSizes}>
                                    <Typography
                                        variant={"body1"}>
                                        {execution?.description}
                                    </Typography>
                                </LabeledField>
                                <LabeledField labelKey={"word.status"} tooltipKey={"tooltip.status"} sizes={halfPageSizes}>
                                    <Typography
                                        variant={"body1"}
                                    >
                                        {execution?.status}
                                    </Typography>
                                </LabeledField>
                                <LabeledField labelKey={"word.startedAt"} tooltipKey={"tooltip.startedAt"} sizes={halfPageSizes}>
                                    <Typography
                                        variant={"body1"}
                                    >
                                        {execution?.startedAt ? new Date(execution.startedAt).toLocaleString("de-DE") : t('word.notStarted')}
                                    </Typography>
                                </LabeledField>
                                <LabeledField labelKey={"word.stoppedAt"} tooltipKey={"tooltip.stoppedAt"} sizes={halfPageSizes}>
                                    <Typography
                                        variant={"body1"}
                                    >
                                        {execution?.stoppedAt ? new Date(execution.stoppedAt).toLocaleString("de-DE") : t('word.notStopped')}
                                    </Typography>
                                </LabeledField>
                                <Grid size={12} paddingTop={1}>
                                    <Accordion sx={{background: theme.palette.background.paper}}>
                                        <AccordionSummary
                                            expandIcon={<ExpandMoreIcon/>}
                                        >
                                            <Stack direction={"row"} alignItems={"center"}>
                                                <Typography variant={"h3"}>
                                                    {t("word.staticInputs")}
                                                </Typography>
                                                <Tooltip title={t("tooltip.staticInputs")}>
                                                    <Info
                                                        color={"primary"}
                                                        fontSize={"small"}
                                                        sx={{ml: 1, cursor: "pointer"}}
                                                    />
                                                </Tooltip>
                                            </Stack>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            {!execution.execParameters || Object.keys(execution.execParameters).length === 0 ?
                                                <Typography>
                                                    {t("word.noStaticInputs")}
                                                </Typography>
                                                :
                                                staticInputs.flatMap((block: {
                                                    [blockId: string]: InputDetail[]
                                                }): ReactNode[] =>
                                                    Object.entries(block)
                                                        .map(([blockLabel, inputs]: [string, InputDetail[]]): ReactNode =>
                                                            inputs.length > 0 ? (
                                                                <Paper key={blockLabel} elevation={1}>
                                                                    <Grid
                                                                        container={true}
                                                                        marginBottom={1}
                                                                        padding={2}
                                                                    >
                                                                        <Grid size={12}>
                                                                            <Stack direction={"row"}
                                                                                   alignItems={"center"}>
                                                                                <Typography
                                                                                    variant={"body1"}
                                                                                    color={"primary"}
                                                                                    sx={{
                                                                                        overflow: "hidden",
                                                                                        textOverflow: "ellipsis",
                                                                                        whiteSpace: "nowrap",
                                                                                        flexShrink: 1,
                                                                                        minWidth: 0
                                                                                    }}
                                                                                >
                                                                                    {blockLabel}
                                                                                </Typography>
                                                                                <Tooltip
                                                                                    title={t("tooltip.blockLabel")}
                                                                                >
                                                                                    <Info
                                                                                        color={"primary"}
                                                                                        fontSize={"small"}
                                                                                        sx={{ml: 1, cursor: "pointer"}}
                                                                                    />
                                                                                </Tooltip>
                                                                            </Stack>
                                                                        </Grid>
                                                                        {inputs.map((input: InputDetail, index: number): ReactNode =>
                                                                            <Fragment key={index}>
                                                                                <Grid paddingLeft={2} size={5}>
                                                                                    <Stack
                                                                                        direction={"row"}
                                                                                        alignItems={"center"}
                                                                                    >
                                                                                        <Typography
                                                                                            variant={"body1"}
                                                                                            color={"primary"}
                                                                                            sx={{
                                                                                                overflow: "hidden",
                                                                                                textOverflow: "ellipsis",
                                                                                                whiteSpace: "nowrap",
                                                                                                flexShrink: 1,
                                                                                                minWidth: 0
                                                                                            }}
                                                                                        >
                                                                                            {input.label}
                                                                                        </Typography>
                                                                                        <Tooltip
                                                                                            title={input.description + (input.unit ? `\n${t("word.unit")}: ${input.unit}` : "")}
                                                                                        >
                                                                                            <Info
                                                                                                color={"primary"}
                                                                                                fontSize={"small"}
                                                                                                sx={{
                                                                                                    ml: 1,
                                                                                                    cursor: "pointer"
                                                                                                }}
                                                                                            />
                                                                                        </Tooltip>
                                                                                    </Stack>
                                                                                </Grid>
                                                                                <Grid size={7} paddingLeft={1}>
                                                                                    <Stack
                                                                                        direction={"row"}
                                                                                        alignItems={"center"}
                                                                                        spacing={1}
                                                                                    >
                                                                                        <Typography variant={"body1"}>
                                                                                            {Object.entries(execution.execParameters || {}).find(([key]: [string, string]): boolean => input.id === key)?.[1]}
                                                                                        </Typography>
                                                                                        <Typography variant={"body2"}>
                                                                                            {input.unit ? input.unit : ""}
                                                                                        </Typography>
                                                                                        <Tooltip
                                                                                            title={t("tooltip.inputValue")}
                                                                                        >
                                                                                            <Info
                                                                                                color={"primary"}
                                                                                                fontSize={"small"}
                                                                                                sx={{cursor: "pointer"}}
                                                                                            />
                                                                                        </Tooltip>
                                                                                    </Stack>
                                                                                </Grid>
                                                                            </Fragment>
                                                                        )}
                                                                    </Grid>
                                                                </Paper>
                                                            ) : null
                                                        ))}
                                        </AccordionDetails>
                                    </Accordion>
                                </Grid>
                                <Grid size={12} paddingTop={1}>
                                    <Accordion sx={{background: theme.palette.background.paper}}>
                                        <AccordionSummary
                                            expandIcon={<ExpandMoreIcon/>}
                                        >
                                            <Stack direction={"row"} alignItems={"center"}
                                                   justifyContent={"space-between"} width={"100%"}>
                                                <Stack direction={"row"} alignItems={"center"}>
                                                    <Typography variant={"h3"}>
                                                        {t("word.nonStaticInputValues")}
                                                    </Typography>
                                                    <Tooltip title={t("tooltip.nonStaticInputValues")}>
                                                        <Info
                                                            color={"primary"}
                                                            fontSize={"small"}
                                                            sx={{ml: 1, cursor: "pointer"}}
                                                        />
                                                    </Tooltip>
                                                </Stack>
                                                <FormControlLabel
                                                    control={
                                                        <Checkbox
                                                            checked={showOnlyWithValues}
                                                            onChange={(e) => {
                                                                e.stopPropagation();
                                                                setShowOnlyWithValues(e.target.checked);
                                                            }}
                                                            onClick={(e) => e.stopPropagation()}
                                                            size="small"
                                                        />
                                                    }
                                                    label={t("word.hideNoValues")}
                                                    sx={{mr: 0}}
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            </Stack>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            {nonStaticInputs.map((block: {
                                                    [blockId: string]: InputDetail[]
                                                }): ReactNode[] =>
                                                    Object.entries(block)
                                                        .map(([blockLabel, inputs]: [string, InputDetail[]]): ReactNode => {
                                                            // Filter inputs based on checkbox state
                                                            const filteredInputs = showOnlyWithValues
                                                                ? inputs.filter((input) =>
                                                                    execution.execStartValues?.[input.id!] != null ||
                                                                    execution.execDefaultValues?.[input.id!] != null ||
                                                                    execution.execParameters?.[input.id!] != null
                                                                )
                                                                : inputs;

                                                            if (filteredInputs.length === 0) {
                                                                return null;
                                                            }
                                                            return (
                                                                <Paper key={blockLabel} elevation={1}>
                                                                    <Grid
                                                                        container={true}
                                                                        marginBottom={1}
                                                                        padding={2}
                                                                    >
                                                                        <Fragment key={blockLabel}>
                                                                            <Grid size={4}>
                                                                                <Stack direction={"row"}
                                                                                       alignItems={"center"}>
                                                                                    <Typography
                                                                                        variant={"body1"}
                                                                                        color={"primary"}
                                                                                        sx={{
                                                                                            overflow: "hidden",
                                                                                            textOverflow: "ellipsis",
                                                                                            whiteSpace: "nowrap",
                                                                                            flexShrink: 1,
                                                                                            minWidth: 0
                                                                                        }}
                                                                                    >
                                                                                        {blockLabel}
                                                                                    </Typography>
                                                                                    <Tooltip
                                                                                        title={t("tooltip.blockLabel")}
                                                                                    >
                                                                                        <Info
                                                                                            color={"primary"}
                                                                                            fontSize={"small"}
                                                                                            sx={{ml: 1, cursor: "pointer"}}
                                                                                        />
                                                                                    </Tooltip>
                                                                                </Stack>
                                                                            </Grid>
                                                                            <Grid size={4} paddingLeft={1}>
                                                                                <Stack
                                                                                    direction={"row"}
                                                                                    alignItems={"center"}
                                                                                >
                                                                                    <Typography>{t("word.startValue")}</Typography>
                                                                                    <Tooltip
                                                                                        title={t("tooltip.startValue")}
                                                                                    >
                                                                                        <Info
                                                                                            color={"primary"}
                                                                                            fontSize={"small"}
                                                                                            sx={{ml: 1, cursor: "pointer"}}
                                                                                        />
                                                                                    </Tooltip>
                                                                                </Stack>
                                                                            </Grid>
                                                                            <Grid size={4} paddingLeft={1}>
                                                                                <Stack
                                                                                    direction={"row"}
                                                                                    alignItems={"center"}
                                                                                >
                                                                                    <Typography>{t("word.defaultValue")}</Typography>
                                                                                    <Tooltip
                                                                                        title={t("tooltip.defaultValue")}
                                                                                    >
                                                                                        <Info
                                                                                            color={"primary"}
                                                                                            fontSize={"small"}
                                                                                            sx={{ml: 1, cursor: "pointer"}}
                                                                                        />
                                                                                    </Tooltip>
                                                                                </Stack>
                                                                            </Grid>
                                                                        </Fragment>
                                                                        {filteredInputs.map((input: InputDetail, index: number): ReactNode =>
                                                                            <Fragment key={index}>
                                                                                <Grid paddingLeft={2} size={4}>
                                                                                    <Stack
                                                                                        direction={"row"}
                                                                                        alignItems={"center"}
                                                                                    >
                                                                                        <Typography
                                                                                            variant={"body1"}
                                                                                            color={"primary"}
                                                                                            sx={{
                                                                                                overflow: "hidden",
                                                                                                textOverflow: "ellipsis",
                                                                                                whiteSpace: "nowrap",
                                                                                                flexShrink: 1,
                                                                                                minWidth: 0
                                                                                            }}
                                                                                        >
                                                                                            {input.label}
                                                                                        </Typography>
                                                                                        <Tooltip
                                                                                            title={input.description + (input.unit ? `\n${t("word.unit")}: ${input.unit}` : "")}
                                                                                        >
                                                                                            <Info
                                                                                                color={"primary"}
                                                                                                fontSize={"small"}
                                                                                                sx={{
                                                                                                    ml: 1,
                                                                                                    cursor: "pointer"
                                                                                                }}
                                                                                            />
                                                                                        </Tooltip>
                                                                                    </Stack>
                                                                                </Grid>
                                                                                <Grid size={4} paddingLeft={1}>
                                                                                    <Stack
                                                                                        direction={"row"}
                                                                                        alignItems={"center"}
                                                                                        spacing={1}
                                                                                    >
                                                                                        <Typography
                                                                                            variant={"body1"}
                                                                                            sx={{
                                                                                                color: execution.execStartValues?.[input.id!]
                                                                                                    ? "text.primary"
                                                                                                    : "text.secondary"
                                                                                            }}
                                                                                        >
                                                                                            {execution.execStartValues?.[input.id!] ?? t("word.noStartValue")}
                                                                                        </Typography>
                                                                                        <Typography
                                                                                            variant={"body2"}
                                                                                            sx={{
                                                                                                color: execution.execStartValues?.[input.id!]
                                                                                                    ? "text.primary"
                                                                                                    : "text.secondary"
                                                                                            }}
                                                                                        >
                                                                                            {input.unit ? input.unit : ""}
                                                                                        </Typography>
                                                                                    </Stack>
                                                                                </Grid>
                                                                                <Grid size={4} paddingLeft={1}>
                                                                                    <Stack
                                                                                        direction={"row"}
                                                                                        alignItems={"center"}
                                                                                        spacing={1}
                                                                                    >
                                                                                        <Typography
                                                                                            variant={"body1"}
                                                                                            sx={{
                                                                                                color: execution.execDefaultValues?.[input.id!]
                                                                                                    ? "text.primary"
                                                                                                    : "text.secondary"
                                                                                            }}
                                                                                        >
                                                                                            {execution.execDefaultValues?.[input.id!] ?? t("word.noDefaultValue")}
                                                                                        </Typography>
                                                                                        <Typography
                                                                                            variant={"body2"}
                                                                                            sx={{
                                                                                                color: execution.execDefaultValues?.[input.id!]
                                                                                                    ? "text.primary"
                                                                                                    : "text.secondary"
                                                                                            }}
                                                                                        >
                                                                                            {input.unit ? input.unit : ""}
                                                                                        </Typography>
                                                                                    </Stack>
                                                                                </Grid>
                                                                            </Fragment>
                                                                        )}
                                                                    </Grid>
                                                                </Paper>
                                                            );
                                                        })
                                            )}
                                        </AccordionDetails>
                                    </Accordion>
                                </Grid>
                            </Grid>
                        </AccordionDetails>
                    </Accordion>
                </Grid>
                <Grid
                    container={true}
                    size={{xs: 12, lg: 6}}
                    alignContent="flex-start"
                >
                    <Accordion sx={{background: theme.palette.background.default}}>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon/>}
                        >
                            <Grid size={12}>
                                <Typography
                                    variant={"h3"}
                                >
                                    {t("word.executionWorkflow")}
                                    <Tooltip title={t("tooltip.executionWorkflow")}>
                                        <Info
                                            color={"primary"}
                                            fontSize={"small"}
                                            sx={{ml: 1, cursor: "pointer"}}
                                        />
                                    </Tooltip>
                                </Typography>
                            </Grid>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Grid container={true} paddingX={1} spacing={0.5}>
                                <LabeledField labelKey={"word.workflowLabel"} tooltipKey={"tooltip.workflowLabel"} sizes={halfPageSizes}>
                                    <Typography
                                        variant={"body1"}>
                                        {execution?.workflow?.label ?? t("word.unknownWorkflow")}
                                    </Typography>
                                </LabeledField>
                                <LabeledField labelKey={"word.communicationParadigm"}
                                              tooltipKey={"tooltip.communicationParadigm"} sizes={halfPageSizes}>
                                    <Typography variant={"body1"}>
                                        {execution?.workflow?.communicationParadigm ?? ""}
                                    </Typography>
                                </LabeledField>
                                <LabeledField labelKey={"word.simulationStrategy"}
                                              tooltipKey={"tooltip.simulationStrategy"} sizes={halfPageSizes}>
                                    <Typography variant={"body1"}>
                                        {execution.workflow?.simulationStrategy ?? ""}
                                    </Typography>
                                </LabeledField>
                                <LabeledField labelKey={"word.simulationStartPoint"}
                                              tooltipKey={"tooltip.simulationStartPoint"} sizes={halfPageSizes}>
                                    <Stack direction={"row"} alignItems={"center"} spacing={0.5}>
                                        <Typography variant={"body1"}>
                                            {execution.workflow?.stepBasedConfig?.startPoint ?? ""}
                                        </Typography>
                                        {execution.workflow?.stepBasedConfig?.startTime != null && (
                                            <Fragment>
                                                <Typography variant={"body1"} color={"text.secondary"}>(</Typography>
                                                <Typography variant={"body1"} color={"text.secondary"}>
                                                    {t("word.startTime")}
                                                </Typography>
                                                <Tooltip title={t("tooltip.startTime")}>
                                                    <Info
                                                        color={"disabled"}
                                                        fontSize={"small"}
                                                        sx={{ml: 1, cursor: "pointer"}}
                                                    />
                                                </Tooltip>
                                                <Typography variant={"body1"}
                                                            color={"text.secondary"}> = {execution.workflow.stepBasedConfig.startTime} )</Typography>
                                            </Fragment>
                                        )}
                                    </Stack>
                                </LabeledField>
                                <LabeledField labelKey={"word.simulationEndPoint"}
                                              tooltipKey={"tooltip.simulationEndPoint"} sizes={halfPageSizes}>
                                    <Stack direction={"row"} alignItems={"center"} spacing={0.5}>
                                        <Typography variant={"body1"}>
                                            {execution.workflow?.stepBasedConfig?.endPoint ?? ""}
                                        </Typography>
                                        {execution.workflow?.stepBasedConfig?.endTime != null && (
                                            <Fragment>
                                                <Typography variant={"body1"} color={"text.secondary"}>(</Typography>
                                                <Typography variant={"body1"} color={"text.secondary"}>
                                                    {t("word.endTime")}
                                                </Typography>
                                                <Tooltip title={t("tooltip.endTime")}>
                                                    <Info
                                                        color={"disabled"}
                                                        fontSize={"small"}
                                                        sx={{ml: 1, cursor: "pointer"}}
                                                    />
                                                </Tooltip>
                                                <Typography variant={"body1"}
                                                            color={"text.secondary"}> = {execution.workflow.stepBasedConfig.endTime} )</Typography>
                                            </Fragment>
                                        )}
                                    </Stack>
                                </LabeledField>
                                <LabeledField labelKey={"word.duration"} tooltipKey={"tooltip.duration"} sizes={halfPageSizes}>
                                    <Typography variant={"body1"}>
                                        {execution.workflow?.stepBasedConfig?.duration ?? ""} ms
                                    </Typography>
                                </LabeledField>
                                <LabeledField labelKey={"word.timeoutWorker"} tooltipKey={"tooltip.timeoutWorker"} sizes={halfPageSizes}>
                                    <Typography variant={"body1"}>
                                        {execution.workflow?.stepBasedConfig?.workerTimeout ?? ""} s
                                    </Typography>
                                </LabeledField>
                                <LabeledField labelKey={"word.timeoutInput"} tooltipKey={"tooltip.timeoutInput"} sizes={halfPageSizes}>
                                    <Typography variant={"body1"}>
                                        {execution.workflow?.stepBasedConfig?.inputTimeout ?? ""} s
                                    </Typography>
                                </LabeledField>
                            </Grid>
                        </AccordionDetails>
                    </Accordion>
                </Grid>
            </Grid>
            <Progress execution={execution}/>
        </Fragment>
    );
};

export default ExecutionSettingsPanel;