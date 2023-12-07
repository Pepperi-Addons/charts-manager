import { AddonDataScheme, Relation } from "@pepperi-addons/papi-sdk";
import config from '../addon.config.json';

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
        },
        ScriptURI: {
            Type: "String"
        },
    },
}

export const chartsPfsScheme = {
    Name: CHARTS_PFS_TABLE_NAME,
    Type: 'pfs'
}

export const DimxRelations: Relation[] = [{
    AddonUUID: config.AddonUUID,
    Name: 'Charts',
    RelationName: 'DataImportResource',
    Type: 'AddonAPI',
    Description: 'relation for importing charts to charts manager',
    AddonRelativeURL: '/api/import_data_source'
},
{
    AddonUUID: config.AddonUUID,
    Name: 'Charts',
    RelationName: 'DataExportResource',
    Type: 'AddonAPI',
    Description: 'relation for exporting charts from charts manager',
    AddonRelativeURL: '/api/export_data_source'
}]


