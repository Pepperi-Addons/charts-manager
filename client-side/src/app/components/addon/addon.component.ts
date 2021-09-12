import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Component, OnInit } from "@angular/core";
import { PepFileService, PepLayoutService, PepScreenSizeType } from '@pepperi-addons/ngx-lib';
import { AddonService } from '../../services/addon.service';
import { PepDialogData, PepDialogService } from '@pepperi-addons/ngx-lib/dialog';
import { GenericListDataSource } from '../generic-list/generic-list.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Chart } from '../../../../../server-side/models/chart'
import { Console } from 'console';


@Component({
    selector: 'addon-module',
    templateUrl: './addon.component.html',
    styleUrls: ['./addon.component.scss'],
    providers: [TranslatePipe]
})
export class AddonComponent implements OnInit {

    screenSize: PepScreenSizeType;
    charts: Chart[];

    constructor(
        public addonService: AddonService,
        public layoutService: PepLayoutService,
        public translate: TranslateService,
        public router: Router,
        public route: ActivatedRoute,
        private fileService: PepFileService
    ) {

        this.layoutService.onResize$.subscribe(size => {
            this.screenSize = size;
        });
        this.addonService.addonUUID = '3d118baf-f576-4cdb-a81e-c2cc9af4d7ad';

    }

    ngOnInit() {

    }

    listDataSource: GenericListDataSource = {
        getList: (state) => {
            let res: Chart[] = [];
            return this.addonService.papiClient.addons.data.uuid(this.addonService.addonUUID).table('Charts').iter().toArray().then((charts) => {
                for (let chart of charts) {
                    res.push({
                        Type: chart.Type,
                        Name: chart.Name,
                        Description: chart.Description,
                        Key: chart.Key,
                        ScriptURI: chart.ScriptURI,
                        ReadOnly: chart.ReadOnly
                    })
                }
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
                        FieldID: 'Type',
                        Type: 'TextBox',
                        Title: this.translate.instant("Component"),
                        Mandatory: false,
                        ReadOnly: true
                    },
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
                    }
                ],
                Columns: [
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

}
