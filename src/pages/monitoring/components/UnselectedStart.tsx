import {Fragment, ReactNode} from "react";
import {FormControl, InputLabel, MenuItem, Paper, Select, SelectChangeEvent, Theme, useTheme} from "@mui/material";
import {WorkflowDetail} from "@kit-iai-proof/proof-config-manager-client";
import {NavigateFunction, useNavigate} from "react-router-dom";
import Grid from "@mui/material/Grid2";
import {useQuery, UseQueryResult} from "@tanstack/react-query";
import {AxiosError} from "axios";
import {workflowsQueryOptions} from "../../../query/options/workflowQueryOptions.tsx";

const UnselectedStart: () => ReactNode = (): ReactNode => {

    const {data: workflows}: UseQueryResult<WorkflowDetail[], AxiosError> = useQuery(workflowsQueryOptions());

    const theme: Theme = useTheme();
    const navigate: NavigateFunction = useNavigate();

    return (
        <Fragment>
            <Paper
                elevation={0}
                style={{background: theme.palette.background.default}}>
                <Grid
                    padding={3}
                    container={true}>
                    <Grid size={12}>
                        <FormControl
                            color={"primary"}
                            fullWidth={true}
                            variant={"outlined"}
                            size={"small"}
                        >
                            <InputLabel id={"workflow-label"}>Workflow</InputLabel>
                            <Select
                                fullWidth={true}
                                autoWidth={true}
                                color={"primary"}
                                labelId="workflow-label"
                                id="workflow"
                                label="Workflow"
                                value={""}
                                disabled={workflows?.length === 0}
                                onChange={(event: SelectChangeEvent): void => {
                                    event.preventDefault();
                                    const selectedId: string = event.target.value;
                                    if (selectedId !== "") navigate(`/monitoring/execution/${selectedId}`);
                                }}
                                variant={"outlined"}
                                style={{minWidth: 150}}
                            >
                                return (
                                <MenuItem
                                    value={""}
                                >
                                    <i>Keine Auswahl</i>
                                </MenuItem>
                                {
                                    workflows?.map((workflow: WorkflowDetail): ReactNode => {
                                        return (
                                            <MenuItem
                                                key={workflow.id}
                                                value={workflow.id}
                                            >
                                                {workflow.label ?? workflow.id}
                                            </MenuItem>
                                        );
                                    })
                                }
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Paper>
        </Fragment>
    );

};

export default UnselectedStart;