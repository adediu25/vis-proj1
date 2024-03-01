# Health in the USA

**Built by Alexandru Dediu**

[Live Webpage](https://adediu25.github.io/vis-proj1/).

This web based application was built as a tool for users to view and analyze various attributes of data collected by counties in the United States. The data includes various demographics and health related statistics.

The app gives a user the freedom to make their own conclusions and analysis about health in the USA by providing different visualization methods and allowing the user to interact with the visualizations through data attribute selection and data filtering.

## Data

The data visualized in the app is from [US Heart and Stroke Atlas](https://www.cdc.gov/dhdsp/maps/atlas/index.htm) from the Centers for Disease Control and Prevention. Statistics are per individual county. Data may not be available from all counties for some data attributes.

Below is a list of data attributes available in the app:
- Poverty percentage
- Median household income: in US dollars
- Education less than high school percentage
- Air quality: annual PM<sub>2.5</sub> level
- Park access: percentage
- Percent physically inactive
- Percent smokers
- Elderly percentage
- Number of hospitals
- Number of primary care physicians
- Percent with no health insurance
- Percent with high blood pressure
- Percent with coronary heart disease
- Stroke prevalence percentage
- High cholesterol prevalence percentage
- Urban-rural status: counties are identified as urban, suburban, small city, or rural

## Visualization Components

Across the web page, three data attributes will be visualized at a time. 

Urban-rural status will always be visualized in its own visualizations. 

The other two attributes can be changed by selecting the desired statistic in the two drop down menus at the top. Making a new selection will update visualizations accordingly. Visualizations are described in more detail below.

Each visualization also allows for additional interaction, described below.

### Brushing Interactions

![image](https://github.com/adediu25/vis-proj1/assets/71360172/7c833d6f-9850-4dea-9635-ac07c85c12cf)

Clicking and dragging on any visualization will create a brushing box. 
This brush essentially selects all the data represented by the visualization elements within the brush box. 
All of the other visualizations on the page will update to reflect the new subset of data that was selected.

### Tooltip Interactions

![image](https://github.com/adediu25/vis-proj1/assets/71360172/bad5b340-63dc-4f85-8e47-f417eab3c247)

Hovering the cursor over any data element on a visualization will reveal more detailed information about that specific element in a tooltip.

### Histogram

![image](https://github.com/adediu25/vis-proj1/assets/71360172/5df97934-89bd-4830-a3fb-e976dc3e9074)

There are three histogram visualizations on the page. Two at the top, and one at the bottom of the page. 

Histograms show the distribution of data values across all counties. 
Equal-width bins are created based on the data attribute, and counties are placed into respective bins, which appear as bars on the histogram. 
The height of the bar corresponds to the frequency/count of counties that are in that bin.

The two histograms at the top visualize one data attribute each, which can be changed using the dropdown menus.
Attribute 1 corresponds to the left histogram and attribute 2 corresponds to the right histogram.
The histogram at the bottom will always visualize urban-rural status.

The histograms allow for a horizontal brush. 
The bars that are not included in the selection will change to gray.
The other visualizations will update with the filtered data set, which includes only the counties that are within the selected bins.

A histogram that is updated upon a selection from another visualization will create a new visualization and new set of bins specifically for the filtered subset.

Hovering over a bar on a histogram will reveal the data range for the bin as well as the number of counties represented in that bin.

### Choropleth Map

![image](https://github.com/adediu25/vis-proj1/assets/71360172/58fd8f2b-2d27-4a94-a6f8-ad857ce2993f)

Three choropleth maps can be found on page, two below the histograms and one at the bottom next to the urban-rural status histogram.

Choropleth maps display data on a geographical map.
The area of the county will be filled in with a color scale based on the data value of that county.
The color scale is shown in a legend under the map.
Counties which are missing data for the attribute being visualized will be filled in with a gray diagonal striping.

The two adjecent maps visualize one data attribute each, which can be changed using the dropdown menus.
Attribute 1 corresponds to the left map and attribute 2 corresponds to the right map.
The map at the bottom will always visualize urban-rural status data.

The maps allow for a 2D brush interaction.
Upon completing a selection, the counties not included in the selection will change to gray, and the counties selected within the brush will update the other visualizations.

After updating from a selection in another visualization, the map will display selected counties using the color scale and unselected counties as gray.

Hovering over a county on the map will reveal aditional information, including county name and state, urban-rural status, and the value of the data attribute.

### Scatterplot

![image](https://github.com/adediu25/vis-proj1/assets/71360172/ceec84c0-c64e-4ee3-991f-520a1b5a3744)

There is one scatterplot located below the maps.

Scatterplots show correlation between two data attributes.
Each axis represents one data attribute.
One point on the scatterplot represents a county, and its position on the 2D plane is based on its value for the two attributes.

Data attributes visualized in the scatterplot can be chosen using the dropdown menus.
Attribute 1 corresponds to the horizontal axis and attribute 2 corresponds to the vertical axis.

The scatterplot allows for a 2D brush interaction.
Upon completing a selection, the points not included in the selection will change to gray, and the counties selected within the brush will update the other visualizations.

After updating from a selection in another visualization, the scatterplot will display selected counties as blue and unselected counties as gray.
This maintains the overall context of the data while still highlighting the selected data.

Hovering over a point in the scatterplot will reveal aditional information, including county name and state, urban-rural status, and the values of the two data attributes.

## Visualization Discoveries

The goal of this application is to give the user many visualizations and options in order to make their own insightful and creative conclusions from the data. 
Comparisons in data distributions can be made using the histograms.
Correlation between data attributes are revealed by the scatterplot.
The maps can spark additional conclusions by displaying the data geographically, something that is not captured in the other visualization.
Brushing interactions allow a user to focus on a portion of the data.
The focus could be on a specific range of data, or a specific geographic region using the map.

I was curious to see the relationship between median household income and park access.
My initial thought was that higher income would be associated with more park access.
The scatterplot shows that there is a slight positive correlation between income and park access, but not as much as I was expecting.
However, an interesting observation is how much higher the park access is in the western US.
It makes sense by how expansive the west is, but the difference is very abrupt.

Screenshots for my insights can be seen above.

## Development Process

### Visual Design

#### Color

I decided on a steel blue color pallete for the visualization.
I think it is a pleasant color to look at and it seems familiar.
I kept the same color in all the visualization so that everything seems cohesive.

For the map color scale, I used a blue single hue continuous color scale.
All data attributes displayed using the maps are continuous.
The start and end colors for the scale came from a choropleth map example, and it fits in perfect with the rest of the steel blue visualizations.

As for the third map displaying urban-rural status, I used the same color scale as the other maps.
However, I turned it into a sequential color scale with 4 evenly spaced colors.
Urban-rural status makes sense as sequential data.

For unselected data during brushing interactions, I change the color of those to gray.
In the scatterplot, I also add some transparency to the gray circles so that they do not obscure the points that are selected and blue.

#### Visual Layout

All decisions were based on a 1920x1080 display.

I centered all the elements on the page as I think that looks clean and more user friendly.

I decided to place related visualization next to each other, in rows two or less.
A user would need to scroll on the page to see all the visualization (at 100% zoom).
I felt that it was not a good idea to try and fit all the visualizations into view without needing to scroll.
There are 7 total visualizations.
I think that shrinking them enough to fit all 7 would lead to too much detail loss, especially with the maps.
I also considered the tooltips, which would cover other visualization or be displayed off the side of the page if the page was too cluttered.
Last, I believe that it would be too overwhelming for the average user to see all the visualizations at once.
Zooming out will allow all visualizations to be in view if that is desired.

#### Visualization Updating

Histogram: 

The histograms update to visualize the subset of data that is selected. 
It makes more sense to get a more detailed/zoomed in view of the distribution of data selected.
There is also no intuitive way that I could think of to display the subset histogram within the original histogram

Map: 

The map is simple and intuitive.
I retain the whole map, it would not make sense any other way.
Selected counties are filled with the respective color while unselected counties are gray.

Scatterplot:

The scatterplot will always display all counties on the visualization.
When a selection is made, unselected counties are grayed out.
This helps keep the context of the original data, which can add further insight for the user.

### Program Design

Source code can be accessed at [GitHub](https://github.com/adediu25/vis-proj1), and a live version is hosted on [GitHub Pages](https://adediu25.github.io/vis-proj1/).
Otherwise, hosting the repository on a server and accessing the index.html file will have the running app.

The two libraries used in creating this application are [D3](https://d3js.org/) and [TopoJSON](https://github.com/topojson/topojson).

#### Code Structure

Below is list of Javascript files and a description of their function/purpose:

- main.js
  - Loads county data
  - Loads GeoJSON data and adds county data to county objects in GeoJSON
  - Instantiates new objects for each visualization
  - Handles all iter-visualization updates (changing attributes, linking brush selections)
- histogram.js
  - defines Histogram class
  - initializes, updates, and renders histogram visualizations
  - implements interactivity for histograms
- barChart.js
  - defines BarChart class
  - almost identical to histogram.js with some modifications to make it work with the urban-rural status categorical data
- choroplethMap.js
  - defines ChoroplethMap class
  - initializes, updates, and renders choropleth map visualizations
  - implements interactivity for maps
- categoricalChoroplethMap.js
  - defines CategoricalChoroplethMap class
  - almost identical to histogram.js with some modifications to make it work with the urban-rural status categorical data
- scatterplot.js
  - defines Scatterplot class
  - initializes, updates, and renders scatterplot visualizations
  - implements interactivity for scatterplots

Below is the abstracted workflow of how visualizations are updated upon a brush selection:

1. User starts brushing
2. Object sends event to parent element signaling a brush start
3. Event handled in main.js, calls `resetBrush()` on all other visualization objects. This ensures max one brush is active at once across the whole page
4. User ends brush selection
5. Object sends event to parent element signaling brush end and includes the filtered data set
6. Event handled in main.js, calls `updateFromBrush(filteredData)` on all other visualization objects
7. Each visualization object updates the visualization using the filtered data

## Future Works

Known bugs/issues to fix:
- Horizontal axis labels for histograms do not update on data attribute changes. Currently, the axis label is only added in `initVis`, and it needs to be moved to `renderVis` to update the label. Easy fix, I just did not realize this issue before turning in the code.
- State lines appear behind the map and they can be seen on the brush when brushing outside of the map.
- Brush boxes cannot be resized or moved while the cursor is on a visualization element.

Future Ideas/Goals:
- Performance optimization
- Dark mode
- Trying out different layouts, colors, etc.
- User customizability

## Video Demo

[Youtube Link](https://youtu.be/Gl5kUxIxzxI)
