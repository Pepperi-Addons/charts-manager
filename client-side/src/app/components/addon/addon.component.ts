import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Component, OnInit, ViewChild } from "@angular/core";
import { PepAddonService, PepFileService, PepLayoutService, PepLoaderService, PepScreenSizeType } from '@pepperi-addons/ngx-lib';
import { AddonService } from '../../services/addon.service';
import { GenericListComponent, GenericListDataSource } from '../generic-list/generic-list.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Chart } from '../../../../../server-side/models/chart'


@Component({
    selector: 'addon-module',
    templateUrl: './addon.component.html',
    styleUrls: ['./addon.component.scss'],
    providers: [TranslatePipe]
})
export class AddonComponent implements OnInit {

    screenSize: PepScreenSizeType;
    charts: Chart[];
    @ViewChild(GenericListComponent) 
    chartsList: GenericListComponent;

    constructor(
        public addonService: AddonService,
        public layoutService: PepLayoutService,
        public translate: TranslateService,
        public router: Router,
        public route: ActivatedRoute,
        private pepAddonService: PepAddonService,
        public loaderService: PepLoaderService
    ) {

        this.layoutService.onResize$.subscribe(size => {
            this.screenSize = size;
        });
        this.addonService.addonUUID = '3d118baf-f576-4cdb-a81e-c2cc9af4d7ad';

    }

    ngOnInit() {
    }

    listDataSource: GenericListDataSource = {
        getList: async (state) => {
            let res: Chart[] = [];
            this.loaderService.show();
            return this.addonService.get('/charts').then((charts) => {
            //return this.pepAddonService.getAddonApiCall(this.addonService.addonUUID, 'api', 'charts', {}).toPromise().then((charts) => {
                const orderedCharts = charts.sort((a, b) => (a.Name > b.Name) ? 1 : ((b.Name > a.Name) ? -1 : 0));
                for (let chart of orderedCharts) {
                    res.push({
                        Type: chart.Type,
                        Name: chart.Name,
                        Description: chart.Description,
                        Key: chart.Key,
                        ScriptURI: chart.ScriptURI,
                        ReadOnly: chart.System,
                        System: chart.System
                    })
                }
                this.loaderService.hide();
                return res;
            })

        },

        getDataView: async () => {
            return {
                Context: {
                    Name: '',
                    Profile: { InternalID: 0 },
                    ScreenSize: 'Landscape'
                },
                Type: 'Grid',
                Title: '',
                Fields: [
                    {
                        FieldID: 'Name',
                        Type: 'TextBox',
                        Title: this.translate.instant("Name"),
                        Mandatory: false,
                        ReadOnly: true
                    },
                    {
                        FieldID: 'Description',
                        Type: 'TextBox',
                        Title: this.translate.instant("Description"),
                        Mandatory: false,
                        ReadOnly: true
                    },
                    {
                        FieldID: 'Type',
                        Type: 'TextBox',
                        Title: this.translate.instant("Type"),
                        Mandatory: false,
                        ReadOnly: true
                    },
                    {
                        FieldID: 'System',
                        Type: 'Boolean',
                        Title: this.translate.instant("System"),
                        Mandatory: false,
                        ReadOnly: true
                    }
                ],
                Columns: [
                    {
                        Width: 25
                    },
                    {
                        Width: 25
                    },
                    {
                        Width: 25
                    },
                    {
                        Width: 25
                    }
                ],
                FrozenColumnsCount: 0,
                MinimumColumnWidth: 0
            }
        },

        getActions: async (objs) => {
            let actions = objs.length ? [
                {
                    title: this.translate.instant("Download"),
                    handler: async (objs) => {
                        this.downloadChart(objs[0]);
                    }
                }
            ] : []
            if (objs.length > 0 && !objs[0]?.ReadOnly) {
                actions.unshift(
                    {
                        title: this.translate.instant("Edit"),
                        handler: async (objs) => {
                            this.router.navigate([objs[0].Key], {
                                state: { data: objs[0] },
                                relativeTo: this.route,
                                queryParamsHandling: 'merge'
                            });
                        }
                    },
                    {
                        title: this.translate.instant("Delete"),
                        handler: async (objs) => {
                            this.deleteChart(objs[0]);
                        }
                    }
                );
            }
            if (objs[0]?.ReadOnly) {
                actions.unshift(
                    {
                        title: this.translate.instant("Preview"),
                        handler: async (objs) => {
                            this.router.navigate([objs[0].Key], {
                                state: { data: objs[0] },
                                relativeTo: this.route,
                                queryParamsHandling: 'merge'
                            });
                        }
                    }
                );
            }
            return actions;
        }
    }

    add() {
        this.router.navigate(['create'], {
            relativeTo: this.route,
            queryParamsHandling: 'merge'
        });
    }


    downloadChart(chart) {

        fetch(chart.ScriptURI, { method: `GET` })
            .then(response => response.blob())
            .then(blob => {
                var url = window.URL.createObjectURL(blob);
                var a = document.createElement('a');
                a.href = url;
                a.download = `${chart.Name}.js`;
                document.body.appendChild(a);
                a.click();
                a.remove();
            });
    };

    deleteChart(chart) {
        chart.Hidden = true;
        this.loaderService.show();
        this.addonService.post('/charts',chart).then((res) => {
        //this.pepAddonService.postAddonApiCall(this.addonService.addonUUID, 'api', 'charts', chart).toPromise().then((res) => {
            this.loaderService.hide();
            this.chartsList.reload();
        }).catch(ex => {
            this.loaderService.hide();
            console.log(ex);
            this.translate.instant("Preview")
            //this.openCustomDialog("Error", ex);
        })

    };

}
