import React from 'react';
import Exception from './exception';

export default class Component extends React.Component {
  // constructor(props) {
  //   super(props);
  // }

  render() {
    return (<Exception type="403" style={{ minHeight: 500, height: '80%' }} />);
  }
}
