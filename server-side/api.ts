import ChartService from './chart-service'
import { Client, Request } from '@pepperi-addons/debug-server'


export async function charts(client: Client, request: Request) {
    const service = new ChartService(client)
    if (request.method == 'POST') {
        return await service.upsert(request);
    }
    else if (request.method == 'GET') {
        return await service.find(request.query);
    }
};

