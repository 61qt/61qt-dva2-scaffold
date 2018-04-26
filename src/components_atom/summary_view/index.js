import React from 'react';
import _ from 'lodash';
import { Spin } from 'antd';

import styles from './index.less';

export default class Component extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    debugAdd('detail_view', this);
  }

  componentWillMount = () => {}

  render() {
    const { dataSource, columns, title, loading = false, className } = this.props;
    let titleElem = title;
    if ('function' === typeof title) {
      titleElem = title();
    }

    return (
      <Spin spinning={loading}>
        <div className={styles.normal}>
          <div className={className}>
            <div className={styles.header}>
              { titleElem }
            </div>
            <div className={styles.content}>
              <table className={styles.scrollBar}>
                <tr>
                  {
                    columns.map((elem, index) => {
                      const text = _.get(dataSource, elem.dataIndex);
                      return (<td className={styles.summaryItem} key={elem.key || index}>
                        <div className="sum-item">
                          <div className="sum-item-desc">
                            { elem.title }
                          </div>
                          <div className={`sum-item-value ${elem.valueClassName}`}>
                            { elem.render ? elem.render(text, dataSource) : text }
                          </div>
                        </div>
                      </td>);
                    })
                  }
                </tr>
              </table>
            </div>
          </div>
        </div>
      </Spin>
    );
  }
}
