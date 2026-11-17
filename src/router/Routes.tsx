import SettingsIcon from "@mui/icons-material/Settings";
import Settings from "../pages/settings/Settings.tsx";
import HouseIcon from "@mui/icons-material/House";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import AccountTreeRoundedIcon from "@mui/icons-material/AccountTreeRounded";
import {TFunction} from "i18next";
import {Frame as EFrame} from "../pages/editor/Editor.frame.tsx";
import {Frame as MFrame} from "../pages/monitoring/Monitoring.frame.tsx";
import {Frame as CFrame} from "../pages/configs/Configs.frame.tsx";
import {IRoute} from "../model/IRoute.ts";
import MonitoringDetail from "../pages/monitoring/MonitoringDetail.tsx";
import Monitoring from "../pages/monitoring/Monitoring.tsx";
import MonitoringStart from "../pages/monitoring/MonitoringStart.tsx";
import {Fragment} from "react";
import Configs from "../pages/configs/Configs.tsx";
import WorkflowConfigs from "../pages/configs/workflow/WorkflowConfigs.tsx";
import WorkflowConfigsDetail from "../pages/configs/workflow/WorkflowConfigsDetail.tsx";
import {EditNoteRounded} from "@mui/icons-material";
import TemplateConfigsDetail from "../pages/configs/template/TemplateConfigsDetail.tsx";
import TemplateConfigs from "../pages/configs/template/TemplateConfigs.tsx";
import BlockConfigs from "../pages/configs/block/BlockConfigs.tsx";
import BlockConfigsDetail from "../pages/configs/block/BlockConfigsDetail.tsx";
import ProgramConfigs from "../pages/configs/program/ProgramConfigs.tsx";
import ProgramConfigsDetail from "../pages/configs/program/ProgramConfigsDetail.tsx";
import AttachmentConfigs from "../pages/configs/attachment/AttachmentConfigs.tsx";
import AttachmentConfigsDetail from "../pages/configs/attachment/AttachmentConfigsDetail.tsx";

export const getRoutes: (t: TFunction) => IRoute[] = (t: TFunction): IRoute[] => {

    return [
        {
            name: t("page.header.start"),
            displayPath: "/",
            routingPath: "/",
            description: t("page.description.start"),
            element: undefined,
            icon: <HouseIcon/>,
            index: false,
            menu: {
                1: false,
                2: false
            },
            children: []
        },
        {
            name: t("page.header.editor"),
            displayPath: "/editor",
            routingPath: "/editor/:workflowId?",
            description: t("page.description.editor"),
            element: <EFrame/>,
            icon: <AccountTreeRoundedIcon color={"primary"}/>,
            index: false,
            menu: {
                1: true,
                2: true
            },
            children: []
        },
        {
            name: t("page.header.monitoring.index"),
            displayPath: "/monitoring",
            routingPath: "/monitoring",
            description: t("page.description.monitoring"),
            element: <MFrame/>,
            icon: <MonitorHeartIcon color={"primary"}/>,
            index: false,
            menu: {
                1: true,
                2: true
            },
            children: [
                {
                    index: true,
                    name: t("page.header.monitoring.root"),
                    displayPath: "/monitoring",
                    routingPath: "/monitoring",
                    description: "",
                    element: <Monitoring/>,
                    icon: <Fragment/>,
                    menu: {
                        1: true,
                        2: true
                    },
                    children: []
                },
                {
                    index: false,
                    name: t("page.header.monitoring.detail"),
                    displayPath: "/monitoring",
                    routingPath: "/monitoring/:executionId",
                    description: "",
                    element: <MonitoringDetail/>,
                    icon: <Fragment/>,
                    menu: {
                        1: true,
                        2: true
                    },
                    children: []
                },
                {
                    index: false,
                    name: t("page.header.monitoring.start"),
                    displayPath: "/monitoring",
                    routingPath: "/monitoring/execution/:workflowId?",
                    description: "",
                    element: <MonitoringStart/>,
                    icon: <Fragment/>,
                    menu: {
                        1: true,
                        2: true
                    },
                    children: []
                }
            ]
        },
        {
            name: t("page.header.configs.index"),
            displayPath: "/configs",
            routingPath: "/configs",
            description: t("page.description.configs"),
            element: <CFrame/>,
            icon: <EditNoteRounded color={"primary"}/>,
            index: false,
            menu: {
                1: true,
                2: true
            },
            children: [
                {
                    index: true,
                    name: t("page.header.configs.root"),
                    displayPath: "/configs",
                    routingPath: "/configs",
                    description: "",
                    element: <Configs/>,
                    icon: <EditNoteRounded color={"primary"}/>,
                    menu: {
                        1: true,
                        2: true
                    },
                    children: []
                },
                {
                    index: false,
                    name: t("page.header.configs.workflows"),
                    displayPath: "/configs/workflows",
                    routingPath: "/configs/workflows/",
                    description: "",
                    element: <WorkflowConfigs/>,
                    icon: <EditNoteRounded color={"primary"}/>,
                    menu: {
                        1: false,
                        2: false
                    },
                    children: []
                },
                {
                    index: false,
                    name: t("page.header.configs.workflow"),
                    displayPath: "/configs/workflows",
                    routingPath: "/configs/workflows/:workflowId",
                    description: "",
                    element: <WorkflowConfigsDetail/>,
                    icon: <EditNoteRounded color={"primary"}/>,
                    menu: {
                        1: true,
                        2: true
                    },
                    children: []
                },
                {
                    index: false,
                    name: t("page.header.configs.blocks"),
                    displayPath: "/configs/blocks",
                    routingPath: "/configs/blocks",
                    description: "",
                    element: <BlockConfigs/>,
                    icon: <EditNoteRounded color="primary"/>,
                    menu: {
                        1: false,
                        2: false
                    },
                    children: []
                },
                {
                    index: false,
                    name: t("page.header.configs.block"),
                    displayPath: "/configs/blocks",
                    routingPath: "/configs/blocks/:blockId",
                    description: "",
                    element: <BlockConfigsDetail/>,
                    icon: <EditNoteRounded color="primary"/>,
                    menu: {
                        1: false,
                        2: false
                    },
                    children: []
                },
                {
                    index: false,
                    name: t("page.header.configs.templates"),
                    displayPath: "/configs/templates",
                    routingPath: "/configs/templates",
                    description: "",
                    element: <TemplateConfigs/>,
                    icon: <EditNoteRounded color="primary"/>,
                    menu: {
                        1: true,
                        2: true
                    },
                    children: []
                },
                {
                    index: false,
                    name: t("page.header.configs.template"),
                    displayPath: "/configs/templates",
                    routingPath: "/configs/templates/:templateId",
                    description: "",
                    element: <TemplateConfigsDetail/>,
                    icon: <EditNoteRounded color="primary"/>,
                    menu: {
                        1: false,
                        2: false
                    },
                    children: []
                },
                {
                    index: false,
                    name: t("page.header.config.createTemplate"),
                    displayPath: "/configs/templates/create",
                    routingPath: "/configs/templates/create",
                    description: "",
                    element: <TemplateConfigsDetail/>,
                    icon: <EditNoteRounded color={"primary"}/>,
                    menu: {
                        1: false,
                        2: false
                    },
                    children: []
                },
                {
                    index: false,
                    name: t("page.header.configs.programs"),
                    displayPath: "/configs/programs",
                    routingPath: "/configs/programs",
                    description: "",
                    element: <ProgramConfigs/>,
                    icon: <EditNoteRounded color={"primary"}/>,
                    menu: {
                        1: true,
                        2: true,
                    },
                    children: []
                },
                {
                    index: false,
                    name: t("page.header.configs.program"),
                    displayPath: "/configs/programs",
                    routingPath: "/configs/programs/:programId",
                    description: "",
                    element: <ProgramConfigsDetail/>,
                    icon: <EditNoteRounded color={"primary"}/>,
                    menu: {
                        1: false,
                        2: false
                    },
                    children: []
                },
                {
                    index: false,
                    name: t("page.header.configs.createProgram"),
                    displayPath: "/configs/programs/create",
                    routingPath: "/configs/programs/create",
                    description: "",
                    element: <ProgramConfigsDetail/>,
                    icon: <EditNoteRounded color={"primary"}/>,
                    menu: {
                        1: false,
                        2: false
                    },
                    children: []
                },
                {
                    index: false,
                    name: t("page.header.configs.attachments"),
                    displayPath: "/configs/attachments",
                    routingPath: "/configs/attachments",
                    description: "",
                    element: <AttachmentConfigs/>,
                    icon: <EditNoteRounded color={"primary"}/>,
                    menu: {
                        1: true,
                        2: true,
                    },
                    children: []
                },
                {
                    index: false,
                    name: t("page.header.configs.attachment"),
                    displayPath: "/configs/attachments",
                    routingPath: "/configs/attachments/:attachmentId",
                    description: "",
                    element: <AttachmentConfigsDetail/>,
                    icon: <EditNoteRounded color={"primary"}/>,
                    menu: {
                        1: false,
                        2: false
                    },
                    children: []
                },
                {
                    index: false,
                    name: t("page.header.configs.createAttachment"),
                    displayPath: "/configs/attachments/create",
                    routingPath: "/configs/attachments/create",
                    description: "",
                    element: <AttachmentConfigsDetail/>,
                    icon: <EditNoteRounded color={"primary"}/>,
                    menu: {
                        1: false,
                        2: false
                    },
                    children: []
                },
            ]
        },
        {
            name: t("page.header.settings"),
            displayPath: "/settings",
            routingPath: "/settings",
            description: t("page.description.settings"),
            element: <Settings/>,
            icon: <SettingsIcon/>,
            index: false,
            menu: {
                1: false,
                2: false
            },
            children: []
        }
    ];
};