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
        const groups = this.data.DataQueries.map((data) => data.Groups).flat();
        const series = this.data.DataQueries.map((data) => data.Series).flat();

        const uniqGroups = groups.filter(function (elem, index, self) {
            return index === self.indexOf(elem);
        });
        const uniqSeries = series.filter(function (elem, index, self) {
            return index === self.indexOf(elem);
        });
        const dataSet = this.data.DataSet;

        this.removeUnsupportedCharacters(uniqGroups, uniqSeries, dataSet);

        const colorsToAdd = uniqSeries.length - this.colors.length;
        if (colorsToAdd > 0) {
            this.addRandomColors(colorsToAdd);
        }
        // the data has multiple group by DataSet -> show them in the x-axis
        if (uniqGroups.length > 0) {
            this.chart.data = {
                datasets: uniqGroups.map(groupName => {
                    return uniqSeries.map((seriesName, serieIndex) => {
                        return this.getGroupedDataSet(seriesName, groupName, seriesName, serieIndex,dataSet);
                    })
                }).flat()
            }

        } else {
            // the data has no group by -> show the Series in the x-axis
            this.chart.data = {
                datasets: [
                    this.getDataSet(uniqSeries,dataSet)
                ],
                labels: uniqSeries
            }
            // hide the Series legend title
            this.chart.options.plugins.legend.display = false;
        }

        // update the chart.js chart
        this.chart.update();
    }

    /**
     * This function returns a dataset object array for a chart.js chart.
     */
    getGroupedDataSet(label, xAxisKey, yAxisKey, serieIndex, dataset) {
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
            },
            order: Object.keys(dataset[0]).indexOf(label) - 1

        }
    }

    addRandomColors(numberOfColorsToAdd) {
        for (var i = 0; i < numberOfColorsToAdd; i++) {
            const color = `${Math.floor(Math.random() * 255)},${Math.floor(Math.random() * 255)},${Math.floor(Math.random() * 255)}`;
            this.colors.push(color);
        }
    }

    /**
     * This function returns a dataset object for a chart.js chart.
     */
    getDataSet(series,dataset) {
        const colors = series.map((serie, index) => this.colors[index]);
        return {
            label: '',
            data: series.map(Series => {
                return dataset[0][Series];
            }),
            borderColor: colors.map(color => `rgb(${color})`),
            backgroundColor: colors.map(color => `rgba(${color}, 0.33)`),
            borderWidth: 1
        }
    }

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

    removeUnsupportedCharacters(uniqGroups, uniqSeries, dataSet) {

        let foundGroupWithDot = false;
        for (let i = 0; i < uniqGroups.length; i++) {
            if (uniqGroups[i].indexOf('.') > -1) {
                foundGroupWithDot = true;
                uniqGroups[i] = uniqGroups[i].replace('.', '');
            }
        };

        let founSeriesWithDot = false;
        for (let i = 0; i < uniqSeries.length; i++) {
            if (uniqSeries[i].indexOf('.') > -1) {
                founSeriesWithDot = true;
                uniqSeries[i] = uniqSeries[i].replace('.', '');
            }
        };

        if (founSeriesWithDot || foundGroupWithDot) {
            for (let i = 0; i < dataSet.length; i++) {
                dataSet[i] = this.transformKeys(dataSet[i]);
            };
        }
    }

    transformKeys(obj) {
        return Object.keys(obj).reduce(function (o, prop) {
            var value = obj[prop];
            var newProp = prop.replace('.', '');
            o[newProp] = value;
            return o;
        }, {});
    }
}

// defines the dependencies required for the chart
export const deps = [
    'https://cdn.jsdelivr.net/npm/chart.js@3.5.1/dist/chart.min.js'
];

