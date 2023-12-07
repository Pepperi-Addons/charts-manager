
/*
The return object format MUST contain the field 'success':
{success:true}

If the result of your code is 'false' then return:
{success:false, erroeMessage:{the reason why it is false}}
The error Message is importent! it will be written in the audit log and help the user to understand what happen
*/

import { Client, Request } from '@pepperi-addons/debug-server'
import ChartService from './chart-service';
import { chartsPfsScheme, chartsTableScheme, DimxRelations } from './entities';
import { AddonUUID } from '../addon.config.json'
import semver from 'semver';
import { AddonData } from '@pepperi-addons/papi-sdk';

export async function install(client: Client, request: Request): Promise<any> {
    const service = new ChartService(client)
    try {
        await service.papiClient.addons.data.schemes.post(chartsTableScheme);
        await service.papiClient.post(`/addons/data/schemes/${AddonUUID}`, chartsPfsScheme);
        await create_dimx_relations(client);
        return { success: true, resultObject: {} }
    }
    catch (err) {
        console.log('Failed to install charts addon', err)
         return handle_exception(err);
    }
}

export async function uninstall(client: Client, request: Request): Promise<any> {
    return { success: true, resultObject: {} }
}

export async function upgrade(client: Client, request: Request): Promise<any> {
    if (request.body.FromVersion && semver.compare(request.body.FromVersion, '1.0.2') < 0)
	{
		throw new Error('Upgarding from versions earlier than 1.0.2 is not supported. Please uninstall the addon and install it again.');
	}


	if (request.body.FromVersion && semver.compare(request.body.FromVersion, '1.2.4') < 0)
	{
		await create_dimx_relations(client);
		await rename_system_charts(client);
		await set_cache_on_all_charts(client);
	}

	return { success: true, resultObject: {} }
}

export async function downgrade(client: Client, request: Request): Promise<any> {
    return { success: true, resultObject: {} }
}

function handle_exception(err) {
    let errorMessage = 'Unknown Error Occured';
    if (err instanceof Error) {
        errorMessage = err.message;
    }
    return {
        success: false,
        errorMessage: errorMessage,
        resultObject: {}
    };
}

async function create_dimx_relations(client: Client) {
    const service = new ChartService(client)
    await Promise.all(DimxRelations.map(async (singleRelation) => {
        await service.papiClient.addons.data.relations.upsert(singleRelation);
    }));
}

async function rename_system_charts(client: Client) {
    const service = new ChartService(client)
    const systemCharts = await service.find({where: 'System=true'});
    if (systemCharts[0].Key.includes("c2cc9af4d7ad")) {
        console.log("system charts already updated");
    }
    else {
        for (const chart of (systemCharts as AddonData[])) {
            console.log(`RENAMING CHART KEY: ${chart.Key}`);
            const oldKey = chart.Key;

            // chart will be saved with the new key, because hidden=false
            chart.Hidden = false;
            await service.upsert(chart);

            // deleting old chart, upsert will use the old key because hidden=true
            chart.Key = oldKey;
            chart.Hidden = true;
            await service.upsert(chart);
        }
        console.log("system charts successfully updated")
    }

}

async function set_cache_on_all_charts(client: Client) {
    const service = new ChartService(client)
    const charts = await service.find({});
	const responses = await Promise.all(charts.map(async (chart) => {
		// the updated upsert function will set the cache as true
		service.upsert(chart);
	}));
	return responses;
}
