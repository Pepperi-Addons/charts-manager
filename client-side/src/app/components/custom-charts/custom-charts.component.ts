import { HttpClient } from '@angular/common/http';
import { HtmlParser } from '@angular/compiler';
import { AfterViewInit, Component, ElementRef, Input, OnInit, PipeTransform, ViewChild } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { PepFileService } from '@pepperi-addons/ngx-lib';

@Component({
  selector: 'addon-custom-charts',
  templateUrl: './custom-charts.component.html',
  styleUrls: ['./custom-charts.component.scss']
})
export class CustomChartsComponent implements OnInit, PipeTransform, AfterViewInit {

  @Input()
  chartHtml: SafeHtml = ''
  @ViewChild('htmlContainer') container;
  trustedHTML: any;

  constructor(public sanitizer: DomSanitizer,
    private elementRef: ElementRef,
    private http: HttpClient, private fileService: PepFileService) { }

  transform(value: any, ...args: any[]) {
    return this.sanitizer.bypassSecurityTrustHtml(value);
  }

  ngOnInit() {
    //this.loadScript('https://cdn.jsdelivr.net/npm/chart.js@2.8.0')
  }

  loadScript(url: string) {
    const body = <HTMLDivElement> document.body;
    const script = document.createElement('script');
    script.innerHTML = '';
    script.src = url;
    script.async = false;
    script.defer = true;
    body.appendChild(script);
  }
  ngAfterInit(){
  }

  ngAfterViewInit(){
  }
}
