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

            element.innerHTML = `<div style="border:1px solid #000000;">
                                        <canvas></canvas>
                                        </div>`;

            const ctx = element.querySelector('canvas');
			var cfg = {
				type: 'line', 
				options: {
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
							text:configuration.label
						},
					}
				}			
			}

 			this.chart = new Chart(ctx, cfg);

        }

        update() {
            let myDatasets=[];
			for (let i=0; i < this.data.groups.length; i++) {
				let group = this.data.groups[i];
				for (let j = 0; j < this.data.series.length; j++) {											
					let serie = this.data.series[j];
					let color = this.getRandomColor();
					const dataSet = {						
						label: serie,
						data: this.data.values,
						borderColor: 'rgba('+color+', 0.5)',
						backgroundColor: 'rgba('+color+', 0.5)',
						parsing: {
							yAxisKey: serie,
							xAxisKey: group
						}
					}
					myDatasets.push(dataSet);					
				}
			}
			this.chart.data = {
				datasets: myDatasets
			}
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