import React from 'react'
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
  constructor (props) {
    super(props)

    this.c = ['lblb-chart', 'lblb-chart_scatter-plot']

    this.margin = {
      left: 40,
      bottom: 40,
      right: 20,
      top: 20
    }
    this.duration = typeof props.animation_duration !== 'undefined' ? props.animation_duration : 200
    this.delay = typeof props.animation_delay !== 'undefined' ? props.animation_delay : 500

    // [WIP] Sort data to prevent smaller circles from being hidden under large ones

    this.state = {
      index: 0
    }

    this.defineScales = this.defineScales.bind(this)
    this.updateScales = this.updateScales.bind(this)
    this.drawAxes = this.drawAxes.bind(this)
    this.updateAxes = this.updateAxes.bind(this)
    this.drawGrid = this.drawGrid.bind(this)
    this.updateGrid = this.updateGrid.bind(this)
    this.drawChart = this.drawChart.bind(this)
  }

  componentDidMount () {
    super.componentDidMount()
  }

  defineScales () {
    const { state } = this

    this.xScale = d3.scaleLinear()
      .rangeRound([this.margin.left, state.width - this.margin.right])

    this.yScale = d3.scaleLinear()
      .rangeRound([state.height - this.margin.bottom, this.margin.top])
  }

  updateScales () {
    const { state, props } = this

    this.xScale
      .domain([
        (typeof props.bounds.min_x !== 'undefined') ?
          props.bounds.min_x :
          d3.min(
            props.data.filter(e => e.index === state.index),
            d => d.x_value
          ),
        (typeof props.bounds.max_x !== 'undefined') ?
          props.bounds.max_x :
          d3.max(
            props.data.filter(e => e.index === state.index),
            d => d.x_value
          )
      ])

    this.yScale
      .domain([
        (typeof props.bounds.min_y !== 'undefined') ?
          props.bounds.min_y :
          d3.min(
            props.data.filter(e => e.index === state.index),
            d => d.y_value
          ),
        (typeof props.bounds.max_y !== 'undefined') ?
          props.bounds.max_y :
          d3.max(
            props.data.filter(e => e.index === state.index),
            d => d.y_value
          )
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

  updateAxes () {
    const { props } = this

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

    this.svg.select('.x-axis')
      .transition()
      .duration(this.duration)
      .ease(d3.easeLinear)
        .call(this.xAxis)

    this.svg.select('.y-axis')
      .transition()
      .duration(this.duration)
      .ease(d3.easeLinear)
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

  updateGrid () {
    const { props } = this

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

    this.svg.select('.x-grid')
      .transition()
      .duration(this.duration)
      .ease(d3.easeLinear)
        .call(this.xGrid)

    this.svg.select('.y-grid')
      .transition()
      .duration(this.duration)
      .ease(d3.easeLinear)
        .call(this.yGrid)
  }

  drawChart () {
    super.appendSvg()
    this.defineScales()
    this.drawGrid()
    this.drawAxes()
    this.animate()
  }

  async animate (index = 0) {

    await this.setState({ index: index })

    this.updateScales()
    this.updateGrid()
    this.updateAxes()

    const { state, props, xScale, yScale } = this

    const selection = this.svg.selectAll('circle')
      .data(this.props.data.filter(e => e.index === state.index))

    selection.transition()
      .duration(this.duration)
        .attr('cx', d => xScale(d.x_value))
        .attr('cy', d => yScale(d.y_value))
        .attr('r', d => typeof d.radius === 'number' ? d.radius : props.radius)
        .attr('fill', d => typeof d.fill === 'string' ? d.fill : props.fill || 'black')
        .attr('stroke', d => typeof d.stroke === 'string' ? d.stroke : props.stroke || 'none')
        .attr('opacity', d => typeof d.opacity === 'number' ? d.opacity : props.opacity || 1)

    selection.enter()
      .append('circle')
        .attr('cx', d => xScale(d.x_value))
        .attr('cy', d => yScale(d.y_value))
        .attr('r', d => typeof d.radius === 'number' ? d.radius : props.radius)
        .attr('fill', d => typeof d.fill === 'string' ? d.fill : props.fill || 'black')
        .attr('stroke', d => typeof d.stroke === 'string' ? d.stroke : props.stroke || 'none')
        .attr('opacity', d => typeof d.opacity === 'number' ? d.opacity : props.opacity || 1)

    if (props.autoplay) {
      setTimeout(() => {
        if (state.index < d3.max(props.data, d => d.index))
          this.animate(this.state.index + 1)
      }, this.delay)
    }
  }

  /* * * * * * * * * * * * * * * * *
   *
   * RENDER
   *
   * * * * * * * * * * * * * * * * */
  render () {
    const { c, props } = this

    /* Assign classes */
    const classes = c

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
  height: PropTypes.number,
  fill: PropTypes.string,
  stroke: PropTypes.string,
  radius: PropTypes.number,
  animation_duration: PropTypes.number,
  animation_delay: PropTypes.number,
  x_ticks: PropTypes.shape({
    mode: PropTypes.string,
    value: PropTypes.number
  }),
  y_ticks: PropTypes.shape({
    mode: PropTypes.string,
    value: PropTypes.number
  }),
  show_x_grid: PropTypes.bool,
  show_y_grid: PropTypes.bool,
  animated: PropTypes.bool,
  autoplay: PropTypes.bool,
  data: PropTypes.arrayOf(PropTypes.shape({
    index: PropTypes.number,
    x_value: PropTypes.number,
    y_value: PropTypes.number
  })),
}
