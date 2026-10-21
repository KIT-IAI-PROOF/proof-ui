import {FooterPropsOverrides, GridFooterContainer, GridPagination, GridSelectedRowCount} from "@mui/x-data-grid";
import {Button, Stack} from "@mui/material";
import {Fragment} from "react";
import StopIcon from "@mui/icons-material/Stop";
import DeleteIcon from "@mui/icons-material/Delete";

interface IMonitoringFooterProps extends FooterPropsOverrides {
    selectedCount: number;
    stopLabel: string;
    deleteLabel: string;
    onBulkStop: () => void;
    onBulkDelete: () => void;
}

const MonitoringTableFooter = ({
                                   selectedCount,
                                   stopLabel,
                                   deleteLabel,
                                   onBulkStop,
                                   onBulkDelete
                               }: IMonitoringFooterProps) => (
    <GridFooterContainer>
        <Stack direction={"row"} spacing={1} alignItems={"center"} sx={{pl: 1}}>
            {
                selectedCount > 0 && <Fragment>
                    <GridSelectedRowCount selectedRowCount={selectedCount}/>
                    <Button size={"small"} variant={"outlined"} color={"error"} startIcon={<StopIcon/>}
                            onClick={onBulkStop}>
                        {stopLabel}
                    </Button>
                    <Button size={"small"} variant={"outlined"} color={"error"} startIcon={<DeleteIcon/>}
                            onClick={onBulkDelete}>
                        {deleteLabel}
                    </Button>
                </Fragment>
            }
        </Stack>
        <GridPagination/>
    </GridFooterContainer>
)

export default MonitoringTableFooter;