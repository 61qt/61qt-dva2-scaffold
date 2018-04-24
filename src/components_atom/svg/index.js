import React from 'react';
import { connect } from 'dva';

import './index.less';

class Component extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    let link = this.props.link;
    if (link.default) {
      link = link.default;
    }

    return (<svg className={`svg ${this.props.className || ''}`} style={this.props.style}>
      <use xlinkHref={`${link.url || link.id}`} />
    </svg>);
  }
}

function mapStateToProps() {
  return {};
}

export default connect(mapStateToProps)(Component);
