import React from 'react';
import _ from 'lodash';
import { connect } from 'dva';

@connect((state) => {
  return {
    areaState: state.area,
  };
})
export default class Component extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    debugAdd('area', this);
  }

  render() {
    if (!this.props.areaId) {
      return (<span />);
    }
    const name = _.get(this.props.areaState, `key.${this.props.areaId}.name`) || '';
    return (<span>{ name }</span>);
  }
}
