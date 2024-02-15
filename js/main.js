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

        const choroplethMap1 = new ChoroplethMap({
            parentElement: '#map1'
        }, geoData);

        const choroplethMap2 = new ChoroplethMap({
            parentElement: '#map2',
            geoDataFunc: function(d) {return d.properties.county_data.park_access;},
            axisTitle: "Park Access"
        }, geoData);

        const scatterplot = new Scatterplot({parentElement: '#chart-area'}, countyData);
        scatterplot.updateVis();

        const histogram1 = new Histogram({
            parentElement: '#histogram1',
            dataFunc: function(d) {return d.park_access;},
            axisTitle: "Park Access"
        }, countyData);
        histogram1.updateVis();

        const histogram2 = new Histogram({
            parentElement: '#histogram2'
        }, countyData);
        histogram2.updateVis();
    })
    .catch(error => {
        console.error('Error:');
        console.log(error);
    });
