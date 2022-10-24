
/*
The return object format MUST contain the field 'success':
{success:true}

If the result of your code is 'false' then return:
{success:false, erroeMessage:{the reason why it is false}}
The error Message is importent! it will be written in the audit log and help the user to understand what happen
*/

import { Client, Request } from '@pepperi-addons/debug-server'
import ChartService from './chart-service';
import { chartsPfsScheme, chartsTableScheme, CHARTS_TABLE_NAME, DimxRelations } from './entities';
import { AddonVersion, AddonUUID } from '../addon.config.json'
import semver from 'semver';

export async function install(client: Client, request: Request): Promise<any> {
    const service = new ChartService(client)
    try {
        await service.papiClient.addons.data.schemes.post(chartsTableScheme);
        await service.papiClient.post(`/addons/data/schemes/${AddonUUID}`,chartsPfsScheme);
        await createDIMXRelations(client);
        return { success: true, resultObject: {} }
    }
    catch (err) {
        console.log('Failed to install charts addon', err)
         return handleException(err);
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
    await createDIMXRelations(client);
    await renameSystemCharts(client);
	return { success: true, resultObject: {} }
}

export async function downgrade(client: Client, request: Request): Promise<any> {
    return { success: true, resultObject: {} }
}

function handleException(err) {
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

async function createDIMXRelations(client: Client) {
    const service = new ChartService(client)
    await Promise.all(DimxRelations.map(async (singleRelation) => {
        await service.papiClient.addons.data.relations.upsert(singleRelation);
    }));
}

export async function renameSystemCharts(client: Client) {
    const service = new ChartService(client)
    let systemCharts = await service.find({where: 'System=true'});
    if(systemCharts[0].Key.includes("c2cc9af4d7ad")) {
        console.log("system charts already updated")
    }
    else {
        for(const chartIndex in systemCharts) {
            //deleting old chart, upsert will use the old key because hidden=true
            console.log(systemCharts[chartIndex])
            systemCharts[chartIndex].Hidden = true;
            await service.papiClient.post('/charts',systemCharts[chartIndex]);

            // now it will be saved with the new key, because hidden=false
            systemCharts[chartIndex].Hidden = false;
            await service.papiClient.post('/charts',systemCharts[chartIndex]);
        }
        console.log("system charts successfully updated")
    }
    
}