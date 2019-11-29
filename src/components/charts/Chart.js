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
    this.getWidth = this.getWidth.bind(this)
    this.appendSvg = this.appendSvg.bind(this)
    this.defineScales = this.defineScales.bind(this)
    this.drawChart = this.drawChart.bind(this)
    this.redrawChart = this.redrawChart.bind(this)
    this.drawAxes = this.drawAxes.bind(this)
    this.drawGrid = this.drawGrid.bind(this)
  }

  getWidth () {
    return d3.select(this.$root).node().parentNode.getBoundingClientRect().width
  }

  componentDidMount () {
    let onResize;
    window.addEventListener('resize', () => {
        clearTimeout(onResize);
        onResize = setTimeout(this.redrawChart, 50)
    });
    this.setState({ width: this.getWidth(), height: this.props.height}, () => {
      this.drawChart()
    })
  }

  shouldComponentUpdate (prev, next) {
    // [WIP]
    return false
  }

  appendSvg () {
    if (!this.$root) return
    this.svg = d3.select(this.$root).append('svg')
      .style('width', this.state.width)
      .style('height', this.state.height)
  }

  drawChart() {}

  redrawChart () {
    if (this.getWidth() !== this.state.width) {
      this.setState({ width: this.getWidth() })
      d3.select(this.$root).select('svg').remove()
      this.drawChart()
    }
  }

  // render () {
  //   const { c, props } = this
  //
  //   /* Assign classes */
  //   const classes = c
  //
  //   return <div ref={(n) => this.$root = n} className={classes.join(' ')}>
  //     <BlockTitle>{props.title}</BlockTitle>
  //     <Paragraph>{props.description}</Paragraph>
  //   </div>
  // }

}

/* * * * * Prop types * * * * */

Chart.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  data: PropTypes.array
}
