import { PapiClient, InstalledAddon, AddonData, FileStorage, Addon } from '@pepperi-addons/papi-sdk'
import { Client, Request } from '@pepperi-addons/debug-server';
import config from '../addon.config.json'
import { chartsTableScheme } from './entities';
import { Chart, ChartType, ChartTypes } from './models/chart'
import { ChartMap } from './chart-map';

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
        await this.validatePostData(client, request);
        const chart = await this.getChart(body['Name']);
        const chartFile = await this.upsertChartFileStorage(body, chart);

        body['ReadOnly'] = (body.ReadOnly || !body.ReadOnly) ? body.ReadOnly : false;
        body['FileID'] = chartFile.InternalID;
        body['ScriptURL'] = chartFile.URL;
        if (!chart) {
            body['Key'] = body['Name'];
        }

        await this.papiClient.addons.data.uuid(config.AddonUUID).table(chartsTableScheme.Name).upsert(body);
        return this.find({ key: body['Key'] });

    }

    async find(query: any) {
        if (query.key != null) {
            const chart = await this.papiClient.addons.data.uuid(config.AddonUUID).table(chartsTableScheme.Name).key(query.key).get();
            return ChartMap.toDTO(<Chart>chart);
        }
        else {
            const charts = await this.papiClient.addons.data.uuid(config.AddonUUID).table(chartsTableScheme.Name).find(query);
            return charts.map(chart => ChartMap.toDTO(<Chart>chart))
        }
    }


    private async upsertChartFileStorage(body, chart) {
        try {
            const fileStorage: FileStorage = {
                FileName: body.Name,
                Title: body.Name,
                URL: body.ScriptURL,
            }
            let chart;

            if (chart && chart['FileID']) {
                if (chart['URL'] === body.ScriptURL)
                    fileStorage.InternalID = chart['FileID'];
            }
            return await this.papiClient.fileStorage.upsert(fileStorage)
        }
        catch (e) {
            throw new Error(`Failed upsert file storage. error: ${e.message}`);
        }

    }
    private async validatePostData(client: Client, request: Request) {
        const body = request.body;
        //const ownerUUID = (request.header['X-Pepperi-OwnerID'] == null ? null : request.header['X-Pepperi-OwnerID'].toLowerCase());
        this.validateParam(body, 'Name');
        this.validateParam(body, 'Type');
        this.validateParam(body, 'ScriptURL');
        this.validateTypeParams(body);
    }

    private async getChart(key: string) {
        try {
            const chart = await this.papiClient.addons.data.uuid(config.AddonUUID).table(chartsTableScheme.Name).key(key).get();
            return chart;
        }
        catch (e) {
            return undefined;
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
}


export default ChartService;
