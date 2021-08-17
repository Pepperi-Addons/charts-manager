import { AddonData } from "@pepperi-addons/papi-sdk";

export interface Chart extends AddonData{
    Name: string;
    ScriptURL: string;
    ReadOnly?: Boolean;
    Description?: string;
    Type: ChartType;
    FileID?: number;
    Hidden?: boolean;
    CreationDateTime?: string;
    ModificationDateTime?: string;
    Key?: string;
    [key: string]: any;
}

export interface ChartDTO {
    Name: string;
    ScriptURL: string;
    ReadOnly?: Boolean;
    Description?: string;
    Type: ChartType;
    Hidden?: boolean;
    CreationDateTime?: string;
    ModificationDateTime?: string;
}
export declare const ChartTypes: readonly ["Single", "Gauge", "MultiSeries"];
export declare type ChartType = typeof ChartTypes[number];
