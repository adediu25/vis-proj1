// global objects
let histogram1, histogram2, urbanHistogram, choroplethMap1, choroplethMap2, urbanMap, scatterplot, visList;

Promise.all([
    d3.json('data/usa_counties.json'),
    d3.csv('data/national_health_data.csv')
]).then(data => {
    let geoData = data[0];
    let countyData = data[1];    

        
        // set up county data
        countyData.forEach(d => {
            d.air_quality = +d.air_quality;
            d.display_name = d.display_name.slice(1,-1);
            d.education_less_than_high_school_percent = +d.education_less_than_high_school_percent;
            d.poverty_perc = +d.poverty_perc;
            d.elderly_percentage = +d.elderly_percentage;
            d.number_of_hospitals = +d.number_of_hospitals;
            d.median_household_income = +d.median_household_income;
            d.number_of_primary_care_physicians = +d.number_of_primary_care_physicians;
            d.percent_coronary_heart_disease = +d.percent_coronary_heart_disease;
            d.park_access = +d.park_access;
            d.percent_coronary_heart_disease = +d.percent_coronary_heart_disease;
            d.median_household_income = +d.median_household_income;
            d.percent_high_blood_pressure = +d.percent_high_blood_pressure;
            d.percent_high_cholesterol = +d.percent_high_cholesterol;
            d.percent_inactive = +d.percent_inactive;
            d.percent_no_heath_insurance = +d.percent_no_heath_insurance;
            d.percent_smoking = +d.percent_smoking;
            d.percent_stroke = +d.percent_stroke;
        });

        // Add county data to respective county in TopoJSON
        geoData.objects.counties.geometries.forEach(d => {
            // county_data will stay null if we do not have that county in the data
            d.properties.county_data = null
            for (let i = 0; i < countyData.length; i++) {
                if (d.id == countyData[i].cnty_fips) {
                    d.properties.county_data = countyData[i];
                }
            }
        });

        choroplethMap1 = new ChoroplethMap({
            parentElement: '#map1'
        }, geoData);

        choroplethMap2 = new ChoroplethMap({
            parentElement: '#map2',
            geoDataFunc: function(d) {return d.properties.county_data.park_access;},
            axisTitle: "Park Access"
        }, geoData);

        scatterplot = new Scatterplot({parentElement: '#scatterplot'}, countyData);
        scatterplot.updateVis();

        histogram1 = new Histogram({
            parentElement: '#histogram1'
        }, countyData);
        histogram1.updateVis();
        
        histogram2 = new Histogram({
            parentElement: '#histogram2',
            dataFunc: function(d) {return d.park_access;},
            axisTitle: "Park Access"
        }, countyData);
        histogram2.updateVis();
        
        urbanHistogram = new BarChart({
            parentElement: '#histogram3'
        }, countyData);
        urbanHistogram.updateVis();

        urbanMap = new CategoricalChoroplethMap({
            parentElement: '#map3'
        }, geoData);

        visList = [histogram1, histogram2, urbanHistogram, choroplethMap1, choroplethMap2, urbanMap, scatterplot];

    })
    .catch(error => {
        console.error('Error:');
        console.log(error);
    });

// event handler for first attribute dropdown
d3.select("#dataX").on("input", function(){
    visList.forEach(function(d) {d.resetBrush();});
    chooseX(getDataFunc(this.value), this.options[this.selectedIndex].innerHTML);
});

// event handler for second attribute dropdown
d3.select("#dataY").on("input", function(){
    visList.forEach(function(d) {d.resetBrush();});
    chooseY(getDataFunc(this.value), this.options[this.selectedIndex].innerHTML);
});

// listen for a custom event from html elements which contain the visualizations
// event is triggered by a brush start 
// then call for brush to be reset on every other visualization
d3.selectAll('.parent').on('brush-start', function(event){
    visList.filter(d => d.config.parentElement != event.srcElement.id).forEach(function(d) {d.resetBrush();});
});

// d3.selectAll('.parent').on('brush-start', function(event){
//     visList.filter(d => 
//         d.config.parentElement != event.srcElement.id).forEach(function(d) {
//             d.resetBrush(event.detail.brushedData);
//     });
// });

// d3.select('.parent').on('brush-selection', function(event){
//     // console.log(event.detail.brushedData);
//     histogram2.updateFromBrush(event.detail.brushedData);
//     scatterplot.updateFromBrush(event.detail.brushedData);
//     urbanHistogram.updateFromBrush(event.detail.brushedData);
//     choroplethMap1.updateFromBrush(event.detail.brushedData);
//     choroplethMap2.updateFromBrush(event.detail.brushedData);
//     urbanMap.updateFromBrush(event.detail.brushedData);
// });

// d3.select('#scatterplot').on('brush-selection', function(event){
//     // console.log(event.detail.brushedData);
//     histogram2.updateFromBrush(event.detail.brushedData);
//     histogram1.updateFromBrush(event.detail.brushedData);
//     urbanHistogram.updateFromBrush(event.detail.brushedData);
// });

// d3.select('#histogram3').on('brush-selection', function(event){
//     // console.log(event.detail.brushedData);
//     histogram2.updateFromBrush(event.detail.brushedData);
//     histogram1.updateFromBrush(event.detail.brushedData);
//     scatterplot.updateFromBrush(event.detail.brushedData);
// });

d3.select('#map1').on('brush-selection', function(event){
    // console.log(event.detail.brushedData);
    histogram2.updateFromBrush(event.detail.brushedData);
    histogram1.updateFromBrush(event.detail.brushedData);
    scatterplot.updateFromBrush(event.detail.brushedData);
    choroplethMap2.updateFromBrush(event.detail.brushedData);
    urbanMap.updateFromBrush(event.detail.brushedData);
    urbanHistogram.updateFromBrush(event.detail.brushedData);
});

d3.select('#map3').on('brush-selection', function(event){
    // console.log(event.detail.brushedData);
    histogram2.updateFromBrush(event.detail.brushedData);
    histogram1.updateFromBrush(event.detail.brushedData);
    scatterplot.updateFromBrush(event.detail.brushedData);
    choroplethMap2.updateFromBrush(event.detail.brushedData);
    choroplethMap1.updateFromBrush(event.detail.brushedData);
    urbanHistogram.updateFromBrush(event.detail.brushedData);
});

// returns anon function which will be given to each construct
// to specify which attribute to pull from data and graph
function getDataFunc(attr){
    switch (attr) {
        case "poverty_perc":
            return {dataFunc: function(d) {return d.poverty_perc}, geoDataFunc: function(d) {return d.properties.county_data.poverty_perc}};
        case "median_household_income":
            return {dataFunc: function(d) {return d.median_household_income}, geoDataFunc: function(d) {return d.properties.county_data.median_household_income}};
        case "education_less_than_high_school_percent":
            return {dataFunc: function(d) {return d.education_less_than_high_school_percent}, geoDataFunc: function(d) {return d.properties.county_data.education_less_than_high_school_percent}};
        case "air_quality":
            return {dataFunc: function(d) {return d.air_quality}, geoDataFunc: function(d) {return d.properties.county_data.air_quality}};
        case "park_access":
            return {dataFunc: function(d) {return d.park_access}, geoDataFunc: function(d) {return d.properties.county_data.park_access}};
        case "percent_inactive":
            return {dataFunc: function(d) {return d.percent_inactive}, geoDataFunc: function(d) {return d.properties.county_data.percent_inactive}};
        case "percent_smoking":
            return {dataFunc: function(d) {return d.percent_smoking}, geoDataFunc: function(d) {return d.properties.county_data.percent_smoking}};
        case "elderly_percentage":
            return {dataFunc: function(d) {return d.elderly_percentage}, geoDataFunc: function(d) {return d.properties.county_data.elderly_percentage}};
        case "number_of_hospitals":
            return {dataFunc: function(d) {return d.number_of_hospitals}, geoDataFunc: function(d) {return d.properties.county_data.number_of_hospitals}};
        case "number_of_primary_care_physicians":
            return {dataFunc: function(d) {return d.number_of_primary_care_physicians}, geoDataFunc: function(d) {return d.properties.county_data.number_of_primary_care_physicians}};
        case "percent_no_heath_insurance":
            return {dataFunc: function(d) {return d.percent_no_heath_insurance}, geoDataFunc: function(d) {return d.properties.county_data.percent_no_heath_insurance}};
        case "percent_high_blood_pressure":
            return {dataFunc: function(d) {return d.percent_high_blood_pressure}, geoDataFunc: function(d) {return d.properties.county_data.percent_high_blood_pressure}};
        case "percent_coronary_heart_disease":
            return {dataFunc: function(d) {return d.percent_coronary_heart_disease}, geoDataFunc: function(d) {return d.properties.county_data.percent_coronary_heart_disease}};
        case "percent_stroke":
            return {dataFunc: function(d) {return d.percent_stroke}, geoDataFunc: function(d) {return d.properties.county_data.percent_stroke}};
        case "percent_high_cholesterol":
            return {dataFunc: function(d) {return d.percent_high_cholesterol}, geoDataFunc: function(d) {return d.properties.county_data.percent_high_cholesterol}};
        default:
            break;
    }
}

// updates 1st data attr in charts
function chooseX(funcs, title){
    console.log(histogram1);
    histogram1.config.dataFunc = funcs.dataFunc;
    histogram1.config.axisTitle = title;
    histogram1.updateVis();

    choroplethMap1.config.geoDataFunc = funcs.geoDataFunc;
    choroplethMap1.config.axisTitle = title;
    choroplethMap1.updateVis();

    scatterplot.config.dataFuncX = funcs.dataFunc;
    scatterplot.config.axisTitleX = title;
    scatterplot.updateVis();
}

function chooseY(funcs, title){
    histogram2.config.dataFunc = funcs.dataFunc;
    histogram2.config.axisTitle = title;
    histogram2.updateVis();

    choroplethMap2.config.geoDataFunc = funcs.geoDataFunc;
    choroplethMap2.config.axisTitle = title;
    choroplethMap2.updateVis();

    scatterplot.config.dataFuncY = funcs.dataFunc;
    scatterplot.config.axisTitleY = title;
    scatterplot.updateVis();
}