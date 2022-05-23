import { PapiClient, InstalledAddon, AddonData, FileStorage, Addon } from '@pepperi-addons/papi-sdk'
import { Client, Request } from '@pepperi-addons/debug-server';
import config from '../addon.config.json'
import { chartsTableScheme, CHARTS_TABLE_NAME } from './entities';
import { Chart, ChartTypes } from './models/chart'
import { ChartMap } from './chart-map';
import { v4 as uuid } from 'uuid';
import { Constants } from './constants';

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

        const adal = this.papiClient.addons.data.uuid(config.AddonUUID).table(CHARTS_TABLE_NAME);

        const body = request.body;
        this.validatePostData(request);
        await this.validateName(body,adal);

        //const chartFile = await this.upsertChartFile(body);
        const chartFile = await this.upsertChartToPFS(body);


        body.ReadOnly = body.ReadOnly ?? false;
        //body.FileID = body.FileID ? body.FileID : chartFile.InternalID;
        body.ScriptURI = chartFile.URL;

        if (!body.Key){
            body.Key = uuid()
        }

        const chart = await adal.upsert(body);
        return ChartMap.toDTO(<Chart>chart);

    }

    async find(query: any) {

        const adal = this.papiClient.addons.data.uuid(config.AddonUUID).table(CHARTS_TABLE_NAME);

        if (query.key) {
            const chart = await adal.key(query.key).get();
            return ChartMap.toDTO(<Chart>chart);
        }
        else {
            const charts = await adal.find(query);
            return charts.map(chart => ChartMap.toDTO(<Chart>chart))
        }
    }

    private async upsertChartFile(body) {

        try {
            const fileStorage: FileStorage = {
                FileName: `${body.Name}.js`,
                Title: body.Name,
                IsSync:false
            }
            if (body.FileID) {
                fileStorage.InternalID = body.FileID;
            }
            if (body.Hidden){
                fileStorage.Hidden = true;
            }       
            else{
                if (this.isDataURL(body.ScriptURI)) {
                    fileStorage.Content = body.ScriptURI.match(Constants.DataURLRegex)[4];
                }
                else {
                    fileStorage.URL = body.ScriptURI
                }
            }     
            return await this.papiClient.fileStorage.upsert(fileStorage)
            let chart
        }
        catch (e) {
            throw new Error(`Failed upsert file storage. error: ${e}`);
        }
    }

    private async upsertChartToPFS(body) {

        try {
            const file: any = {
                Key: `${body.Name}.js`,
                Description: body.Description,
                MIME: "text/javascript",
                Cache: false
            }

            if (body.Hidden){
                file.Hidden = true;
            }       
            else{
                file.URI = body.ScriptURI
            }
            return await this.papiClient.post(`/addons/files/${this.client.AddonUUID}`,file);
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

    async validateName(body: any, adal: any) {
        const existingName = await adal.find({where:`Name='${body.Name}'`});
        if (existingName.length >0 && existingName[0].Key!=body.Key){
            throw new Error(`A chart with this name already exist.`);
        }
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
}

export default ChartService;
