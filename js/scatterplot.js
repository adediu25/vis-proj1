class Scatterplot {
    constructor(_config, _data) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 700,
            containerHeight: _config.containerHeight || 500,
            margin: _config.margin || {top: 30, right: 20, bottom: 20, left: 35},
            tooltipPadding: _config.tooltipPadding || 10,
            dataFuncX: _config.dataFuncX || function(d){return d.median_household_income;},
            dataFuncY: _config.dataFuncY || function(d){return d.park_access;},
            axisTitleX: _config.axisTitleX || "Median Household Income (USD)",
            axisTitleY: _config.axisTitleY || "Park Access"
        }
        this.data = _data;
        this.initVis();
    }

    initVis(){
        let vis = this;

        vis.svg = d3.select(vis.config.parentElement)
            .append("svg")
                .attr("width", vis.config.containerWidth)
                .attr("height", vis.config.containerHeight)

        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;
    
        vis.xScale = d3.scaleLinear()
            .range([0, vis.width])
    
        vis.yScale = d3.scaleLinear()
            .range([vis.height, 0]);    

        vis.xAxis = d3.axisBottom(vis.xScale);

        vis.yAxis = d3.axisLeft(vis.yScale);
        
        vis.chart = vis.svg.append('g')
            .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);
    
        vis.xAxisG = vis.chart.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(0,${vis.height})`);

        vis.yAxisG = vis.chart.append('g')
            .attr('class', 'axis y-axis');

        vis.chart.append('text')
            .attr('class', 'x-axis-title')
            .attr('y', vis.height - 15)
            .attr('x', vis.width + 10)
            .attr('dy', '.71em')
            .style('text-anchor', 'end')
            .text(vis.config.axisTitleX);

        vis.svg.append('text')
            .attr('class', 'y-axis-title')
            .attr('x', 0)
            .attr('y', 0)
            .attr('dy', '.71em')
            .text(vis.config.axisTitleY);
    }

    updateVis() {
        let vis = this;

        vis.xScale.domain([0, d3.max(vis.data, vis.config.dataFuncX)]);
        vis.yScale.domain([0, d3.max(vis.data, vis.config.dataFuncY)]);

        vis.renderVis();
    }

    renderVis() {
        let vis = this;

        // update x axis label
        vis.chart.selectAll('.x-axis-title').join('text')
            .attr('class', 'x-axis-title')
            .attr('y', vis.height - 15)
            .attr('x', vis.width + 10)
            .attr('dy', '.71em')
            .style('text-anchor', 'end')
            .text(vis.config.axisTitleX);

        vis.svg.selectAll('.y-axis-title').join('text')
            .attr('class', 'y-axis-title')
            .attr('x', 0)
            .attr('y', 0)
            .attr('dy', '.71em')
            .text(vis.config.axisTitleY);

        const circles = vis.chart.selectAll('circle')
                // filter out data not collected
                .data(vis.data.filter(d => vis.config.dataFuncX(d) >= 0 && vis.config.dataFuncY(d) >= 0))
            .join('circle')
                .attr('r', 3)
                .attr('cy', d => vis.yScale(vis.config.dataFuncY(d)))
                .attr('cx', d => vis.xScale(vis.config.dataFuncX(d)))
                .attr('fill', 'steelblue');

        circles
            .on('mouseover', (event,d) => {
                d3.select('#tooltip')
                .style('display', 'block')
                .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')   
                .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
                .html(`
                    <div class="tooltip-title">${d.display_name}</div>
                    <div><i>${d.urban_rural_status}</i></div>
                    <ul>
                    <li>${vis.config.axisTitleX}: ${vis.config.dataFuncX(d)}</li>
                    <li>${vis.config.axisTitleY}: ${vis.config.dataFuncY(d)}</li>
                    </ul>
                `);
            })
            .on('mouseleave', () => {
                d3.select('#tooltip').style('display', 'none');
            });
   
        vis.xAxisG
            .call(vis.xAxis)

        vis.yAxisG
            .call(vis.yAxis)
    }
}
