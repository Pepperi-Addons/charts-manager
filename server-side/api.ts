import { AddonData } from '@pepperi-addons/papi-sdk';
import ChartService from './chart-service'
import { Client, Request } from '@pepperi-addons/debug-server'


export async function charts(client: Client, request: Request): Promise<AddonData | AddonData[] | undefined> {
    const service = new ChartService(client)
    if (request.method === 'POST') {
        return await service.upsert(request.body);
    }
    else if (request.method === 'GET') {
        return await service.find(request.query);
    }
}

export function import_data_source(client: Client, request: Request): any {
    const service = new ChartService(client)
    if (request.method === 'POST') {
        return service.importDataSource(request.body);
    }
    else if (request.method === 'GET') {
        throw new Error(`Method ${request.method} not supported`);
    }
}

export function export_data_source(client: Client, request: Request): any {
    const service = new ChartService(client)
    if (request.method === 'POST') {
        return service.exportDataSource(request.body);
    }
    else if (request.method === 'GET') {
        throw new Error(`Method ${request.method} not supported`);
    }
}

