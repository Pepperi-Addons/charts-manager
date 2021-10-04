define(['exports'], function (exports) {
    'use strict';

    /**
    * This is the class the chart-manager will use to render the chart
    * 
    * @property element - number the ee
    */
    class MyChart {

        constructor(element, configuration) {
            this.element = element;

            this.data = {};

            this.element.innerHTML = `<div style="border:1px solid #000000;">
                                        <canvas></canvas>
                                        </div>`;

            const ctx = element.querySelector('canvas');
			var cfg = {
				type: 'pie',
				options: {
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
           // create data set
			let myDatasets=[];
			var datasetData = [];
			var datasetBGColors = [];
			for (let i=0; i<this.data.series.length; i++) {
				debugger;
				datasetData.push(this.data.values[0][this.data.series[i]]);
				let color = this.getRandomColor();
				datasetBGColors.push('rgba('+color+', 0.2)');
			};
			const dataSet = {						
				data: datasetData,
				backgroundColor: datasetBGColors,
				borderWidth: 1
			}
			myDatasets.push(dataSet);
			
			this.chart.data = {
				datasets: myDatasets,
				labels: this.data.series
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