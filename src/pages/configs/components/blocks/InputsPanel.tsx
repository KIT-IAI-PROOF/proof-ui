import {Accordion, AccordionDetails, AccordionSummary, FormControl, InputLabel, MenuItem, Select, Stack, TextField, Theme, Typography, useTheme} from "@mui/material";
import {InputDetail, InputDetailCommunicationTypeEnum, InputDetailTypeEnum} from "@kit-iai-proof/proof-config-manager-client";
import React, {ReactNode} from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {useTranslation} from "react-i18next";

interface IProps {
    inputs: InputDetail[]
}

const InputsPanel = ({inputs}: IProps) => {

    const theme: Theme = useTheme();
    const {t} = useTranslation();

    return (
        <Stack spacing={1} paddingX={2}>
            {
                inputs?.map((handle: InputDetail, index): ReactNode => {
                    return (
                        <Accordion
                            defaultExpanded={true}
                            key={handle.id || `Id ${index + 1}`}
                            disableGutters={true}
                            sx={{
                                background: theme.palette.elevated.paper,
                                borderRadius: 2,
                                '&:before': {
                                    display: 'none'
                                },
                            }}
                        >
                            <AccordionSummary
                                sx={{
                                    overflow: "hidden",
                                    "& .MuiAccordionSummary-content": {
                                        minWidth: 0,
                                    }
                                }}
                                expandIcon={<ExpandMoreIcon/>}
                            >
                                <Typography sx={{
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    minWidth: 0
                                }}>
                                    {handle.label || `Input ${index + 1}`}
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <TextField
                                    disabled={true}
                                    sx={{pb: 2}}
                                    fullWidth={true}
                                    size={"small"}
                                    label={t("word.label")}
                                    value={handle.label ?? ""}
                                    variant="outlined"
                                />
                                <TextField
                                    disabled={true}
                                    sx={{pb: 2}}
                                    size={"small"}
                                    fullWidth={true}
                                    label={t("word.description")}
                                    value={handle.description ?? ""}
                                    variant="outlined"
                                />
                                <FormControl fullWidth sx={{pb: 2}}>
                                    <InputLabel>{t("word.required")}</InputLabel>
                                    <Select
                                        disabled={true}
                                        variant="outlined"
                                        size={"small"}
                                        value={handle.required ? "true" : "false"}
                                        label={t("word.required")}
                                    >
                                        <MenuItem value={"true"}>
                                            {t("word.true")}
                                        </MenuItem>
                                        <MenuItem value={"false"}>
                                            {t("word.false")}
                                        </MenuItem>
                                    </Select>
                                </FormControl>
                                <FormControl fullWidth sx={{pb: 2}}>
                                    <InputLabel>{t("word.type")}</InputLabel>
                                    <Select
                                        disabled={true}
                                        variant="outlined"
                                        size={"small"}
                                        value={handle.type ?? ""}
                                        label={t("word.type")}
                                    >
                                        <MenuItem
                                            value={InputDetailTypeEnum.String ?? ""}>
                                            {InputDetailTypeEnum.String}
                                        </MenuItem>
                                        <MenuItem
                                            value={InputDetailTypeEnum.Float ?? ""}>
                                            {InputDetailTypeEnum.Float}
                                        </MenuItem>
                                        <MenuItem
                                            value={InputDetailTypeEnum.Integer ?? ""}>
                                            {InputDetailTypeEnum.Integer}
                                        </MenuItem>
                                        <MenuItem
                                            value={InputDetailTypeEnum.Object ?? ""}>
                                            {InputDetailTypeEnum.Object}
                                        </MenuItem>
                                        <MenuItem
                                            value={InputDetailTypeEnum.FileName ?? ""}>
                                            {InputDetailTypeEnum.FileName}
                                        </MenuItem>
                                        <MenuItem
                                            value={InputDetailTypeEnum.StringArray ?? ""}>
                                            {InputDetailTypeEnum.StringArray}
                                        </MenuItem>
                                        <MenuItem
                                            value={InputDetailTypeEnum.IntegerArray ?? ""}>
                                            {InputDetailTypeEnum.IntegerArray}
                                        </MenuItem>
                                        <MenuItem
                                            value={InputDetailTypeEnum.FloatArray ?? ""}>
                                            {InputDetailTypeEnum.FloatArray}
                                        </MenuItem>
                                        <MenuItem
                                            value={InputDetailTypeEnum.ObjectArray ?? ""}>
                                            {InputDetailTypeEnum.ObjectArray}
                                        </MenuItem>
                                    </Select>
                                </FormControl>
                                <FormControl fullWidth sx={{pb: 2}}>
                                    <InputLabel>{t("word.communicationType")}</InputLabel>
                                    <Select
                                        disabled={true}
                                        variant="outlined"
                                        size={"small"}
                                        value={handle.communicationType ?? ""}
                                        label={t("word.communicationType")}
                                    >
                                        <MenuItem
                                            value={InputDetailCommunicationTypeEnum.Stepbased ?? ""}>
                                            {InputDetailCommunicationTypeEnum.Stepbased}
                                        </MenuItem>
                                        {/* <MenuItem
                                            value={InputDetailCommunicationTypeEnum.Event ?? ""}>
                                            {InputDetailCommunicationTypeEnum.Event}
                                        </MenuItem>
                                        <MenuItem
                                            value={InputDetailCommunicationTypeEnum.EventStatic ?? ""}>
                                            {InputDetailCommunicationTypeEnum.EventStatic}
                                        </MenuItem> */}
                                        <MenuItem
                                            value={InputDetailCommunicationTypeEnum.StepbasedStatic ?? ""}>
                                            {InputDetailCommunicationTypeEnum.StepbasedStatic}
                                        </MenuItem>
                                    </Select>
                                </FormControl>
                            </AccordionDetails>
                        </Accordion>
                    );
                })
            }
        </Stack>
    )
}

export default React.memo(InputsPanel);