import { AddonDataScheme } from "@pepperi-addons/papi-sdk";

export const chartsTableScheme: AddonDataScheme = {
    Name: 'Charts',
    Type: 'indexed_data',
    Fields: {
        Name: {
            Type: "String"
        },
        Description: {
            Type: "String"
        },
        Type: {
            Type: "String",
        },
        URL: {
            Type: "String",
        },
        FileID: {
            Type: "Integer",
        },
    },
}




