import { ChangeDetectorRef, Component, OnInit, SystemJsNgModuleLoader, TemplateRef } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { IPepOption, PepAddonService, PepFileService, PepLayoutService, PepLoaderService, PepScreenSizeType, PepSessionService } from '@pepperi-addons/ngx-lib';
import { AddonService } from 'src/app/services/addon.service';
import { DynamicScriptLoader } from 'src/app/services/dynamic-script-loader-service.service';

import { FakeMissingTranslationHandler, TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PepDialogActionButton, PepDialogData, PepDialogService } from '@pepperi-addons/ngx-lib/dialog';
import { AddonData, PapiClient } from '@pepperi-addons/papi-sdk';
import jwt from 'jwt-decode';
import { get } from 'scriptjs';
import { Renderer2 } from '@angular/core';
import 'systemjs'
import 'systemjs/dist/extras/amd'
import { UpperCasePipe } from '@angular/common';
import { Chart } from '../../../../../server-side/models/chart';

@Component({
  selector: 'addon-charts-manager',
  templateUrl: './charts-manager.component.html',
  styleUrls: ['./charts-manager.component.scss']
})
export class ChartsManagerComponent implements OnInit {

  chart: Chart = {
    Name: '',
    Description: '',
    ReadOnly: false,
    Type: undefined,
    ScriptURL: ''
  }

  jsFileloading = true;
  screenSize: PepScreenSizeType;
  chartsTypes: IPepOption[];
  chartHtml: SafeHtml = undefined;
  chartCustomJS: any = undefined;
  mode: 'Add' | 'Update' = 'Add';

  loading: boolean = true
  key: string;

  constructor(
    public addonService: AddonService,
    public layoutService: PepLayoutService,
    public translate: TranslateService,
    public dialogService: PepDialogService,
    public router: Router,
    public activatedRoute: ActivatedRoute,
    private fileService: PepFileService,
    public sanitizer: DomSanitizer,
    private cd: ChangeDetectorRef,
    public loaderService: PepLoaderService,
    private route: ActivatedRoute,
    private pepAddonService: PepAddonService
  ) {

    this.layoutService.onResize$.subscribe(size => {
      this.screenSize = size;
    });
    this.key = this.activatedRoute.snapshot.params["chart_uuid"];
    this.loading = false;
    this.chartsTypes = [{ key: '2DBar', value: '2D Bar' }, { key: '3DBar', value: '3D Bar' }, { key: 'Gauge', value: 'Gauge' }];
  }

  ngOnInit() {
    this.addonService.addonUUID = this.route.snapshot.params['addon_uuid'];
    if (history.state.data) {
      this.chart = history.state.data;
      this.mode = 'Update'
      this.importUserFileAndExecute(this.chart.ScriptURL);
    }

  }

  goBack() {
    this.router.navigate(['..'], {
      relativeTo: this.activatedRoute,
      queryParamsHandling: 'preserve'
    })
  }

  backClicked() {
    this.goBack();
  }

  saveClicked() {
    this.loaderService.show();
    this.pepAddonService.postAddonApiCall(this.addonService.addonUUID, 'api', 'charts', this.chart).toPromise().then((res) => {
      this.loaderService.hide();
      this.goBack();
    })
  }

  cancelClicked() {
    this.goBack();
  }

  onValueChanged(element, $event) {
    switch (element) {
      case 'Name': {
        this.chart.Name = $event;
        break;
      }
      case 'Description': {
        this.chart.Description = $event;
        break;
      }
      case 'Component': {
        this.chart.Type = $event;
        break;
      }
    }

  }


  onFileSelect(event) {

    if (!event) {
      this.chartHtml = "";
      this.chart.ScriptURL = '';
    }
    else {
      this.loaderService.show();
      this.cd.detectChanges();
      let fileStr = event.fileStr;
      const content = decodeURIComponent(
        escape(
          window.atob(fileStr.split(";")[1].split(",")[1])
        ))
      const contentold = fileStr.split(";")[1].split(",")[1];
      this.addonService.papiClient.fileStorage.tmp().then((presignedUrl) => {
        fetch(presignedUrl.UploadURL, {
          method: `PUT`,
          body: content,
        }).then(() => {
          this.chart.ScriptURL = presignedUrl.DownloadURL;
          this.importUserFileAndExecute(presignedUrl.DownloadURL);

        })
      })
    }

  }

  private importUserFileAndExecute(jsUrl) {
    System.import(jsUrl).then((res) => {
      this.chartCustomJS = res;
      this.jsFileloading = false;
      setTimeout(() => this.preview(), 1000);


    });
  }

  getData() {
    return this.addonService.papiClient.get(`/elasticsearch/totals/transaction_lines?select=count(Item.ExternalID)&group_by=Transaction.Status`);
  }

  preview() {
    this.chartHtml = this.sanitizer.bypassSecurityTrustHtml(this.chartCustomJS.getHtml());

    this.chartCustomJS.hello();
    //this.chartCustomJS.initComponents();
    const labels = ["Africa", "Asia", "Europe", "Latin America", "North America"];
    const data = [2478, 5267, 734, 784, 433];
    const label = 'Population (millions)';
    setTimeout(() => this.chartCustomJS.initComponents(label, labels, data), 0);
    this.loaderService.hide();

    // this.chartHtml = this.sanitizer.bypassSecurityTrustHtml(window['pepChart'].getHtml());
    // setTimeout(function () { window['pepChart'].initComponents(); }, 0);


    //this.getData().then((res) => {
    // this.chartHtml = this.sanitizer.bypassSecurityTrustHtml(window['pepChart'].getHtml());
    // window['pepChart'].labels = res.map(x => x['Transaction.Status']);
    // window['pepChart'].data = res.map(x => x['count_Item.ExternalID'])
    // setTimeout(function () { window['pepChart'].initComponents(); }, 0);
    //})
  }
}
