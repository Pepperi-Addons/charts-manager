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
 * In this file we will use a chart from apexcharts
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

        // first we create a div on the HTML element
        element.innerHTML = this.getHTML();

        // retrieve the canvas element from the element
        const canvas = element.querySelector('#canvas');

        // retrieve the chart configuration
        const conf = this.getConfiguration();

        // create a chart element on the canvas with the configuration
        this.chart = new ApexCharts(canvas, conf);
        this.chart.render();
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

        let ser = [];
        // the data has multiple group by DataSet -> show them in the y-axis
        if (uniqGroups.length > 0) {
            ser = uniqSeries.map(seriesName => {
                return {
                    "name": seriesName,
                    "data": uniqGroups.map(groupName => {
                        return [
                            dataSet.map(ds => {
                                return {
                                    "x": ds[groupName],
                                    "y": ds[seriesName] || null
                                }
                            })
                        ]
                    }).flat(2)
                }
            });
        } else {
            // the data has no group by -> show the Series in the y-axis
            const flattened = uniqSeries.map(seriesName => dataSet[0][seriesName]);
            ser = [{
                    "data": flattened
                }
            ];
            this.chart.updateOptions({
                labels: uniqSeries
            });
            // set the colors to be distributed
            this.chart.updateOptions({
                plotOptions: {
                    bar: {
                        distributed: true
                    }
                }
            });
            // hide the legend (since the series name is on the x axis)
            this.chart.updateOptions({
                legend: {
                    show: false
                }
            });
        }

        // update the chart
        this.chart.updateSeries(ser);

        // add colors (if there are more colors then defined in the chart)
        this.addRandomColors(uniqSeries.length);
		
		// calculate the optimal column width (using f(x) = c / (1 + a*exp(-x*b)) -> LOGISTIC GROWTH MODEL)
		// 20: minimum should be close to 20 (when only one item)
		// 20+60: maximum should be close 80
		// 10 and 2: the a and b from the function
		const seriesLength = ser.reduce((sum, curr) => Math.max(sum, (curr.data.length ||0)),0);
		const optimalPercent = 20 + (60 / (1 + 10*Math.exp(-seriesLength /2)));
        this.chart.updateOptions({
            plotOptions: {
				bar: {
					columnWidth: optimalPercent + "%"
				}
			}
        });

        // update the initial message to be seen if there is no data
        this.chart.updateOptions({
            noData: {
                text: 'No data'
            }
        });
    }

    /**
     * This function adds a random color to the pre-defined colors list.
     */
    addRandomColors(numberOfColor) {
        let colors = this.chart.w.config.colors;
        const numberOfColorsToAdd = numberOfColor - colors.length;
        if (numberOfColorsToAdd > 0) {
            for (var i = 0; i < numberOfColorsToAdd; i++) {
                const color = `${Math.floor(Math.random() * 255)},${Math.floor(Math.random() * 255)},${Math.floor(Math.random() * 255)}`;
                colors.push(color);
            }
            this.chart.updateOptions({
                colors: colors
            });
        }
    }

    /**
     * This function returns an html which will be created in the embedder.
     */
    getHTML() {
        return `<div id="canvas"></div>`;
    }

    /**
     * This function returns a chart configuration object.
     */
    getConfiguration() {
        const colors = ['#1766A6', '#FF9800', '#FE5000', '#83B30C'];
        return {
            chart: {
                type: 'bar',
                height: 300,
                width: "100%",
                toolbar: {
                    show: true
                },
                stacked: true
            },
            colors: colors,
            dataLabels: {
                style: {
                    colors: ['#000000']
                },
                //offsetY: -20
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    dataLabels: {
                        //	position: 'top',
                    },
                    borderRadius: 4
                }
            },
            legend: {
                horizontalAlign: 'left',
                onItemClick: {
                    toggleDataSeries: true
                },
                labels: {
                    useSeriesColors: true
                }
            },
            noData: {
                text: 'Loading...'
            },
            series: []
        };
    }
}

// defines the dependencies required for the chart
export const deps = [
    'https://cdn.jsdelivr.net/npm/apexcharts'
];
