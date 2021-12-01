
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
export default class MyChart {

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
        const conf = this.getChartJSConfiguration();

        // create a chart.js Chart element on the canvas with the configuration
        this.chart = new Chart(canvas, conf);
    }

    /**
     * This function must be implemented by the chart
     * the embedder calls this function when there are changes to the chart data
     */
    update() {
        debugger;
        const groups = this.data.MetaData.map((data) => data.Groups)[0];
        const series = this.data.MetaData.map((data) => data.Series)[0];

        const uniqGroups = groups.filter(function (elem, index, self) {
            return index === self.indexOf(elem);
        });
        const uniqSeries = series.filter(function (elem, index, self) {
            return index === self.indexOf(elem);
        });


        const colorsToAdd = uniqSeries.length - this.colors.length;
        if (colorsToAdd > 0) {
            this.addRandomColors(colorsToAdd);
        }

        // the data has multiple group by DataSet -> show them in the y-axis
        if (uniqGroups.length > 0) {
            this.chart.data = {
                datasets: uniqGroups.map(group => {
                    return uniqSeries.map((series, seriesIndex) => {
                        return this.getGroupedDataSet(series, series, group, seriesIndex);
                    })
                }).flat()
            }

        } else {
            // the data has no group by -> show the Series in the y-axis
            this.chart.data = {
                datasets: [
                    this.getDataSet(uniqSeries)
                ],
                labels: uniqSeries
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
    getGroupedDataSet(label, xAxisKey, yAxisKey, seriesIndex) {
        const color = this.colors[seriesIndex];
        return {
            label: label,
            data: this.data.DataSet,
            borderColor: 'rgb(' + color + ')',
            backgroundColor: 'rgba(' + color + ', 0.33)',
            borderWidth: 1,
            parsing: {
                yAxisKey: yAxisKey,
                xAxisKey: xAxisKey
            },
            order: Object.keys(this.data.DataSet[0]).indexOf(label) - 1
        }
    }

    /**
     * This function returns a dataset object for a chart.js chart.
     */
    getDataSet(series) {
        debugger
        const colors = series.map((serie, index) => this.colors[index]);
        return {
            data: series.map(Series => {
                return this.data.DataSet[0][Series];
            }),
            borderColor: colors.map(color => `rgb(${color})`),
            backgroundColor: colors.map(color => `rgba(${color}, 0.33)`),
            borderWidth: 1,
        }
    }

    /**
     * This function returns a random color. 
     */
    colors = ['23, 102,166', '255, 152,0', '254,80,0', '131,179,12'];


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
    getChartJSConfiguration() {
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
export const deps = [
    'https://cdn.jsdelivr.net/npm/chart.js@3.5.1/dist/chart.min.js'
];
