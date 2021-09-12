import { PapiClient, InstalledAddon, AddonData, FileStorage, Addon } from '@pepperi-addons/papi-sdk'
import { Client, Request } from '@pepperi-addons/debug-server';
import config from '../addon.config.json'
import { chartsTableScheme } from './entities';
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

    async upsert(client: Client, request: Request) {

        const body = request.body;
        await this.validatePostData(request);

        const chartFile = await this.upsertChartFile(body);

        body.ReadOnly = body.ReadOnly ?? false;
        body.FileID = chartFile.InternalID;
        body.ScriptURI = chartFile.URL;

        if (!body.Key){
            body.Key = uuid()
        }

        const chart = await this.papiClient.addons.data.uuid(config.AddonUUID).table(chartsTableScheme.Name).upsert(body);
        return ChartMap.toDTO(<Chart>chart);

    }

    async find(query: any) {

        const adal = this.papiClient.addons.data.uuid(config.AddonUUID).table(chartsTableScheme.Name);

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
                FileName: body.Name,
                Title: body.Name,
            }

            if (this.isDataURL(body.ScriptURI)) {
                fileStorage.Content = body.ScriptURI.match(Constants.DataURLRegex)[4];
            }
            else {
                fileStorage.URL = body.ScriptURI
            }

            if (body.FileID) {
                fileStorage.InternalID = body.FileID;
            }

            return await this.papiClient.fileStorage.upsert(fileStorage)
        }
        catch (e) {
            throw new Error(`Failed upsert file storage. error: ${e}`);
        }
    }

    private async validatePostData(request: Request) {
        const body = request.body;
        this.validateParam(body, 'Name');
        this.validateParam(body, 'Type');
        this.validateParam(body, 'ScriptURI');
        this.validateTypeParams(body);
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
