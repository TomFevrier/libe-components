import React, { Component } from 'react'
import PropTypes from 'prop-types'
import * as d3 from 'd3'
import BlockTitle from '../../text-levels/BlockTitle'
import Paragraph from '../../text-levels/Paragraph'
import Chart from '../Chart.js'

/*
 *   Chart component : ScatterPlot
 *   ------------------------------------------------------
 *
 *   DESCRIPTION
 *   A scatterplot charts
 *
 *   PROPS
 *   title, description, data, bounds, x_ticks, y_ticks, show_x_grid,
 *   show_y_grid
 *
 */

export default class ScatterPlot extends Chart {
  /* * * * * * * * * * * * * * * * *
   *
   * CONSTRUCTOR
   *
   * * * * * * * * * * * * * * * * */
  constructor () {
    super()
    this.c = 'lblb-chart_scatter-plot'
    this.state = {
      index: 0
    }
    this.appendSvg = this.appendSvg.bind(this)
    this.defineScales = this.defineScales.bind(this)
    this.drawChart = this.drawChart.bind(this)
    this.drawAxes = this.drawAxes.bind(this)
    this.drawGrid = this.drawGrid.bind(this)
  }

  getWidth () {
    return d3.select(this.$root).node().parentNode.getBoundingClientRect().width
  }

  shouldComponentUpdate (prev, next) {
    return false
  }

  componentDidMount () {

    console.log(this.props)


    this.margin = {
      left: 40,
      bottom: 40,
      right: 20,
      top: 20
    }
    this.setState({ width: this.getWidth(), height: this.props.height}, () => {
      this.drawChart()
      this.animate()
    })

    let resizedFn;
    window.addEventListener('resize', () => {
        clearTimeout(resizedFn);
        resizedFn = setTimeout(() => {
            this.redrawChart();
        }, 50)
    });
  }

  appendSvg () {
    if (!this.$root) return
    this.svg = d3.select(this.$root).append('svg')
      .style('width', this.state.width)
      .style('height', this.state.height)
  }

  defineScales () {
    const { state, props } = this

    this.xScale = d3.scaleLinear()
      .domain([
        typeof props.bounds.min_x !== 'undefined' ?
          props.bounds.min_x : d3.min(props.data[state.index], e => e.x_value),
        typeof props.bounds.max_x !== 'undefined' ?
          props.bounds.max_x : d3.max(props.data[state.index], e => e.x_value)
      ])
      .rangeRound([this.margin.left, state.width - this.margin.right])

    this.yScale = d3.scaleLinear()
      .domain([
        typeof props.bounds.min_y !== 'undefined' ?
          props.bounds.min_y : d3.min(props.data[state.index], e => e.y_value),
        typeof props.bounds.max_y !== 'undefined' ?
          props.bounds.max_y : d3.max(props.data[state.index], e => e.y_value)
      ])
      .rangeRound([state.height - this.margin.bottom, this.margin.top])
  }

  updateScales () {
    const { state, props } = this

    this.xScale
      .domain([
        typeof props.bounds.min_x !== 'undefined' ?
          props.bounds.min_x : d3.min(props.data[state.index], e => e.x_value),
        typeof props.bounds.max_x !== 'undefined' ?
          props.bounds.max_x : d3.max(props.data[state.index], e => e.x_value)
      ])

    this.yScale
      .domain([
        typeof props.bounds.min_y !== 'undefined' ?
          props.bounds.min_y : d3.min(props.data[state.index], e => e.y_value),
        typeof props.bounds.max_y !== 'undefined' ?
          props.bounds.max_y : d3.max(props.data[state.index], e => e.y_value)
      ])
  }

  drawAxes () {
    const { state, props } = this

    this.xAxis = d3.axisBottom(this.xScale)
      .tickSizeOuter(0)
    this.yAxis = d3.axisLeft(this.yScale)
      .tickSizeOuter(0)

    if (props.x_ticks) {
      if (props.x_ticks.mode === 'number')
        this.xAxis.ticks(props.x_ticks.value)
      else
        this.xAxis.tickValues(d3.range(this.xScale.domain()[0], this.xScale.domain()[1] + 1, props.x_ticks.value))
    }

    if (props.y_ticks) {
      if (props.y_ticks.mode === 'number')
        this.yAxis.ticks(props.y_ticks.value)
      else
        this.yAxis.tickValues(d3.range(this.yScale.domain()[0], this.yScale.domain()[1] + 1, props.y_ticks.value))
    }

    this.svg.append('g')
    	.attr('class', 'axis x-axis')
    	.attr('transform', `translate(0, ${state.height - this.margin.bottom})`)
    	.call(this.xAxis)
  	this.svg.append('g')
  		.attr('class', 'axis y-axis')
  		.attr('transform', `translate(${this.margin.left}, 0)`)
  		.call(this.yAxis)

  }

  drawGrid () {
    const { state, props } = this

    this.xGrid = d3.axisBottom(this.xScale)
      .tickSizeInner(this.margin.top + this.margin.bottom - state.height)
      .tickFormat('')
    this.yGrid = d3.axisLeft(this.yScale)
      .tickSizeInner(this.margin.left + this.margin.right - state.width)
      .tickFormat('')

    if (props.x_ticks) {
      if (props.x_ticks.mode === 'number')
        this.xGrid.ticks(props.x_ticks.value)
      else
        this.xGrid.tickValues(d3.range(this.xScale.domain()[0], this.xScale.domain()[1] + 1, props.x_ticks.value))
    }

    if (props.y_ticks) {
      if (props.y_ticks.mode === 'number')
        this.yGrid.ticks(props.y_ticks.value)
      else
        this.yGrid.tickValues(d3.range(this.yScale.domain()[0], this.yScale.domain()[1] + 1, props.y_ticks.value))
    }

    this.svg.append('g')
      	.attr('class', 'grid x-grid')
      	.attr('transform', `translate(0, ${state.height - this.margin.bottom})`)
      	.call(this.xGrid)
        .call(g => g.select('.domain').remove())

  	this.svg.append('g')
  		.attr('class', 'grid y-grid')
  		.attr('transform', `translate(${this.margin.left}, 0)`)
  		.call(this.yGrid)
      .call(g => g.select('.domain').remove())
  }

  drawChart () {
    const { state, props } = this

    this.defineScales()
    this.appendSvg()
    this.drawGrid()
    this.drawAxes()

    const { xScale, yScale } = this
    d3.select('svg').selectAll('circle')
      .data(this.props.data[state.index]).enter()
        .append('circle')
          .attr('cx', d => xScale(d.x_value))
          .attr('cy', d => yScale(d.y_value))
          .attr('r', d => typeof d.radius === 'number' ? d.radius : props.radius)
          .attr('fill', d => typeof d.fill === 'string' ? d.fill : props.fill || 'black')
          .attr('stroke', d => typeof d.stroke === 'string' ? d.stroke : props.stroke || 'none')
          .attr('opacity', d => typeof d.opacity === 'number' ? d.opacity : props.opacity || 1)
  }

  redrawChart () {
    if (this.getWidth() !== this.state.width) {
      this.setState({ width: this.getWidth() })
      d3.select(this.$root).select('svg').remove()
      this.drawChart()
    }
  }

  async animate (index = 0) {

    await this.setState({ index: index })
    this.updateScales()

    const { state, props, xScale, yScale } = this

    d3.select('svg').selectAll('circle')
      .data(this.props.data[state.index])
        .transition()
        .duration(typeof props.animation_duration !== 'undefined' ? props.animation_duration : 200)
        .attr('cx', d => xScale(d.x_value))
        .attr('cy', d => yScale(d.y_value))
        .attr('r', d => typeof d.radius === 'number' ? d.radius : props.radius)
        .attr('fill', d => typeof d.fill === 'string' ? d.fill : props.fill || 'black')
        .attr('stroke', d => typeof d.stroke === 'string' ? d.stroke : props.stroke || 'none')
        .attr('opacity', d => typeof d.opacity === 'number' ? d.opacity : props.opacity || 1)

    if (props.x_ticks) {
      if (props.x_ticks.mode === 'number')
        this.xAxis.ticks(props.x_ticks.value)
      else
        this.xAxis.tickValues(d3.range(this.xScale.domain()[0], this.xScale.domain()[1] + 1, props.x_ticks.value))
    }

    if (props.y_ticks) {
      if (props.y_ticks.mode === 'number')
        this.yAxis.ticks(props.y_ticks.value)
      else
        this.yAxis.tickValues(d3.range(this.yScale.domain()[0], this.yScale.domain()[1] + 1, props.y_ticks.value))
    }

    this.svg.select('.x-grid')
      .transition()
      .duration(typeof props.animation_duration !== 'undefined' ? props.animation_duration : 200)
        .call(this.xGrid)
    this.svg.select('.y-grid')
      .transition()
      .duration(typeof props.animation_duration !== 'undefined' ? props.animation_duration : 200)
        .call(this.yGrid)
    this.svg.select('.x-axis')
      .transition()
      .duration(typeof props.animation_duration !== 'undefined' ? props.animation_duration : 200)
        .call(this.xAxis)
    this.svg.select('.y-axis')
      .transition()
      .duration(typeof props.animation_duration !== 'undefined' ? props.animation_duration : 200)
        .call(this.yAxis)

    if (this.props.autoplay) {
      setTimeout(() => {
        this.animate((this.state.index + 1) % this.props.data.length)
      }, typeof props.animation_delay !== 'undefined' ? props.animation_delay : 500)
    }
  }

  /* * * * * * * * * * * * * * * * *
   *
   * RENDER
   *
   * * * * * * * * * * * * * * * * */
  render () {
    const { c, props } = this

    console.log("render")

    /* Assign classes */
    const classes = [c]

    return <div ref={(n) => this.$root = n} className={classes.join(' ')}>
      <BlockTitle>{props.title}</BlockTitle>
      <Paragraph>{props.description}</Paragraph>
    </div>
  }
}

/* * * * * Prop types * * * * */

ScatterPlot.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  data: PropTypes.array
}
