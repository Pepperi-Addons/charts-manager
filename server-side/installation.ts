
/*
The return object format MUST contain the field 'success':
{success:true}

If the result of your code is 'false' then return:
{success:false, erroeMessage:{the reason why it is false}}
The error Message is importent! it will be written in the audit log and help the user to understand what happen
*/

import { Client, Request } from '@pepperi-addons/debug-server'
import { charts } from './meta-data';
import ChartService from './chart-service';
import { chartsTableScheme } from './entities';
import config from '../addon.config.json'

export async function install(client: Client, request: Request): Promise<any> {
    const service = new ChartService(client)
    try {

        await service.papiClient.addons.data.schemes.post(chartsTableScheme);
        await upsertCharts(service.papiClient, charts);

        return { success: true, resultObject: {} }

    }
    catch (err) {
        return {
            success: false,
            errorMessage:  ('message' in err) ? 'Got error ' + err.message : 'Unknown error occured.',
        }
    }
}

export async function uninstall(client: Client, request: Request): Promise<any> {
    return { success: true, resultObject: {} }
}

export async function upgrade(client: Client, request: Request): Promise<any> {
    return { success: true, resultObject: {} }
}

export async function downgrade(client: Client, request: Request): Promise<any> {
    return { success: true, resultObject: {} }
}


async function upsertCharts(papiClient, charts) {
    try {
        var uuid = require('uuid');
        for (let chart of charts) {
            chart.Key = uuid.v1();
            await papiClient.addons.data.uuid(config.AddonUUID).table(chartsTableScheme.Name).upsert(chart);
        }
        return {
            success: true,
            errorMessage: ""
        }
    }
    catch (err) {
        throw new Error(('message' in err) ? err.message : 'Unknown Error Occured');
        
    }
}
