import Grid from "@mui/material/Grid2";
import {Stack, Tooltip, Typography} from "@mui/material";
import {Info} from "@mui/icons-material";
import {Fragment, ReactNode} from "react";
import {useTranslation} from "react-i18next";

export interface GridSizes {
    label?: number;
    content?: number;
}

export interface LabeledFieldSizes {
    xs?: GridSizes;
    lg?: GridSizes;
    xl?: GridSizes;
}

interface IProps {
    labelKey: string;
    tooltipKey: string;
    required?: boolean;
    sizes?: LabeledFieldSizes;
    children: ReactNode;
}

const LabeledField = ({labelKey, tooltipKey, required = false, sizes, children}: IProps): ReactNode => {
    const {t} = useTranslation();

    // Default sizes (full-page layout)
    const defaultSizes = {
        xs: {label: 3, content: 9},
        lg: {label: 2, content: 10},
        xl: {label: 2, content: 10}
    };

    // Use provided sizes or defaults
    const finalSizes = {
        xs: sizes?.xs || defaultSizes.xs,
        lg: sizes?.lg || defaultSizes.lg,
        xl: sizes?.xl || defaultSizes.xl
    };

    return (
        <Fragment>
            <Grid size={{xs: finalSizes.xs.label, lg: finalSizes.lg.label, xl: finalSizes.xl.label}}>
                <Stack direction={"row"} alignItems={"center"}>
                    <Typography
                        variant={"body1"}
                        color={"primary"}
                    >
                        {t(labelKey)}{required ? " *" : ""}
                    </Typography>
                    <Tooltip title={t(tooltipKey)}>
                        <Info
                            color={"primary"}
                            fontSize={"small"}
                            sx={{ml: 1, cursor: "pointer"}}
                        />
                    </Tooltip>
                </Stack>
            </Grid>
            <Grid size={{xs: finalSizes.xs.content, lg: finalSizes.lg.content, xl: finalSizes.xl.content}}>
                {children}
            </Grid>
        </Fragment>
    );
};

export default LabeledField;
