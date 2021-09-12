import { ChangeDetectorRef, Component, OnInit, SystemJsNgModuleLoader, TemplateRef } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { IPepOption, PepAddonService, PepFileService, PepLayoutService, PepLoaderService, PepScreenSizeType, PepSessionService } from '@pepperi-addons/ngx-lib';
import { AddonService } from 'src/app/services/addon.service';
import { DynamicScriptLoader } from 'src/app/services/dynamic-script-loader-service.service';

import { FakeMissingTranslationHandler, TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PepDialogService } from '@pepperi-addons/ngx-lib/dialog';
import 'systemjs'
import 'systemjs/dist/extras/amd'
import { Chart, ChartTypes } from '../../../../../server-side/models/chart';

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
    ScriptURI: ''
  }

  screenSize: PepScreenSizeType;
  chartsTypes: IPepOption[] = [];
  chartHtml: SafeHtml = undefined;
  chartCustomJS: any = undefined;
  mode: 'Add' | 'Update' = 'Add';

  loading: boolean = true
  key: string;
  chartInstance;

  seedComplexData = {
    groups: ["ActionDate", "Chain", "User"],
    series: ["total sales sum"],
    values: [
      { "ActionDate": '01/01/01', "Chain": "rami", "User": "ey", "total sales sum": 30 },
      { "ActionDate": '01/02/01', "Chain": "rami", "User": "ey", "total sales sum": 20 },
      { "ActionDate": '01/01/01', "Chain": "shufersal", "User": "ey", "total sales sum": 50 },
      { "ActionDate": '01/02/01', "Chain": "shufersal", "User": "ey", "total sales sum": 30 },
    ],
  };
  seedData = {
    groups: ["ActionDate"],
    series: ["rami", "shufersal"],
    values: [
      { "ActionDate": "10/3/2021", "rami": 30, "shufersal": 50 },
      { "ActionDate": "10/04/2021", "rami": 20, "shufersal": 30 }
    ]
  }

  constructor(
    public addonService: AddonService,
    public layoutService: PepLayoutService,
    public translate: TranslateService,
    public dialogService: PepDialogService,
    public router: Router,
    public activatedRoute: ActivatedRoute,
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
    ChartTypes.forEach((chartType) => {
      this.chartsTypes.push({ key: chartType, value: chartType })
    })
  }

  ngOnInit() {
    this.addonService.addonUUID = this.route.snapshot.params['addon_uuid'];
    if (history.state.data) {
      this.chart = history.state.data;
      this.mode = 'Update'
      this.importChartFileAndExecute();
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
      this.chart.ScriptURI = '';
    }
    else {
      debugger;
      this.loaderService.show();
      this.cd.detectChanges();
      let fileStr = event.fileStr;
      console.log(fileStr);
      this.chart.ScriptURI = fileStr;
      this.importChartFileAndExecute();

    }

  }

  private importChartFileAndExecute() {
  
    System.import(this.chart.ScriptURI).then((res) => {
      const configuration = {
        label: 'Sales',
        data: this.seedData
      }

      const previewDiv = document.getElementById("previewArea");
      this.chartInstance = new res.default.default({
        configuration: configuration,
        loadLibrariesFiles: this.loadSrcJSFiles,
        previewDiv: previewDiv
      });
      this.loaderService.hide();

    });
  }

  loadSrcJSFiles(imports) {

    let promises = [];

    imports.forEach(src => {
      promises.push(new Promise<void>((resolve) => {
        debugger
        const existing = document.getElementById(src);
        debugger;
        if (!existing) {
          let _oldDefine = window['define'];
          window['define'] = null;

          const node = document.createElement('script');
          node.src = src;
          node.id = src;
          node.onload = (script) => {
            window['define'] = _oldDefine;
            resolve()
          };
          document.getElementsByTagName('head')[0].appendChild(node);
        }
        else {
          resolve();
        }
      }));
    });
    return Promise.all(promises);
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
