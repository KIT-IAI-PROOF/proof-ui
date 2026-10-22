import {IPalette} from "../model/IPalette.ts";
import {InputDetailTypeEnum, TemplateDetailBlockTypeEnum} from "@kit-iai-proof/proof-config-manager-client";

export const DEFAULT_PALETTE: IPalette[] = [
    {
        "hex": "#0D41E1"
    },
    {
        "hex": "#0C63E7"
    },
    {
        "hex": "#0A85ED"
    },
    {
        "hex": "#09A6F3"
    },
    {
        "hex": "#07C8F9"
    }
];

export const getTypeColor: (type: string | undefined, palette: IPalette[]) => string = (type: string | undefined, palette: IPalette[]): string => {
    switch (type) {
        case InputDetailTypeEnum.FileName:
            return palette[0].hex;
        case InputDetailTypeEnum.Integer:
            return palette[1].hex;
        case InputDetailTypeEnum.IntegerArray:
            return palette[1].hex;
        case InputDetailTypeEnum.Float:
            return palette[2].hex;
        case InputDetailTypeEnum.FloatArray:
            return palette[2].hex;
        case InputDetailTypeEnum.Object:
            return palette[3].hex;
        case InputDetailTypeEnum.ObjectArray:
            return palette[3].hex;
        case InputDetailTypeEnum.String:
            return palette[4].hex;
        case InputDetailTypeEnum.StringArray:
            return palette[4].hex;
        default:
            return "#000";
    }
}

export const getTypeBorder: (type: string | undefined, palette: IPalette[]) => string = (type: string | undefined, palette: IPalette[]): string => {
    switch (type) {
        case InputDetailTypeEnum.StringArray:
            return "1px dotted " + palette[0].hex;
        case InputDetailTypeEnum.ObjectArray:
            return "1px dotted " + palette[0].hex;
        case InputDetailTypeEnum.FloatArray:
            return "1px dotted " + palette[0].hex;
        case InputDetailTypeEnum.IntegerArray:
            return "1px dotted " + palette[0].hex;
        default:
            return "none"
    }

}

export const getBlockColor: (type: (TemplateDetailBlockTypeEnum | undefined), palette: IPalette[]) => string = (type: TemplateDetailBlockTypeEnum | undefined, palette: IPalette[]): string => {
    switch (type) {
        case TemplateDetailBlockTypeEnum.Base:
            return palette[0].hex;
        case TemplateDetailBlockTypeEnum.Specific:
            return palette[1].hex;
        case TemplateDetailBlockTypeEnum.Helper:
            return palette[2].hex;
        case TemplateDetailBlockTypeEnum.Userdefined:
            return palette[3].hex;
        default:
            return "#000";
    }
}