import {Accordion, AccordionDetails, AccordionSummary, FormControl, InputLabel, MenuItem, Select, Stack, TextField, Theme, Typography, useTheme} from "@mui/material";
import {useTranslation} from "react-i18next";
import {OutputDetail, OutputDetailCommunicationTypeEnum, OutputDetailTypeEnum} from "@webis/proof-config-manager-client";
import React, {ReactNode} from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

interface IProps {
    outputs: OutputDetail[]
}

const OutputsPanel = ({outputs}: IProps) => {

    const theme: Theme = useTheme();
    const {t} = useTranslation();

    return (
        <Stack spacing={1} paddingX={2}>
            {
                outputs?.map((handle: OutputDetail, index): ReactNode => {
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
                                    {handle.label || `Output ${index + 1}`}
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <TextField
                                    disabled={true}
                                    sx={{pb: 2}}
                                    size={"small"}
                                    fullWidth={true}
                                    label={t("word.label")}
                                    value={handle.label ?? ""}
                                    variant="outlined"
                                />
                                <TextField
                                    sx={{pb: 2}}
                                    disabled={true}
                                    fullWidth={true}
                                    size={"small"}
                                    label={t("word.description")}
                                    value={handle.description ?? ""}
                                    variant="outlined"
                                />
                                <FormControl fullWidth sx={{pb: 2}}>
                                    <InputLabel>{t("word.type")}</InputLabel>
                                    <Select
                                        disabled={true}
                                        size={"small"}
                                        variant="outlined"
                                        value={handle.type ?? ""}
                                        label={t("word.type")}
                                    >
                                        <MenuItem
                                            value={OutputDetailTypeEnum.String ?? ""}>
                                            {OutputDetailTypeEnum.String}
                                        </MenuItem>
                                        <MenuItem
                                            value={OutputDetailTypeEnum.Float ?? ""}>
                                            {OutputDetailTypeEnum.Float}
                                        </MenuItem>
                                        <MenuItem
                                            value={OutputDetailTypeEnum.Integer ?? ""}>
                                            {OutputDetailTypeEnum.Integer}
                                        </MenuItem>
                                        <MenuItem
                                            value={OutputDetailTypeEnum.Object ?? ""}>
                                            {OutputDetailTypeEnum.Object}
                                        </MenuItem>
                                        <MenuItem
                                            value={OutputDetailTypeEnum.FileName ?? ""}>
                                            {OutputDetailTypeEnum.FileName}
                                        </MenuItem>
                                        <MenuItem
                                            value={OutputDetailTypeEnum.StringArray ?? ""}>
                                            {OutputDetailTypeEnum.StringArray}
                                        </MenuItem>
                                        <MenuItem
                                            value={OutputDetailTypeEnum.IntegerArray ?? ""}>
                                            {OutputDetailTypeEnum.IntegerArray}
                                        </MenuItem>
                                        <MenuItem
                                            value={OutputDetailTypeEnum.FloatArray ?? ""}>
                                            {OutputDetailTypeEnum.FloatArray}
                                        </MenuItem>
                                        <MenuItem
                                            value={OutputDetailTypeEnum.ObjectArray ?? ""}>
                                            {OutputDetailTypeEnum.ObjectArray}
                                        </MenuItem>
                                    </Select>
                                </FormControl>
                                <FormControl fullWidth sx={{pb: 2}}>
                                    <InputLabel>{t("word.communicationType")}</InputLabel>
                                    <Select
                                        size={"small"}
                                        variant="outlined"
                                        value={handle.communicationType ?? ""}
                                        label={t("word.communicationType")}
                                        disabled={true}
                                    >
                                        <MenuItem
                                            value={OutputDetailCommunicationTypeEnum.Stepbased ?? ""}>
                                            {OutputDetailCommunicationTypeEnum.Stepbased}
                                        </MenuItem>
                                        {/* <MenuItem
                                            value={OutputDetailCommunicationTypeEnum.Event ?? ""}>
                                            {OutputDetailCommunicationTypeEnum.Event}
                                        </MenuItem> */}
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

export default React.memo(OutputsPanel);