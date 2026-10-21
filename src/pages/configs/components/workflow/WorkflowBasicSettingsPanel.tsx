import React, {ChangeEvent, Fragment, ReactNode, useContext} from "react";
import {FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, TextField, Typography} from "@mui/material";
import {StepBasedConfigurationDetail, WorkflowDetailCommunicationParadigmEnum, WorkflowDetailSimulationStrategyEnum} from "@webis/proof-config-manager-client";
import {useTranslation} from "react-i18next";
import {IAppContext} from "../../../../provider/AppProvider.tsx";
import {AppContext} from "../../../../provider/AppContext.tsx";
import dayjs from "dayjs";
import LabeledFieldsGrid from "../../../../app/components/LabeledFieldsGrid.tsx";
import LabeledField from "../../../../app/components/LabeledField.tsx";

interface IProps {
    id: string | undefined,
    label: string | undefined,
    labelError: boolean,
    description: string | undefined,
    communicationParadigm: WorkflowDetailCommunicationParadigmEnum | undefined,
    paradigmError: boolean,
    simulationStrategy: WorkflowDetailSimulationStrategyEnum | undefined,
    simulationStrategyError: boolean,
    stepBasedConfig: StepBasedConfigurationDetail | undefined,
    setId: (id: string) => void,
    setCommunicationParadigm: (communicationParadigm: WorkflowDetailCommunicationParadigmEnum) => void,
    setSimulationStrategy: (simulationStrategy: WorkflowDetailSimulationStrategyEnum) => void,
    setLabel: (label: string) => void,
    setDescription: (description: string) => void,
    modifiedBy: string | undefined,
    modifiedDate: Date | undefined,
    createdBy: string | undefined,
    creationDate: Date | undefined,
}

const WorkflowBasicSettingsPanel: ({
                                       id,
                                       setId,
                                       description,
                                       setDescription,
                                       simulationStrategy,
                                       simulationStrategyError,
                                       setSimulationStrategy,
                                       label,
                                       labelError,
                                       setLabel,
                                       communicationParadigm,
                                       paradigmError,
                                       setCommunicationParadigm,
                                       modifiedBy,
                                       modifiedDate,
                                       createdBy,
                                       creationDate,

                                   }: IProps)
    => ReactNode = ({
                        id,
                        setId,
                        description,
                        setDescription,
                        simulationStrategy,
                        simulationStrategyError,
                        setSimulationStrategy,
                        label,
                        labelError,
                        setLabel,
                        communicationParadigm,
                        paradigmError,
                        setCommunicationParadigm,
                        modifiedBy,
                        modifiedDate,
                        createdBy,
                        creationDate,
                    }: IProps): ReactNode => {

    const {t} = useTranslation();
    const {hasUnsavedChanges, updateHasUnsavedChanges} = useContext<IAppContext>(AppContext);

    return (
        <Fragment>
            <LabeledFieldsGrid>
                <LabeledField labelKey={"word.id"} tooltipKey={"tooltip.id"}>
                    <TextField
                        disabled={true}
                        fullWidth={true}
                        value={id ?? ""}
                        size={"small"}
                        label={t("word.id")}
                        variant="outlined"
                        onChange={(event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): void => {
                            const id: string = event.target.value;
                            setId(id);
                        }}/>
                </LabeledField>
                <LabeledField labelKey={"word.label"} tooltipKey={"tooltip.label"} required={true}>
                    <TextField
                        required={true}
                        fullWidth={true}
                        value={label ?? ""}
                        size={"small"}
                        label={t("word.label")}
                        variant="outlined"
                        error={labelError}
                        helperText={labelError ? t("word.required") : ""}
                        onChange={(event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): void => {
                            const label: string = event.target.value;
                            setLabel(label);
                            if (!hasUnsavedChanges) updateHasUnsavedChanges(true)
                        }}/>
                </LabeledField>
                <LabeledField labelKey={"word.description"} tooltipKey={"tooltip.description"}>
                    <TextField
                        fullWidth={true}
                        value={description ?? ""}
                        size={"small"}
                        label={t("word.description")}
                        variant="outlined"
                        onChange={(event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): void => {
                            const description: string = event.target.value;
                            setDescription(description);
                            if (!hasUnsavedChanges) updateHasUnsavedChanges(true)
                        }}/>
                </LabeledField>
                <LabeledField labelKey={"word.communicationParadigm"} tooltipKey={"tooltip.communicationParadigm"}
                              required={true}>
                    <FormControl
                        required={true}
                        color={"primary"}
                        fullWidth={true}
                        variant={"outlined"}
                        size={"small"}
                    >
                        <InputLabel
                            id={"communicationParadigm-label"}>{t("word.communicationParadigm")}</InputLabel>
                        <Select
                            fullWidth={true}
                            color={"primary"}
                            labelId="communicationParadigm-label"
                            id="communicationParadigm"
                            label={t("word.communicationParadigm")}
                            value={communicationParadigm ?? ""}
                            variant={"outlined"}
                            error={paradigmError}
                            onChange={(event: SelectChangeEvent<WorkflowDetailCommunicationParadigmEnum>): void => {
                                const communicationParadigm: WorkflowDetailCommunicationParadigmEnum = event.target.value as WorkflowDetailCommunicationParadigmEnum;
                                setCommunicationParadigm(communicationParadigm);
                                if (!hasUnsavedChanges) updateHasUnsavedChanges(true)
                            }}
                        >
                            <MenuItem
                                key={WorkflowDetailCommunicationParadigmEnum.Stepbased}
                                value={WorkflowDetailCommunicationParadigmEnum.Stepbased}
                            >
                                {WorkflowDetailCommunicationParadigmEnum.Stepbased}
                            </MenuItem>
                            {/* <MenuItem
                                key={WorkflowDetailCommunicationParadigmEnum.Event}
                                value={WorkflowDetailCommunicationParadigmEnum.Event}
                            >
                                {WorkflowDetailCommunicationParadigmEnum.Event}
                            </MenuItem> */}
                        </Select>
                        {paradigmError && (
                            <Typography paddingLeft={2} paddingTop={0.5} variant="caption" color="error">
                                {t("word.required")}
                            </Typography>
                        )}
                    </FormControl>
                </LabeledField>
                <LabeledField labelKey={"word.simulationStrategy"} tooltipKey={"tooltip.simulationStrategy"}
                              required={true}>
                    <FormControl
                        required={true}
                        color={"primary"}
                        fullWidth={true}
                        variant={"outlined"}
                        size={"small"}
                    >
                        <InputLabel id={"simulationStrategy-label"}>{t("word.simulationStrategy")}</InputLabel>
                        <Select
                            fullWidth={true}
                            color={"primary"}
                            labelId="simulationStrategy-label"
                            id="simulationStrategy"
                            label={t("word.simulationStrategy")}
                            value={simulationStrategy ?? ""}
                            variant={"outlined"}
                            error={simulationStrategyError}
                            onChange={(event: SelectChangeEvent<WorkflowDetailSimulationStrategyEnum>): void => {
                                const simulationStrategy: WorkflowDetailSimulationStrategyEnum = event.target.value as WorkflowDetailSimulationStrategyEnum;
                                setSimulationStrategy(simulationStrategy);
                                if (!hasUnsavedChanges) updateHasUnsavedChanges(true)
                            }}
                        >
                            <MenuItem
                                key={WorkflowDetailSimulationStrategyEnum.Abort}
                                value={WorkflowDetailSimulationStrategyEnum.Abort}
                            >
                                {WorkflowDetailSimulationStrategyEnum.Abort}
                            </MenuItem>
                            <MenuItem
                                key={WorkflowDetailSimulationStrategyEnum.Latest}
                                value={WorkflowDetailSimulationStrategyEnum.Latest}
                            >
                                {WorkflowDetailSimulationStrategyEnum.Latest}
                            </MenuItem>
                            <MenuItem
                                key={WorkflowDetailSimulationStrategyEnum.Ignore}
                                value={WorkflowDetailSimulationStrategyEnum.Ignore}
                            >
                                {WorkflowDetailSimulationStrategyEnum.Ignore}
                            </MenuItem>
                            <MenuItem
                                key={WorkflowDetailSimulationStrategyEnum.WaitAndContinue}
                                value={WorkflowDetailSimulationStrategyEnum.WaitAndContinue}
                            >
                                {WorkflowDetailSimulationStrategyEnum.WaitAndContinue}
                            </MenuItem>
                            <MenuItem
                                key={WorkflowDetailSimulationStrategyEnum.WaitAndRetry}
                                value={WorkflowDetailSimulationStrategyEnum.WaitAndRetry}
                            >
                                {WorkflowDetailSimulationStrategyEnum.WaitAndRetry}
                            </MenuItem>
                        </Select>
                        {simulationStrategyError && (
                            <Typography paddingLeft={2} paddingTop={0.5} variant="caption" color="error">
                                {t("word.required")}
                            </Typography>
                        )}
                    </FormControl>
                </LabeledField>
                <LabeledField labelKey={"word.lastModifiedBy"} tooltipKey={"tooltip.lastModifiedBy"}>
                    <TextField
                        fullWidth={true}
                        value={modifiedBy ?? ""}
                        size={"small"}
                        label={t("word.lastModifiedBy")}
                        variant="outlined"
                        disabled/>
                </LabeledField>
                <LabeledField labelKey={"word.lastModifiedDate"} tooltipKey={"tooltip.lastModifiedDate"}>
                    <TextField
                        fullWidth={true}
                        value={modifiedDate ? dayjs.unix(Number(modifiedDate)).format("DD.MM.YYYY HH:mm [Uhr]") : ""}
                        size={"small"}
                        label={t("word.lastModifiedDate")}
                        variant="outlined"
                        disabled/>
                </LabeledField>
                <LabeledField labelKey={"word.createdBy"} tooltipKey={"tooltip.createdBy"}>
                    <TextField
                        fullWidth={true}
                        value={createdBy ?? ""}
                        size={"small"}
                        label={t("word.createdBy")}
                        variant="outlined"
                        disabled/>
                </LabeledField>
                <LabeledField labelKey={"word.creationDate"} tooltipKey={"tooltip.creationDate"}>
                    <TextField
                        fullWidth={true}
                        value={creationDate ? dayjs.unix(Number(creationDate)).format("DD.MM.YYYY HH:mm [Uhr]") : ""}
                        size={"small"}
                        label={t("word.creationDate")}
                        variant="outlined"
                        disabled/>
                </LabeledField>

            </LabeledFieldsGrid>
        </Fragment>
    );

}

export default React.memo(WorkflowBasicSettingsPanel);