
define(["exports"], function (_exports) {
  "use strict";

	Object.defineProperty(_exports, "__esModule", {
    value: true
  });
	const imports = ['https://cdn.jsdelivr.net/npm/chart.js@2.8.0/dist/Chart.min.js'];

	class MyChart {
		
		chart;
		configuration;
		constructor(data) {
							
				data.previewDiv.innerHTML = `<div style="border:1px solid #000000;">
							<canvas id="my-chart"></canvas>
						</div>`;
			
				this.configuration=data.configuration;
			
				data.loadLibrariesFiles(imports).then(() => {
					this.initChart();
				});				
		 }
		 
		initChart(){
			
			var ctx = document.getElementById('my-chart');

			this.chart = new Chart(ctx, {
					type: 'bar',
					options: {
						scales: {
							yAxes: [{
								ticks: {
									beginAtZero: true
								}
							}]
						}
					}			
				})
			this.updateData();
		}
		
		updateData() {

			let data = {};			
			
			for (const i=0; i< this.configuration.data.series.length; i++) {								
				let series = this.configuration.data.series[i];
				let values = [];										
				for (const k=0; k < this.configuration.data.values.length; k++) {						
					let item = this.configuration.data.values[k];																	
					values.push(item[series])
				}
				data[series] = values;				
			}

			let labels = [];
			for (const k=0; k < this.configuration.data.values.length; k++) {
					let item = this.configuration.data.values[k];				
					labels.push(item[this.configuration.data.groups[0]]);
			}			

			let datasets=[];
			
			for (let i=0; i < this.configuration.data.groups.length; i++) {
				let group = this.configuration.data.groups[i];
				for (let j = 0; j < this.configuration.data.series.length; j++) {											
					let series = this.configuration.data.series[j];
							
					const dataSet = {						
						label: series,
						data: data[series],
						backgroundColor: 'rgba('+Math.floor(Math.random() * 255)+','+ Math.floor(Math.random() * 255)+','+ Math.floor(Math.random() * 255)+', 1)',
						parsing: {
							yAxisKey: series,
							xAxisKey: group
						}
					}
					datasets.push(dataSet);					
				}
			}
						
			this.chart.data = {
				labels:labels,
				datasets: datasets
			}
		
			this.chart.update();
		}
	}
	
	_exports.default = MyChart;

});
