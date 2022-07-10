
/*
The return object format MUST contain the field 'success':
{success:true}

If the result of your code is 'false' then return:
{success:false, erroeMessage:{the reason why it is false}}
The error Message is importent! it will be written in the audit log and help the user to understand what happen
*/

import { Client, Request } from '@pepperi-addons/debug-server'
import ChartService from './chart-service';
import { chartsPfsScheme, chartsTableScheme, CHARTS_TABLE_NAME } from './entities';
import { AddonVersion, AddonUUID } from '../addon.config.json'
import semver from 'semver';

export async function install(client: Client, request: Request): Promise<any> {
    const service = new ChartService(client)
    try {
        await service.papiClient.addons.data.schemes.post(chartsTableScheme);
        await service.papiClient.post(`/addons/data/schemes/${AddonUUID}`,chartsPfsScheme);
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
    if (request.body.FromVersion && semver.compare(request.body.FromVersion, '0.6.50') < 0) 
	{
		throw new Error('Upgarding from versions earlier than 0.6.50 is not supported. Please uninstall the addon and install it again.');
	}

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
