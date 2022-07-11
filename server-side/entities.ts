import { AddonDataScheme } from "@pepperi-addons/papi-sdk";

export const CHARTS_TABLE_NAME = 'Charts';
export const CHARTS_PFS_TABLE_NAME = 'ChartsPFS';


export const chartsTableScheme: AddonDataScheme = {
    Name: CHARTS_TABLE_NAME,
    Type: 'data',
    Fields: {
        Key: {
            Type: "String"
        },
        Name: {
            Type: "String"
        },
        Description: {
            Type: "String"
        },
        Type: {
            Type: "String",
            Indexed: true
        },
        System: {
            Type: "Bool"
        }
    },
}

export const chartsPfsScheme = {
    Name: CHARTS_PFS_TABLE_NAME,
    Type: 'pfs',
    Fields: {
        Key: {
            Type: "String"
        },
        Name: {
            Type: "String"
        },
        Description: {
            Type: "String"
        },
        URI: {
            Type: "String"
        }
    }
}




