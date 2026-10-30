import {Modifier} from "@dnd-kit/core";
import {Transform} from "@dnd-kit/utilities";

export const restrictToViewport: Modifier = ({transform, activeNodeRect}): Transform => {
    if (!activeNodeRect) return transform;
    const minVisible = 60;
    const minX: number = -activeNodeRect.left;
    const maxX: number = window.innerWidth - activeNodeRect.left - minVisible;
    const minY: number = -activeNodeRect.top;
    const maxY: number = window.innerHeight - activeNodeRect.top - minVisible;
    return {
        ...transform,
        x: Math.min(Math.max(transform.x, minX), maxX),
        y: Math.min(Math.max(transform.y, minY), maxY),
    };
};