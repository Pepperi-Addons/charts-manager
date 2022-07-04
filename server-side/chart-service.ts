import { PapiClient, InstalledAddon, AddonData, FileStorage, Addon } from '@pepperi-addons/papi-sdk'
import { Client, Request } from '@pepperi-addons/debug-server';
import config from '../addon.config.json'
import { chartsTableScheme, CHARTS_PFS_TABLE_NAME, CHARTS_TABLE_NAME } from './entities';
import { Chart, ChartDTO, ChartTypes } from './models/chart'
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

        const chartsTable = this.papiClient.addons.data.uuid(config.AddonUUID).table(CHARTS_TABLE_NAME);
        const chartsPfsTable = this.papiClient.addons.pfs.uuid(config.AddonUUID).schema(CHARTS_PFS_TABLE_NAME);


        const body = request.body;
        body.Key = `${body.Name}.js`
        this.validatePostData(request);
        await this.validateName(body,chartsPfsTable);

        const pfsChart = await this.upsertChartToPFS(body);
        const metaDataFields = {
            Key: body.Key,
            Type: body.Type,
            System: body.System ?? false,
            Hidden: body.Hidden ?? false
        }
        const chart = await chartsTable.upsert(metaDataFields);
        return ChartMap.toDTO(pfsChart,chart);
    }

    async find(query: any) {
        const metaDataTable = this.papiClient.addons.data.uuid(config.AddonUUID).table(CHARTS_TABLE_NAME);
        const pfsTable = this.papiClient.addons.pfs.uuid(config.AddonUUID).schema(CHARTS_PFS_TABLE_NAME);

        if (query.key) {
            const chartMetaData = await metaDataTable.key(query.key).get();
            const chartPfsObject = await pfsTable.key(query.key).get();
            return ChartMap.toDTO(chartPfsObject,chartMetaData);
        }
        else {
            const chartMetaDatas = await metaDataTable.find(query);
            let charts: ChartDTO[] = [];
            for (let chart of chartMetaDatas) {
                const pfsChart = await pfsTable.key(chart.Key ?? '').get();
                charts.push(ChartMap.toDTO(pfsChart,chart))
            }
            return charts
        }
    }

    private async upsertChartToPFS(body) {
        try {
            let file: any = {
                Key: `${body.Name}.js`,
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

    async validateName(body: any, table: any) {
        const existingName = await table.find({where:`Name='${body.Name}'`});
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
