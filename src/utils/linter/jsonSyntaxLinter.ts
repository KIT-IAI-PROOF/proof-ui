import {Extension} from "@uiw/react-codemirror";
import {Diagnostic, linter} from "@codemirror/lint";
import {EditorView} from "@codemirror/view";
import {TFunction} from "i18next";
import {InputDetailTypeEnum} from "@webis/proof-config-manager-client";

const getJsonType = (data: any): string => {
    if (Array.isArray(data)) {
        const first = data[0];
        if (typeof first === "string") return InputDetailTypeEnum.StringArray
        if (typeof first === "number") return data.every(num => Number.isInteger(num)) ? InputDetailTypeEnum.IntegerArray : InputDetailTypeEnum.FloatArray;
        if (first !== null && typeof first === "object") return InputDetailTypeEnum.ObjectArray;
    }
    if (data !== null && typeof data === "object") {
        return InputDetailTypeEnum.Object
    }
    return typeof data;
};

export const jsonSyntaxLinter: (t: TFunction<"translation", undefined>, requiredType?: string | undefined) => (
    { extension: Extension } | readonly Extension[]) = (t: TFunction<"translation", undefined>, requiredType?: string | undefined):
    { extension: Extension } | readonly Extension[] => linter((view: EditorView): Diagnostic[] => {
    const diagnostics: Diagnostic[] = [];
    if (view.state.doc.toString() != "") {
        try {
            const value = JSON.parse(view.state.doc.toString())
            if (requiredType) {
                const type = getJsonType(value);
                if (type !== requiredType) {
                    diagnostics.push({
                        from: 0,
                        to: view.state.doc.length,
                        severity: "error",
                        message: `${t("JSON_TYPE_ERROR")} ${requiredType} != ${type}`
                    });
                }
            }
        } catch (error) {
            if (error instanceof SyntaxError) {
                const message: string = error.message;
                const match: RegExpExecArray | null = /position (\d+)/.exec(message)
                if (match) {
                    const position: number = parseInt(match[1], 10)
                    diagnostics.push({
                        from: position - 1,
                        to: position,
                        severity: "error",
                        message: message
                    });
                } else {
                    diagnostics.push({
                        from: 0,
                        to: view.state.doc.length,
                        severity: "error",
                        message: `${t("JSON_PARSING_ERROR")}`
                    });
                }
            }
        }
    }
    return diagnostics;
});