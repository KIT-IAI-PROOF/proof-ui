import {Menu, MenuItem, PopoverPosition} from "@mui/material";
import {useTranslation} from "react-i18next";
import {Dispatch, Fragment, ReactNode, SetStateAction, useContext, useMemo, useState} from "react";
import ConfirmDialog from "../../../app/components/ConfirmDialog.tsx";
import {EditorContext} from "../../../provider/EditorContext.tsx";
import {BlockDetail, TemplateDetail} from "@webis/proof-config-manager-client";
import {NavigateFunction, useNavigate} from "react-router-dom";
import {useQuery, UseQueryResult} from "@tanstack/react-query";
import {AxiosError} from "axios";
import {blockQueryOptions} from "../../../query/options/blockQueryOptions.tsx";
import {templateQueryOptions} from "../../../query/options/templateQueryOptions.tsx";

export interface NodeMenuObject {
    id?: string;
    data?: any,
    anchorPosition?: PopoverPosition | undefined;
    onDelete?: (id: string) => void;
    onUpdate?: (template: TemplateDetail, block: BlockDetail) => void;
    onDuplicate?: () => any;
}

export interface INodeMenuProps {
    nodeMenuObject: NodeMenuObject | undefined;
    setNodeMenuObject: Dispatch<SetStateAction<NodeMenuObject | undefined>>;
}

const NodeContextMenu = ({nodeMenuObject, setNodeMenuObject}: INodeMenuProps): ReactNode => {

    const {t} = useTranslation();
    const navigate: NavigateFunction = useNavigate();
    const {outdatedBlocks, wasConnectingRecently} = useContext(EditorContext);
    const open: boolean = Boolean(nodeMenuObject?.anchorPosition);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);

    const blockId: string | undefined = useMemo(() => nodeMenuObject?.data?.temporary ? undefined : nodeMenuObject?.id, [nodeMenuObject?.data?.temporary, nodeMenuObject?.id]);

    const {data: block}: UseQueryResult<BlockDetail, AxiosError> = useQuery(blockQueryOptions(blockId));
    const {data: template}: UseQueryResult<TemplateDetail, AxiosError> = useQuery(templateQueryOptions(block?.templateId));

    return (
        <Fragment>
            <Menu
                id={nodeMenuObject?.id}
                open={open}
                onClose={() => {
                    setNodeMenuObject(undefined)
                }}
                anchorReference="anchorPosition"
                anchorPosition={nodeMenuObject?.anchorPosition ?? {top: 0, left: 0}}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left'
                }}
            >
                <MenuItem
                    disabled={nodeMenuObject?.data?.temporary}
                    onClick={(e): void => {
                        e.stopPropagation();
                        if (wasConnectingRecently.current) return;
                        else navigate(`/configs/blocks/${nodeMenuObject?.id}?workflowId=${nodeMenuObject?.data.workflowId}`);
                    }}
                >
                    {t("action.settings")}
                </MenuItem>
                <MenuItem
                    onClick={() => setDeleteDialogOpen(true)}
                >
                    {t("action.delete")}
                </MenuItem>
                {nodeMenuObject?.onUpdate && nodeMenuObject?.id && outdatedBlocks.find((block) => block.id === nodeMenuObject?.id) &&
                    <MenuItem onClick={() => nodeMenuObject?.onUpdate!(template!, block!)}>{t("action.update")}</MenuItem>
                }
                {nodeMenuObject?.onDuplicate &&
                    <MenuItem onClick={nodeMenuObject?.onDuplicate}>{t("action.duplicate")}</MenuItem>
                }
            </Menu>
            <ConfirmDialog
                dialogTitle={t("dialog.header.confirmDelete")}
                confirmAction={t("action.delete")}
                open={deleteDialogOpen}
                setOpen={setDeleteDialogOpen}
                callback={() => {
                    nodeMenuObject?.onDelete!(nodeMenuObject.id!)
                }}
            />
        </Fragment>
    );
};

export default NodeContextMenu;