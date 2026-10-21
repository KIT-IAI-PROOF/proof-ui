import type {Edge} from "@xyflow/react";
import type {ConnectionDetail as REdge} from "@webis/proof-config-manager-client";
import {ControlPointData} from "../pages/editor/components/ControlPoint.tsx";

type Without<T, K> = Pick<T, Exclude<keyof T, K>>;

export type TEdge = Edge<Without<REdge, "points"> & { points: ControlPointData[] }>;