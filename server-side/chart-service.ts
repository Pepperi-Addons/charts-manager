import { PapiClient } from '@pepperi-addons/papi-sdk'
import { Client, Request } from '@pepperi-addons/debug-server';
import config from '../addon.config.json'
import { CHARTS_PFS_TABLE_NAME, CHARTS_TABLE_NAME } from './entities';
import { ChartTypes } from './models/chart'
import { Constants } from './constants';
import { Schema, validate, Validator } from 'jsonschema';


class ChartService {
    papiClient: PapiClient

    constructor(private client: Client) {
        this.papiClient = new PapiClient({
            baseURL: client.BaseURL,
            token: client.OAuthAccessToken,
            actionUUID: client.ActionUUID,
            addonSecretKey: client.AddonSecretKey,
            addonUUID: client.AddonUUID
        });
    }

    async upsert(request: Request) {

        const chartsTable = this.papiClient.addons.data.uuid(config.AddonUUID).table(CHARTS_TABLE_NAME);
        const chartsPfsTable = this.papiClient.addons.pfs.uuid(config.AddonUUID).schema(CHARTS_PFS_TABLE_NAME);
        const body = request.body;

        //system charts keys will contain the addon uuid suffix
        body.Key = body.System ? `${body.Name}_c2cc9af4d7ad.js` : `${body.Name}.js`; 
        this.validatePostData(request);

        const pfsChart = await this.upsertChartToPFS(body);
        const metaDataFields = {
            Key: body.Key,
            Name: body.Name,
            Description: body.Description,
            Type: body.Type,
            ScriptURI: pfsChart.URL,
            System: body.System ?? false,
            Hidden: body.Hidden ?? false
        }
        const chart = await chartsTable.upsert(metaDataFields);
        return chart;
    }

    async find(query: any) {
        const metaDataTable = this.papiClient.addons.data.uuid(config.AddonUUID).table(CHARTS_TABLE_NAME);
        if (query.key) {
            const chartMetaData = await metaDataTable.key(query.key).get();
            return chartMetaData;
        }
        else {
            const chartMetaDatas = await metaDataTable.find(query);
            return chartMetaDatas;
        }
    }

    private async upsertChartToPFS(body) {
        try {
            let file: any = {
                Key: body.Key,
                Name: body.Name,
                Description: body.Description,
                MIME: "text/javascript",
                URI: body.ScriptURI,
                Cache: false
            }

            if (body.Hidden){
                file.Hidden = true;
            }
        
            return await this.papiClient.post(`/addons/pfs/${this.client.AddonUUID}/${CHARTS_PFS_TABLE_NAME}`,file);
        }
        catch (e) {
            throw new Error(`Failed upsert file storage. error: ${e}`);
        }
    }

    private validatePostData(request: Request) {
        const body = request.body;
        this.validateParam(body, 'Name');
        this.validateParam(body, 'ScriptURI');
       
    }

    validateParam(obj: any, paramName: string) {
        if (obj[paramName] == null) {
            throw new Error(`${paramName} is a required field`);
        }
    }

    validateTypeParams(body: any) {
        if (ChartTypes.indexOf(body['Type']) == -1) {
            throw new Error(`${body['Type']} is not supported type`);
        }
    }

    isDataURL(s) {
        return !!s.match(Constants.DataURLRegex);
    }

    //DIMX
    // for the AddonRelativeURL of the relation
    async importDataSource(body) {
        console.log(`@@@@importing chart: ${JSON.stringify(body)}@@@@`);
        body.DIMXObjects = await Promise.all(body.DIMXObjects.map(async (item) => {
            const validator = new Validator();
            const validSchema: Schema = {
                properties: {
                    Key: {
                        type: "string",
                        required: true
                    },
                    Name: {
                        type: "string",
                        required: true
                    },
                    Type: {
                        type: "string",
                        required: true
                    },
                    System: {
                        type: "boolean"
                    },
                    ScriptURI: {
                        type: "string"
                    }
                }
            }
            const validationResult = validator.validate(item.Object, validSchema);
            if (!validationResult.valid) {
                const errors = validationResult.errors.map(error => error.stack.replace("instance.", ""));
                item.Status = 'Error';
                item.Details = `chart validation failed.\n ${errors.join("\n")}`;
            }
            return item;
        }));
        console.log('returned object is:', JSON.stringify(body));
        return body;
    }

    async exportDataSource(body) { 
        console.log("exporting data")
        return body;
    }
}

export default ChartService;
