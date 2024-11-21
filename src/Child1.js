import React, { Component } from "react";
import "./Child1.css";
import * as d3 from "d3";

class Child1 extends Component {
  state = { 
    company: "Apple", // Default Company
    selectedMonth: 'November' //Default Month
  };

  handleCompanyChange = event => {
    this.setState({company: event.target.value});
  }

  handleMonthChange = event => {
    this.setState({selectedMonth: event.target.value});
  }

  componentDidMount() {
    console.log(this.props.csv_data) // Use this data as default. When the user will upload data this props will provide you the updated data
  
    // Setting up SVG
    const margin = {top: 50, bottom: 50, right: 50, left: 50}
    const width = 600;
    const height = 500;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    const svg = d3.select('#mysvg')
      .select('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Axis setup
    svg.selectAll('.x-axis')
      .data([0])
      .join('g')
      .attr('class',  'x-axis')
      .attr('transform', `translate(0, ${innerHeight})`)
    
    svg.selectAll('.y-axis')
      .data([0])
      .join('g')
      .attr('class', 'y-axis')

    
    this.updateModel(this.props.csv_data);
  }

  componentDidUpdate() {
    console.log(this.props.csv_data)
    
    const filteredData = this.props.csv_data.filter(
      (d) =>
        d.Company === this.state.company &&
        d3.timeFormat('%B')(d.Date) === this.state.selectedMonth
    );

    this.updateModel(filteredData);
  }

  updateModel(data) {
    const margin = {top: 50, bottom: 50, right: 50, left: 50}
    const width = 650;
    const height = 500;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select('#mysvg')
      .select('g');

    // Tooltip
    const tooltip = d3.select('body')
      .append('div')
      .attr('class', 'tooltip')

    // Creating scale
    const xScale = d3.scaleTime()
      .domain(d3.extent(data, d => d.Date))
      .range([0, innerWidth]);
    
    const yScale = d3.scaleLinear()
      .domain([
        d3.min(data, d => Math.min(d.Open, d.Close) - 0.3),
        d3.max(data, d => Math.max(d.Open, d.Close))
      ])
      .range([innerHeight, 0])

    // Create Axis
    svg.select('.x-axis')
      .call(d3.axisBottom(xScale));

    svg
      .select('.y-axis').call(d3.axisLeft(yScale));

    // Create line generators for open and close data
    const openLineGen = d3.line()
      .x(d => xScale(d.Date))
      .y(d => yScale(d.Open))
      .curve(d3.curveCardinal);

    const closeLineGen = d3.line()
      .x(d => xScale(d.Date))
      .y(d => yScale(d.Close))
      .curve(d3.curveCardinal);

    //Create the line path
    svg.selectAll('.open-line')
      .data([data])
      .join(
        enter => enter.append('path')
          .attr('class', 'open-line'),
        update => update,
        exit => exit.remove()
      )
      .attr('d', openLineGen);

    svg.selectAll('.close-line')
      .data([data])
      .join(
        enter => enter.append('path')
          .attr('class', 'close-line'),
        update => update,
        exit => exit.remove()
      )
      .attr('d', closeLineGen);
    
    // Create circles for tooltip
    svg.selectAll('.open-circle')
      .data(data)
      .join(
        enter => enter.append('circle')
          .attr('class', 'open-circle'),
        update => update,
        exit => exit.remove()
      )
      .attr('cx', d => xScale(d.Date))
      .attr('cy', d => yScale(d.Open))
      .attr('r', 5)
      .on('mouseover', (event, d) => {
        tooltip.style('display', 'block')
          .html(`<p>Date: ${d3.timeFormat('%m/%d/%Y')(d.Date)}</p>
                 <p>Open: ${d.Open.toFixed(2)}</p>
                 <p>Close: ${d.Close.toFixed(2)}</p>
                 <p>Difference: ${(d.Open -d.Close).toFixed(2)}</p>`)
      })
      .on('mousemove', event => {
        tooltip.style('top', `${event.pageY + 5}px`)
          .style('left', `${event.pageX + 5}px`)
      })
      .on('mouseout', () => {
        tooltip.style('display', 'none')
      });

    // Create the tooltip circles
    svg.selectAll('.close-circle')
      .data(data)
      .join(
        enter => enter.append('circle')
          .attr('class', 'close-circle'),
        update => update,
        exit => exit.remove()
      )
      .attr('cx', d => xScale(d.Date))
      .attr('cy', d => yScale(d.Close))
      .attr('r', 5)
      .on('mouseover', (event, d) => {
        tooltip.style('display', 'block')
          .html(`<p>Date: ${d3.timeFormat('%m/%d/%Y')(d.Date)}</p>
                 <p>Open: ${d.Open.toFixed(2)}</p>
                 <p>Close: ${d.Close.toFixed(2)}</p>
                 <p>Difference: ${(d.Open -d.Close).toFixed(2)}</p>`)
      })
      .on('mousemove', event => {
        tooltip.style('top', `${event.pageY + 5}px`)
          .style('left', `${event.pageX + 5}px`)
      })
      .on('mouseout', () => {
        tooltip.style('display', 'none')
      });

      // Create the legend
      const legendData = [
        { label: 'Open', color: '#b2df8a' },
        { label: 'Close', color: '#e41a1c' }
      ];

      const legend = svg.selectAll('.legend')
        .data(legendData)
        .join('g')
        .attr('class', 'legend')
        .attr('transform', (d, i) => `translate(${innerWidth + 10}, ${20 + i * 25})`);
      
      legend.append('rect')
        .attr('width', 20)
        .attr('height', 20)
        .attr('fill', d => d.color);
      
      legend.append('text')
        .attr('x', 22)
        .attr('y', 15)
        .attr('font-size', '20px')
        .style('font', '12px sans-serif')
        .text(d => d.label)
  }

  render() {
    const options = ['Apple', 'Microsoft', 'Amazon', 'Google', 'Meta']; // Use this data to create radio button
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']; // Use this data to create dropdown

    return (
      <div className="child1">
          <div className="company-radio">
            <p>Company:</p>
            {options.map((company) => (
              <div>
                <input
                  type="radio"
                  id={company}
                  value={company}
                  checked={this.state.company === company}
                  onChange={this.handleCompanyChange}
                />
                <label for={company}>{company}</label>
              </div>
            ))}
          </div>
          <div className="month-dropdown">
            <label for="months">Month: </label>
            <select id="months" value={this.state.selectedMonth} onChange={this.handleMonthChange}>
              {months.map((month) => (
                <option value={month}>{month}</option>
              ))}
            </select>
          </div>
          <div className="chart">
            <svg id="mysvg" width="700" height="600">
              <g></g>
            </svg>
          </div>
      </div>
    );
  }
}

export default Child1;
