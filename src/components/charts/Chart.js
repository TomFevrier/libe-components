import React, { Component } from 'react'
import PropTypes from 'prop-types'
import * as d3 from 'd3'
import BlockTitle from '../text-levels/BlockTitle'
import Paragraph from '../text-levels/Paragraph'

/*
 *   Chart component
 *   ------------------------------------------------------
 *
 *   DESCRIPTION
 *   A superclass for all charts
 *
 *   PROPS
 *   title, description, data, bounds, x_ticks, y_ticks, show_x_grid,
 *   show_y_grid
 *
 */

export default class Chart extends Component {
  /* * * * * * * * * * * * * * * * *
   *
   * CONSTRUCTOR
   *
   * * * * * * * * * * * * * * * * */
  constructor () {
    super()
    this.c = 'lblb-chart'
    this.appendSvg = this.appendSvg.bind(this)
    this.defineScales = this.defineScales.bind(this)
    this.drawChart = this.drawChart.bind(this)
    this.drawAxes = this.drawAxes.bind(this)
    this.drawGrid = this.drawGrid.bind(this)
  }

  getWidth () {
    return d3.select(this.$root).node().parentNode.getBoundingClientRect().width
  }

  componentDidMount () {
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

  /* * * * * * * * * * * * * * * * *
   *
   * RENDER
   *
   * * * * * * * * * * * * * * * * */
  render () {
    const { c, props } = this

    /* Assign classes */
    const classes = [c]

    return <div ref={(n) => this.$root = n} className={classes.join(' ')}>
      <BlockTitle>{props.title}</BlockTitle>
      <Paragraph>{props.description}</Paragraph>
    </div>
  }
}

/* * * * * Prop types * * * * */

Chart.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  data: PropTypes.array
}
