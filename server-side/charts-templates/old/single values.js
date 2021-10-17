
define(["exports"], function (exports) {
  "use strict";

	Object.defineProperty(exports, "__esModule", {
    value: true
  });

	class MyChart {
		chart;
		constructor(element, configuration) {
			this.chart = element;	
		}
		
			// set the data to the chart
		update(data) {
			// create ui object
			// <div class="rows">
            //     <div class="content row">
            //         <div class="info-chart chart-background">
                      
            //             <p class="bold" >{{dashboardData?.LastSync?.Time}} UTC </p>
            //         </div>
    
            //         <div class="info-chart chart-background">
                        
            //             <p class="bold" >{{dashboardData?.JobTimeUsage?.Percantage}}%</p>
            //         </div>       
            //     </div>
            // </div>
              
	

			let content = `<div style="display: flex;flex-direction: column;gap: 2rem;margin: 0.5rem;">
								<div style="margin:0;display: flex;gap: 2rem;">`;
			for (let i=0; i<this.data.series.length; i++) {
				content += `<div style="padding: 2rem 2.5rem;background: rgb(255, 255, 255);
									box-shadow: 0px 4px 8px 0px rgba(0, 0, 0, 0.05),
									0px 8px 16px 0px rgba(0, 0, 0, 0.04),
									0px 12px 24px 0px rgba(0, 0, 0, 0.04);
									border-radius: 8px;">
								<p style="margin: 0;text-align: center;
									margin: 10px 0px" class="color-dimmed">
										${this.data.series[i]}
								</p>
								<p style="text-align: center;margin: 10px 0px"class="bold" >
										${this.data.values[0][this.data.series[i]]}
								</p>
							</div>`;
			};
			content += '</div></div>';
			this.chart.innerHTML = content;
		}
	}
	const deps = [];

	exports.default = MyChart;
	exports.deps = deps;

});
