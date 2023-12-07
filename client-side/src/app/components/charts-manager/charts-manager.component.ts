import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { IPepOption, KeyValuePair, PepAddonService, PepLayoutService, PepLoaderService, PepScreenSizeType } from '@pepperi-addons/ngx-lib';
import { AddonService } from 'src/app/services/addon.service';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PepDialogActionButton, PepDialogData, PepDialogService } from '@pepperi-addons/ngx-lib/dialog';
import { Chart } from '../../../../../server-side/models/chart';
import 'systemjs';
import 'systemjs-babel';

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
    Type: 'Chart',
    ScriptURI: '',
    System: false
  }

  screenSize: PepScreenSizeType;
  mode: 'Add' | 'Update' = 'Add';
  chartTypeOptions: IPepOption[] = []

  loading: boolean = true
  key: string;
  chartInstance = undefined;
  seedData = 
  {'Chart': {
     DataQueries:[
      {
        Name: "Data1",
        Groups:["ActionDate"],
        Series: ["Series 1", "Series 2"]
      },
      {
        Name: "Data2",
        Groups:["ActionDate"],
        Series: ["Series 3"]
      }
    ],
    DataSet: [
      { "ActionDate": "Jan", "Series 1": this.getRandomNumber(), "Series 2": this.getRandomNumber(), "Series 3":this.getRandomNumber()},
      { "ActionDate": "Feb", "Series 1": this.getRandomNumber(), "Series 2": this.getRandomNumber() , "Series 3":this.getRandomNumber()},
      { "ActionDate": "Mar", "Series 1": this.getRandomNumber(), "Series 2": this.getRandomNumber() , "Series 3":this.getRandomNumber()},
      { "ActionDate": "Apr", "Series 1": this.getRandomNumber(), "Series 2": this.getRandomNumber() , "Series 3":this.getRandomNumber()},
      { "ActionDate": "May", "Series 1": this.getRandomNumber(), "Series 2": this.getRandomNumber() , "Series 3":this.getRandomNumber()},
      { "ActionDate": "Jun", "Series 1": this.getRandomNumber(), "Series 2": this.getRandomNumber() , "Series 3":this.getRandomNumber()}
    ]},
   'Benchmark chart': {
      DataQueries:[
        {
          Name: "Series1",
          Groups:["ActionDateTime"],
          Series: ["AccountA", "AccountB"]
        }
      ],
      DataSet: [
        { "ActionDateTime": "January", "AccountA": 121, "AccountB": 242}
      ],
      Benchmark: {
        DataQueries:[
          {
            Name: "Series1",
            Groups:["ActionDateTime"],
            Series: ["Average"]
          }
        ],
        DataSet:[
          { "ActionDateTime": "January", "Average": 240}
        ]
      }
    },
    'Value scorecard': {
      DataQueries:[
        {
          Name: "Series1",
          Groups:[],
          Series: ["Series1"]
        }
      ],
      DataSet: [
        {"Series1": 152}
      ],
      Benchmark: {
        DataQueries:[
          {
            Name: "Series1",
            Groups:[],
            Series: ["Series1"]
          }
        ],
        DataSet:[
          {"Series1": 183}
        ]
      }
    },
    'Series scorecard': {
      DataQueries:[
        {
          Name: "Data1",
          Groups:["ActionDate"],
          Series: ["Series 1"]
        }
      ],
      DataSet: [
        { "ActionDate": "Jan", "Series 1": this.getRandomNumber()},
        { "ActionDate": "Feb", "Series 1": this.getRandomNumber()},
        { "ActionDate": "Mar", "Series 1": this.getRandomNumber()},
        { "ActionDate": "Apr", "Series 1": this.getRandomNumber()},
        { "ActionDate": "May", "Series 1": this.getRandomNumber()},
        { "ActionDate": "Jun", "Series 1": this.getRandomNumber()}
      ]
    },
    'Table chart': [
      {DataQueries:[{"Name":"Data1","Groups":["ActionDate"],"Series":["Series 1"]}],DataSet:[{"ActionDate":"Jan","Series 1":12},{"ActionDate":"Feb","Series 1":39},{"ActionDate":"Mar","Series 1":79},{"ActionDate":"Apr","Series 1":10},{"ActionDate":"May","Series 1":69},{"ActionDate":"Jun","Series 1":91}]},
      {DataQueries:[{"Name":"Data2","Groups":["ActionDate"],"Series":["Series 2"]}],DataSet:[{"ActionDate":"Jan","Series 2":12111},{"ActionDate":"Feb","Series 2":3319.121},{"ActionDate":"Mar","Series 2":79},{"ActionDate":"Apr","Series 2":122.0},{"ActionDate":"May","Series 2":1269},{"ActionDate":"Jun","Series 2":91}]}
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
  }

  async ngOnInit() {
    this.addonService.addonUUID = this.route.snapshot.params['addon_uuid'];
    for (const typeName in this.seedData)
      this.chartTypeOptions.push({ key: typeName, value: typeName })

    if (history.state.data) {
      this.chart = history.state.data;
      this.mode = 'Update';
	  this.loaderService.show();
	  const versionId = await this.findFileVersion(this.chart.Key);
	  this.chart.ScriptURI+=`?versionId=${versionId}`
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

  async saveClicked() {
    this.loaderService.show();
    if(this.mode == 'Add') {
      const sameNameCharts = await this.addonService.get(`/charts?where=Name='${this.chart.Name}'`);
      if(sameNameCharts.length > 0) {
        this.openCustomDialog(this.translate.instant("TAKEN_NAME_TITLE"), this.translate.instant("TAKEN_NAME_MESSAGE"));
        this.loaderService.hide();
        return;
      }
    }
    this.addonService.post('/charts',this.chart).then((res) => {
      this.loaderService.hide();
	  this.openCustomDialog(this.translate.instant("CHART_SAVED_TITLE"), this.translate.instant("CHART_SAVED_MESSAGE"));
      this.goBack();
    }).catch(ex => {
      this.loaderService.hide();
      console.log(ex);
      this.openCustomDialog("Error", ex);
    })
  }

  openCustomDialog(title: string, content: string, callback?: any) {
    const actionButton: PepDialogActionButton = {
      title: "OK",
      className: "",
      callback: callback,
    };

    const dialogData = new PepDialogData({
      title: title,
      content: content,
      actionButtons: [actionButton],
      actionsType: "custom",
      showClose: false,
    });
    this.dialogService.openDefaultDialog(dialogData);
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
      case 'Type': {
        this.chart.Type = $event;
        break;
      }
    }
  }

  getRandomNumber() {
    return Math.floor(Math.random() * 100);
  }

  onFileSelect(event) {
    if (!event) {
      this.chartInstance = undefined;
      this.chart.ScriptURI='';
    }
    else {
      this.loaderService.show();
      this.cd.detectChanges();
      let fileStr = event.fileStr;
      this.chart.ScriptURI = fileStr;
      this.importChartFileAndExecute();
    }

  }

  private importChartFileAndExecute() {
    System.import(this.chart.ScriptURI).then((res) => {
      const configuration = {
        Title: "Title"
      }
      this.loadSrcJSFiles(res.deps).then(() => {
        const previewDiv = document.getElementById("previewArea");
        this.chartInstance = new res.default(previewDiv, configuration);
        this.chartInstance.data = this.seedData[this.chart.Type];
        this.chartInstance.update();
        this.loaderService.hide();
        window.dispatchEvent(new Event('resize'));
      }).catch(err => {
        this.handleErrorDialog(this.translate.instant("FailedExecuteFile"));
      })
    }).catch(err => {
      this.handleErrorDialog(this.translate.instant("FailedExecuteFile"));
    });
  }


  loadSrcJSFiles(imports) {

    let promises = [];

    imports.forEach(src => {
      promises.push(new Promise<void>((resolve) => {    
        const existing = document.getElementById(src);
  
        if (!existing) {
          // hack - solve the conflict betweem js files
          let _oldDefine = window['define'];
          window['define'] = null;

          const node = document.createElement('script');
          node.src = src;
          node.id = src;
          node.onload = (script) => {
            window['define'] = _oldDefine;
            resolve()
          };
          node.onerror = (script) => {
            this.handleErrorDialog(this.translate.instant("FailedLoadLibrary", {
              library: script['target'].id
            }));
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

  private handleErrorDialog(message: string) {
    this.loaderService.hide();
    this.addonService.openDialog(this.translate.instant("Error"), message);
  }

  private async findFileVersion(chartKey: string) {
	const objects = await this.addonService.get(`/addons/pfs/3d118baf-f576-4cdb-a81e-c2cc9af4d7ad/ChartsPFS?where=Key=${chartKey}`);
	return objects[0].FileVersion;
  }
}
