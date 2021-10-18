import { AddonDataScheme } from "@pepperi-addons/papi-sdk";

export const CHARTS_TABLE_NAME = 'Charts';

export const chartsTableScheme: AddonDataScheme = {
    Name: CHARTS_TABLE_NAME,
    Type: 'data',
    Fields: {
        Name: {
            Type: "String"
        },
        Description: {
            Type: "String"
        },
        URI: {
            Type: "String",
        },
        FileID: {
            Type: "Integer",
        },
    },
}




