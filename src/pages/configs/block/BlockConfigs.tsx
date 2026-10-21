import {Fragment, useCallback, useContext, useEffect, useState} from "react";
import {Box, Paper, Stack, Typography} from "@mui/material";
import Grid from "@mui/material/Grid2";
import {useTranslation} from "react-i18next";
import {DataGrid, GridColDef, GridFilterModel, GridPaginationModel, GridRowParams, GridSortModel} from "@mui/x-data-grid";
import {BlockListing, BlockPagingModelListing} from "@webis/proof-config-manager-client";
import {NavigateFunction, useNavigate} from "react-router-dom";
import {EditNoteRounded} from "@mui/icons-material";
import {useIsFetching, useQuery, UseQueryResult} from "@tanstack/react-query";
import {BLOCKS_KEY, DEFAULT_CONFIGS_SORTING, DEFAULT_FILTER, DEFAULT_PAGINATION, PAGE_CONTAINER_PADDING} from "../../../utils/constants.ts";
import {AxiosError} from "axios";
import {IAppContext} from "../../../provider/AppProvider.tsx";
import {AppContext} from "../../../provider/AppContext.tsx";
import {searchBlocksQueryOptions} from "../../../query/options/blockQueryOptions.tsx";

const BlockConfigs = () => {

    const {t} = useTranslation();
    const navigate: NavigateFunction = useNavigate();
    const {publishEntityMessage} = useContext<IAppContext>(AppContext);

    const [blocksRequest, setBlocksRequest] = useState<any>();
    const [blocksSortModel, setBlocksSortModel] = useState<GridSortModel>(DEFAULT_CONFIGS_SORTING);
    const [blocksFilterModel, setBlocksFilterModel] = useState<GridFilterModel>(DEFAULT_FILTER);
    const [blocksPaginationModel, setBlocksPaginationModel] = useState<GridPaginationModel>(DEFAULT_PAGINATION);

    const isFetching: number = useIsFetching({queryKey: [BLOCKS_KEY, blocksRequest], exact: true});

    const columns: GridColDef[] = [
        {
            field: "id",
            headerName: t("word.id"),
            width: 300,
            editable: false
        },
        {
            field: "label",
            headerName: t("word.label"),
            width: 500,
            editable: false
        },
        {
            field: "description",
            headerName: t("word.description"),
            flex: 1,
            editable: false
        }
    ];

    useEffect((): void => {
        setBlocksRequest({
            sort: blocksSortModel,
            filter: blocksFilterModel,
            pagination: blocksPaginationModel
        });
    }, [blocksFilterModel, blocksPaginationModel, blocksSortModel]);

    const onSortModelChange = useCallback((sortModel: GridSortModel) => {
        setBlocksSortModel(sortModel);
    }, []);

    const onFilterModelChange = useCallback((filterModel: GridFilterModel) => {
        setBlocksFilterModel(filterModel);
    }, []);

    const onPaginationModelChange = useCallback((paginationModel: GridPaginationModel) => {
        setBlocksPaginationModel(paginationModel);
    }, []);

    const {data: blocks}: UseQueryResult<BlockPagingModelListing, AxiosError> = useQuery(searchBlocksQueryOptions(blocksRequest));

    return (
        <Fragment>
            <Box
                {...PAGE_CONTAINER_PADDING}>
                <Paper>
                    <Box padding={3}>
                        <Grid
                            container={true}
                            justifyContent={"space-between"}
                            alignItems={"center"}
                            paddingBottom={2}
                            spacing={1}
                        >
                            <Grid>
                                <Stack
                                    direction={"row"}
                                    spacing={1}>
                                    <EditNoteRounded
                                        color={"primary"}
                                        fontSize={"large"}/>
                                    <Typography variant={"h4"}>{t("page.header.configs.blocks")}</Typography>
                                </Stack>
                            </Grid>
                        </Grid>
                        <DataGrid<BlockListing>
                            loading={!!isFetching}
                            rows={blocks?.results ?? []}
                            rowCount={blocks?.rowCount ?? 0}
                            columns={columns}
                            sortingMode={"server"}
                            paginationMode={"server"}
                            filterMode={"server"}
                            sortModel={blocksSortModel}
                            filterModel={blocksFilterModel}
                            paginationModel={blocksPaginationModel}
                            onSortModelChange={(sortModel: GridSortModel) => {
                                onSortModelChange(sortModel);
                            }}
                            onFilterModelChange={(filterModel: GridFilterModel) => {
                                onFilterModelChange(filterModel);
                            }}
                            onPaginationModelChange={(paginationModel: GridPaginationModel) => {
                                onPaginationModelChange(paginationModel);
                            }}
                            onRowClick={(params: GridRowParams<BlockListing>): void => {
                                if (params.row.id) {
                                    publishEntityMessage(params.row.id, "blocks")
                                    navigate(`/configs/blocks/${params.row.id}`);
                                }
                            }}
                            pageSizeOptions={[10, 25, 50, 100]}
                        />
                    </Box>
                </Paper>
            </Box>
        </Fragment>
    );

};

export default BlockConfigs;