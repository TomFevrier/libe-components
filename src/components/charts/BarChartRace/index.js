import React from 'react'
import PropTypes from 'prop-types'
import * as d3 from 'd3' // [WIP] Only import the modules we need
import BlockTitle from '../../text-levels/BlockTitle'
import Paragraph from '../../text-levels/Paragraph'
import Chart from '../Chart.js'

/*
 *   Chart component : BarChartRace
 *   ------------------------------------------------------
 *
 *   DESCRIPTION
 *   A bar chart race
 *
 *   PROPS
 *   title, description, animation_duration, fill, show_x_grid, show_y_grid,
 *   x_ticks, top_n, autoplay, animated, data
 *
 */

export default class BarChartRace extends Chart {
  /* * * * * * * * * * * * * * * * *
   *
   * CONSTRUCTOR
   *
   * * * * * * * * * * * * * * * * */
  constructor (props) {
    super(props)

    this.c = ['lblb-chart', 'lblb-chart_bar-chart-race']
    this.margin = {
      left: 20,
      bottom: 20,
      right: 20,
      top: 40
    }
    this.duration = typeof props.animation_duration !== 'undefined' ? props.animation_duration : 200
    this.state = {
      year: 2000
    }

    this.defineScales = this.defineScales.bind(this)
    this.updateScales = this.updateScales.bind(this)
    this.drawAxes = this.drawAxes.bind(this)
    this.updateAxes = this.updateAxes.bind(this)
    this.drawGrid = this.drawGrid.bind(this)
    this.updateGrid = this.updateGrid.bind(this)
    this.onEnter = this.onEnter.bind(this)
    this.onUpdate = this.onUpdate.bind(this)
    this.onExit = this.onExit.bind(this)
    this.drawChart = this.drawChart.bind(this)
  }

  componentDidMount () {
    super.componentDidMount()
  }

  defineScales () {
    const { state, props } = this

    this.xScale = d3.scaleLinear()
      .rangeRound([this.margin.left, state.width - this.margin.right])

    this.yScale = d3.scaleBand()
      .domain(d3.range(props.top_n + 1))
      .rangeRound([this.margin.top, state.height])
      .padding(0.1)
  }

  updateScales () {
    const { state, props } = this

    this.xScale.domain([0, d3.max(props.data.filter(e => new Date(e.date).getFullYear() === state.year), e => e.value)])
  }

  drawAxes () {
    const { state, props } = this

    this.xAxis = d3.axisTop(this.xScale)
      .tickSizeOuter(0)
    this.yAxis = d3.axisLeft(this.yScale)
      .tickSize(0)
      .tickFormat('')

    if (props.x_ticks) {
      if (props.x_ticks.mode === 'number')
        this.xAxis.ticks(props.x_ticks.value)
      else
        this.xAxis.tickValues(d3.range(this.xScale.domain()[0], this.xScale.domain()[1] + 1, props.x_ticks.value))
    }

    this.svg.append('g')
    	.attr('class', 'axis x-axis')
    	.attr('transform', `translate(0, ${this.margin.top})`)
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

    this.svg.select('.x-axis')
      .transition()
      .duration(this.duration)
      .ease(d3.easeLinear)
        .call(this.xAxis)
  }

  drawGrid () {
    const { state, props } = this

    this.xGrid = d3.axisTop(this.xScale)
      .tickSizeInner(this.margin.top + this.margin.bottom - state.height)
      .tickFormat('')

    if (props.x_ticks) {
      if (props.x_ticks.mode === 'number')
        this.xGrid.ticks(props.x_ticks.value)
      else
        this.xGrid.tickValues(d3.range(this.xScale.domain()[0], this.xScale.domain()[1] + 1, props.x_ticks.value))
    }

    this.svg.append('g')
      	.attr('class', 'grid x-grid')
      	.attr('transform', `translate(0, ${this.margin.top})`)
      	.call(this.xGrid)
  }

  updateGrid () {
    const { props } = this

    if (props.x_ticks) {
      if (props.x_ticks.mode === 'number')
        this.xGrid.ticks(props.x_ticks.value)
      else
        this.xGrid.tickValues(d3.range(this.xScale.domain()[0], this.xScale.domain()[1] + 1, props.x_ticks.value))
    }

    this.svg.select('.x-grid')
      .transition()
      .duration(this.duration)
      .ease(d3.easeLinear)
        .call(this.xGrid)
  }

  drawChart () {
    super.appendSvg()
    this.defineScales()
    this.drawGrid()
    this.drawAxes()
    this.animate()
  }

  onEnter (enter) {
    const { props, xScale, yScale } = this

    const bar = enter.append('g')
      .attr('class', 'bar')
      .attr('id', d => d.name.replace(/\s/g, '-'))
      .attr('transform', `translate(${xScale(0)}, ${yScale(props.top_n)})`)
      .style('opacity', 0)

    bar.transition()
      .duration(this.duration)
      .ease(d3.easeLinear)
        .attr('transform', d => `translate(${xScale(0)}, ${yScale(d.rank)})`)
        .style('opacity', 1)

    bar.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', d => xScale(d.value) - xScale(0))
      .attr('height', yScale.bandwidth())
      .attr('fill', d => typeof d.fill === 'string' ? d.fill : props.fill || 'black')
      .attr('opacity', d => typeof d.opacity === 'number' ? d.opacity : props.opacity || 1)

    bar.append('text')
      .attr('x', d => xScale(d.value) - xScale(0))
      .attr('y', yScale.bandwidth() / 2 + 4)
      .text(d => `${d.name} ${d.value / 1000}`)
      .attr('text-anchor', 'end')
  }

  onUpdate (update) {
    const { props, xScale, yScale } = this

    update.transition()
      .duration(this.duration)
      .ease(d3.easeLinear)
        .attr('transform', d => `translate(${xScale(0)}, ${yScale(d.rank)})`)
    update.select('rect')
      .transition()
      .duration(this.duration)
      .ease(d3.easeLinear)
        .attr('width', d => xScale(d.value) - xScale(0))
    update.select('text')
      .transition()
      .duration(this.duration)
      .ease(d3.easeLinear)
        .attr('x', d => xScale(d.value) - xScale(0))
        .text(d => `${d.name} ${d.value / 1000}`)
  }

  onExit (exit) {
    const { props, xScale, yScale } = this

    exit.transition()
      .duration(this.duration)
      .ease(d3.easeLinear)
        .attr('transform', d => `translate(${xScale(0)}, ${yScale(props.top_n)})`)
        .style('opacity', 0)
        .remove()
  }

  async animate (year = 2000) {

    await this.setState({ year: year })

    this.updateScales()
    this.updateGrid()
    this.updateAxes()

    const { state, props } = this

    const data = props.data
      .filter(e => new Date(e.date).getFullYear() === state.year)
      .sort((a, b) => b.value - a.value)
      .map((e, i) => { return {...e, rank: i} })
      .splice(0, props.top_n)

    this.svg.selectAll('.bar')
      .data(data, d => d.name)
      .join(this.onEnter, this.onUpdate, this.onExit)


    if (this.props.autoplay) {
      setTimeout(() => {
        if (state.year < 2019) this.animate(state.year + 1)
      }, this.duration)
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

BarChartRace.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  fill: PropTypes.string,
  animation_duration: PropTypes.number,
  x_ticks: PropTypes.shape({
    mode: PropTypes.string,
    value: PropTypes.number
  }),
  top_n: PropTypes.number,
  show_x_grid: PropTypes.bool,
  show_y_grid: PropTypes.bool,
  animated: PropTypes.bool,
  autoplay: PropTypes.bool,
  data: PropTypes.arrayOf(PropTypes.shape({
    date: PropTypes.date,
    name: PropTypes.string,
    value: PropTypes.number
  }))
}
