define(['exports'], function (exports) {
    'use strict';

    // some JSDoc comments for IDE intellisense

    /**
     * @typedef Configuration A configuration object supplied to the chart by the embedder
     * @type {object}
     * @property {string} label The label of the chart
     */

    /**
     * @typedef ChartData A data object supplied to the chart by the embedder containing the chart data
     * @type {object}
     * @property {string[]} series The chart data groups
     * @property {string[]} groups The chart data series
     * @property {object[]} values The chart data values
     */

    /**
     * This is the class the embedder will use to render the chart
	 * In this file we will use a chart from chart.js
     */
    class MyChart {

        /**
         * The chart constructor.
         * 
         * @param {HTMLElement} element The embedder supplies this HTMLElement which can be used to render UI
         * @param {Configuration} configuration a JSON object that holds the chart specific configuration
         */
        constructor(element, configuration) {
            /**
             * The embedder of this chart will insert the chart data to this property
             * @type {ChartData}
             */
            this.data = {};

            // first we create a canvas on the HTML element
            element.innerHTML = this.getHTML();

            // retrieve the canvas element from the element
            const canvas = element.querySelector('canvas');

            // retrieve a chart.js configuration using the label from the embedder configuration
			const conf = this.getChartJSConfiguration(configuration.label);

            // create a chart.js Chart element on the canvas with the configuration
			this.chart = new Chart(canvas, conf);
        }

        /**
         * This function must be implemented by the chart
         * the embedder calls this function when there are changes to the chart data
         */
        update() {
            // the data has multiple group by values -> show them in the y-axis
			if (this.data.groups.length > 0) {  
				this.chart.data = {
					datasets: this.data.groups.map(group => {
                        return this.data.series.map(series => {
                            return this.getGroupedDataSet(series, series, group);
                        })
                    }).flat()
				}
			
			} else { 
                // the data has no group by -> show the series in the y-axis
                this.chart.data = {
					datasets: [
                        this.getDataSet()
                    ],
                    labels: this.data.series
				}
				// hide the series legend title
				this.chart.options.plugins.legend.display = false;
			}
	
			// update the chart.js chart
			this.chart.update();
        }

		/**
         * This function returns a dataset object array for a chart.js chart.
         */
        getGroupedDataSet(label, xAxisKey, yAxisKey) {
            const color = this.getRandomColor();
            return {						
                label: label,
                data: this.data.values,
                borderColor: 'rgb('+color+')',
                backgroundColor: 'rgba('+color+', 0.2)',
                borderWidth: 1,
                parsing: {
                    yAxisKey: yAxisKey,
                    xAxisKey: xAxisKey
                }
            }
        }

		/**
         * This function returns a dataset object for a chart.js chart.
         */
        getDataSet() {
            const colors = this.data.series.map(series => this.getRandomColor());
            return {						
                data: this.data.series.map(series => {
                    return this.data.values[0][series];
                }),
                borderColor: colors.map(color => `rgb(${color})`),
                backgroundColor: colors.map(color => `rgba(${color}, 0.2)`),
                borderWidth: 1
            }
        }

		/**
         * This function returns a random color. 
         */
        getRandomColor() {
            return `${Math.floor(Math.random() * 255)},${Math.floor(Math.random() * 255)},${Math.floor(Math.random() * 255)}`;
        }

		/**
         * This function returns an html which will be created in the embedder. 
         */
        getHTML() {
            return `<div >
                <canvas></canvas>
                </div>`;
        }

		/**
         * This function returns a chart.js configuration object. 
         */
        getChartJSConfiguration(label) {
            return {
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
							text: label
						},
					}
				}			
			};
        }
    }

	// defines the dependencies required for the chart
    const deps = [
        'https://cdn.jsdelivr.net/npm/chart.js@3.5.1/dist/chart.min.js'
    ];

	// export the chart constructor so it will be used by the embedder.
    exports.default = MyChart;
    exports.deps = deps;
    Object.defineProperty(exports, '__esModule', { value: true });

});