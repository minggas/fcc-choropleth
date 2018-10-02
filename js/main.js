const endCountry =
  "https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json";

const endEducation =
  "https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json";

const width = 960,
  height = 580;

const tooltip = d3
  .select("body")
  .append("div")
  .attr("id", "tooltip")
  .style("opacity", 0);

const svg = d3
  .select(".container")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

const legendColor = d3
  .scaleThreshold()
  .domain(d3.range(2.6, 75.1, (75.1 - 2.6) / 8))
  .range(d3.schemeBlues[9]);

const path = d3.geoPath().projection(scale(0.85));

d3.json(endCountry).then(us => {
  d3.json(endEducation).then(edu => {
    svg
      .append("g")
      .attr("class", "usa")
      .selectAll("path")
      .data(topojson.feature(us, us.objects.states).features)
      .enter()
      .append("path")
      .attr("class", "state")
      .attr("d", path)
      .attr("stroke", "#fff")
      .attr("transform", "translate(50,60)");

    svg
      .append("g")
      .attr("class", "counties")
      .selectAll("path")
      .data(topojson.feature(us, us.objects.counties).features)
      .enter()
      .append("path")
      .attr("class", "county")
      .attr("d", path)
      .attr("transform", "translate(50,60)")
      .attr("data-fips", d => edu.filter(obj => obj.fips === d.id)[0].fips)
      .attr(
        "data-education",
        d => edu.filter(obj => obj.fips === d.id)[0].bachelorsOrHigher
      )
      .attr("fill", d =>
        legendColor(edu.filter(obj => obj.fips === d.id)[0].bachelorsOrHigher)
      )
      .style("opacity", 0.8)
      .on("mouseover", d => {
        tooltip.style("opacity", 1);
        tooltip
          .html(`${getKeyByValue(edu, d.id)}`)
          .attr(
            "data-education",
            edu.filter(obj => obj.fips === d.id)[0].bachelorsOrHigher
          )
          .style("left", d3.event.pageX + 15 + "px")
          .style("top", d3.event.pageY - 5 + "px");
      })
      .on("mouseout", d => {
        tooltip.style("opacity", 0);
      });

    const legendX = d3
      .scaleQuantile()
      .domain(legendColor.domain())
      .range([0, 30, 60, 90, 120, 150, 180, 210]);

    const legendXAxis = d3
      .axisRight(legendX)
      .tickSize(35)
      .tickFormat(d => Math.round(d) + "%")
      .tickValues(legendColor.domain());

    const legend = svg
      .append("g")
      .attr("id", "legend")
      .attr("transform", "translate(900,200)");

    legend
      .selectAll("rect")
      .data(legendColor.domain())
      .enter()
      .append("rect")
      .attr("y", (d, i) => 0 + i * 30)
      .attr("width", 30)
      .attr("height", 30)
      .style("fill", d => legendColor(d));

    legend
      .append("g")
      .attr("class", "y-axis")
      .call(legendXAxis)
      .select(".domain")
      .remove();

    svg
      .append("text")
      .attr("id", "title")
      .attr("text-anchor", "middle")
      .style("font-size", "2.5rem")
      .text("United States Educational Attainment")
      .attr("x", width / 2)
      .attr("y", 30);

    svg
      .append("text")
      .attr("id", "description")
      .attr("text-anchor", "middle")
      .style("font-size", "1rem")
      .text(
        "Percentage of adults age 25 and older with a bachelor's degree or higher (2010-2014)"
      )
      .attr("x", width / 2)
      .attr("y", 60);
  });
});

function getKeyByValue(object, value) {
  var result = object.filter(obj => {
    return obj.fips === value;
  });
  return `${result[0].area_name}, ${result[0].state}: ${
    result[0].bachelorsOrHigher
  }%`;
}

function scale(scaleFactor) {
  return d3.geoTransform({
    point: function(x, y) {
      this.stream.point(x * scaleFactor, y * scaleFactor);
    }
  });
}
