define(['exports'], function (exports) {
    'use strict';

    /**
    * This is the class the chart-manager will use to render the chart
    * 
    * @property element - number the ee
    */
    class MyChart {

        constructor(element, configuration) {

            this.data = {};
			this.label ='';
            element.innerHTML = `<div style="border:1px solid #000000;">
                                        <canvas></canvas>
                                        </div>`;

            const ctx = element.querySelector('canvas');
            var cfg = {
				type: 'bar',
				options: {
					indexAxis: 'y',
					scales: {
						yAxes: [{
							ticks: {
								beginAtZero: true
							}
						}]
					},
					plugins: {
						title: {
							display: true,
							text: configuration.label
						},
					}
				}			
			}
			this.chart = new Chart(ctx, cfg);

        }

        update() {
            let myDatasets=[];
			
			if (this.data.groups.length > 0)	{  // multiple group by values - show them in the y-axis
				for (let i=0; i < this.data.groups.length; i++) {
					let group = this.data.groups[i];
					for (let j = 0; j < this.data.series.length; j++) {											
						let serie = this.data.series[j];
						let color = this.getRandomColor();
						const dataSet = {						
							label: serie,
							data: this.data.values,
							borderColor: 'rgb('+color+')',
							backgroundColor: 'rgba('+color+', 0.2)',
							borderWidth: 1,
							parsing: {
								xAxisKey: serie,
								yAxisKey: group
							}
						}
						myDatasets.push(dataSet);					
					}
				}
				this.chart.data = {
					datasets: myDatasets
				}
				
			} else { // no group by, show the series in the y-axis
				var datasetData = [];
				var datasetBGColors = [];
				var datasetBorderColor = [];
				for (let i=0; i<this.data.series.length; i++) {
					datasetData.push(this.data.values[0][this.data.series[i]]);
					let color = this.getRandomColor();
					datasetBorderColor: 'rgb('+color+')',
					datasetBGColors.push('rgba('+color+', 0.2)');
				};
				const dataSet = {						
					data: datasetData,
					borderColor: datasetBorderColor,
					backgroundColor: datasetBGColors,
					borderWidth: 1
				}
				myDatasets.push(dataSet);
				
				this.chart.data = {
					datasets: myDatasets,
					labels: data.series
				}				
			}
	
			// update the chart
			this.chart.update();
        }

        getRandomColor() {
            return ''+Math.floor(Math.random() * 255)+','+ Math.floor(Math.random() * 255)+','+ Math.floor(Math.random() * 255)+'';
        }
    }

    const deps = [
        'https://cdn.jsdelivr.net/npm/chart.js@3.5.1/dist/chart.min.js'
    ];

    exports['default'] = MyChart;
    exports.deps = deps;

    Object.defineProperty(exports, '__esModule', { value: true });

});	