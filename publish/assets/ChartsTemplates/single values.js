define(["exports"], function (exports) {
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

			// the chart will be created in the HTML element
			this.chart = element;	
		}
		
		/**
         * This function must be implemented by the chart
         * the embedder calls this function when there are changes to the chart data
         */
		update() {
			// update the embedder with the new html content
			this.chart.innerHTML = this.getHTML();
		}
		
		/**
         * This function returns an html which will be created in the embedder. 
         */
        getHTML() {
			// create the content element
			let content = `<div style="display: flex;flex-direction: column;gap: 2rem;margin: 0.5rem;">
								<div style="margin:0;display: flex;gap: 2rem;">`;
			for (let i=0; i<this.data.Series.length; i++) {
				content += `<div style="padding: 2rem 2.5rem;
									background: rgb(255, 255, 255);
									box-shadow: 0px 4px 8px 0px rgba(0, 0, 0, 0.05),
												0px 8px 16px 0px rgba(0, 0, 0, 0.04),
												0px 12px 24px 0px rgba(0, 0, 0, 0.04);
									border-radius: 8px;">
								<p style="text-align: center; margin: 10px 0px" class="color-dimmed">
									${this.data.Series[i]}
								</p>
								<p style="text-align: center; margin: 10px 0px" class="bold" >
									${this.data.DataSet[0][this.data.Series[i]]}
								</p>
							</div>`;
			};
			content += `</div></div>`;
            return content;
        }
	}
	
	// defines the dependencies required for the chart
	const deps = [];

	// export the chart constructor so it will be used by the embedder.
    exports.default = MyChart;
    exports.deps = deps;
    Object.defineProperty(exports, '__esModule', { value: true });
	
});