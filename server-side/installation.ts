
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
import { v4 as uuid } from 'uuid';

export async function install(client: Client, request: Request): Promise<any> {
    const res={
        success: true,
        errorMessage: '',
    }
    const service = new ChartService(client)
    try {

        const resFromAdal = await service.papiClient.addons.data.schemes.post(chartsTableScheme);
        await upsertCharts(client,request, service, charts);

        return res;

    }
    catch (err) {   
        console.log('Failed to install charts addon', err)
         return handleException(err);
    }
}

export async function uninstall(client: Client, request: Request): Promise<any> {
    try{
        const service = new ChartService(client)
        await service.papiClient.post(`/addons/data/schemes/${chartsTableScheme.Name}/purge`);
        return { success: true, resultObject: {} }
    }
    catch(err){
        console.log('Failed to uninstall charts addon', err)
        return handleException(err);

    }
}

export async function upgrade(client: Client, request: Request): Promise<any> {
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

async function upsertCharts(client: Client, request: Request,service, charts) {
    try {
       
        for (let chart of charts) {
            chart.Key = uuid();
            chart.ScriptURI = `${client.AssetsBaseUrl}/assets/ChartsTemplates/${chart.Name.toLowerCase()}.js`
            console.log(`chart ScriptURI: ${chart.ScriptURI}`)
            await service.upsert({ body: chart });
            
        }
        return {
            success: true,
            errorMessage: ""
        }
    }
    catch (err) {
        console.log('Failed to upsert charts templates files',err)
        throw new Error('Failed to upsert charts templates files');

    }
}
