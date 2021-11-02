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
     * @property {string[]} Series The chart data Groups
     * @property {string[]} Groups The chart data Series
     * @property {object[]} DataSet The chart data DataSet
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
            const colorsToAdd = this.data.Series.length - this.colors.length;
            if (colorsToAdd > 0) {
                this.addRandomColors(colorsToAdd);
            }

            // the data has multiple group by DataSet -> show them in the x-axis
            if (this.data.Groups.length > 0) {
                this.chart.data = {
                    datasets: this.data.Groups.map(group => {
                        return this.data.Series.map((series, serieIndex) => {
                            return this.getGroupedDataSet(series, group, series, serieIndex);
                        })
                    }).flat()
                }

            } else {
                // the data has no group by -> show the Series in the x-axis
                this.chart.data = {
                    datasets: [
                        this.getDataSet()
                    ],
                    labels: this.data.Series
                }
                // hide the Series legend title
                this.chart.options.plugins.legend.display = false;
            }

            // update the chart.js chart
            this.chart.update();
        }

        addRandomColors(numberOfColorsToAdd) {
            for (var i = 0; i < numberOfColorsToAdd; i++) {
                const color = `${Math.floor(Math.random() * 255)},${Math.floor(Math.random() * 255)},${Math.floor(Math.random() * 255)}`;
                this.colors.push(color);
            }
        }  

        /**
         * This function returns a dataset object array for a chart.js chart.
         */
        getGroupedDataSet(label, xAxisKey, yAxisKey, serieIndex) {
            const color = this.colors[serieIndex];
            return {
                label: label,
                data: this.data.DataSet,
                borderColor: 'rgb(' + color + ')',
                backgroundColor: 'rgba(' + color + ', 0.33)',
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
            const colors = this.data.Series.map((serie, index) => this.colors[index]);
            return {
                label: '',
                data: this.data.Series.map(series => {
                    return this.data.DataSet[0][series];
                }),
                borderColor: colors.map(color => 'rgb(' + color + ')'),
                backgroundColor: colors.map(color => 'rgba(' + color + ', 0.33)',),
                borderWidth: 1
            }
        }

        colors = ['23, 102,166', '255, 152,0', '254,80,0', '131,179,12'];

        /**
         * This function returns an html which will be created in the embedder. 
         */
        getHTML() {
            return `<div>
                <canvas></canvas>
                </div>`;
        }

        /**
         * This function returns a chart.js configuration object. 
         */
        getChartJSConfiguration(label) {
            return {
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
                            text: label,
                            align: 'start',
                            padding: 10,
                            font: {
                                size: 24,
                                lineHeight: 2
                            },
                        },
                        legend: {
                            labels: {
                                color: '#00000075',
                                boxHeight: 15,
                                padding: 10,
                            },
                            position: 'bottom',
                            align: 'start',
                        }
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