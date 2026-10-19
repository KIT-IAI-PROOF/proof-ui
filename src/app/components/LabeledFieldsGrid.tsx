import Grid from "@mui/material/Grid2";
import {ReactNode} from "react";

interface IProps {
    children: ReactNode;
}

const LabeledFieldsGrid = ({children}: IProps): ReactNode => (
    <Grid
        container={true}
        display={"flex"}
        alignItems={"center"}
        padding={1}
        paddingY={3}
        spacing={1}
    >
        {children}
    </Grid>
);

export default LabeledFieldsGrid;