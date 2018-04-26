import moment from 'moment';
import _ from 'lodash';
import { DatePicker } from 'antd';
import styles from './index.less';

export default class Component extends React.Component {
  constructor(props) {
    super(props);
    this.format = this.props.format || 'YYYY-MM-DD';
    this.prefix = this.props.prefix || undefined;
    this.start = 'start';
    this.end = 'end';
    if (this.prefix) {
      this.start = `${this.prefix}_start`;
      this.end = `${this.prefix}_end`;
    }
    this.state = {
      [this.start]: null,
      [this.end]: null,
      endOpen: false,
    };
    debugAdd('data_range', this);
  }

  // 更新传输的 value
  componentWillReceiveProps = (nextProps) => {
    if (nextProps.prefix !== this.prefix) {
      window.console.warn('date_range：Cannot change prefix');
    }
    if ('value' in nextProps) {
      this.setState({
        [this.start]: _.get(nextProps, `value.${this.start}`) || null,
        [this.end]: _.get(nextProps, `value.${this.end}`) || null,
      });
    }
  }

  onChange = (field, value) => {
    const formatValue = value && value.format ? moment(value.format(this.format)) : null;
    this.setState({
      [field]: formatValue,
    });

    const onChange = this.props.onChange;
    if ('function' === typeof onChange) {
      onChange({
        [this.start]: this.state[this.start],
        [this.end]: this.state[this.end],
        [field]: formatValue,
      });
    }
  }

  onStartChange = (value) => {
    this.onChange(this.start, value);
  }

  onEndChange = (value) => {
    this.onChange(this.end, value);
  }

  disabledStartDate = (start) => {
    const end = this.state[this.end];
    if (!start || !end) {
      return false;
    }
    return start.valueOf() > end.valueOf();
  }

  disabledEndDate = (end) => {
    const start = this.state[this.start];
    if (!end || !start) {
      return false;
    }
    return end.valueOf() <= start.valueOf();
  }

  handleStartOpenChange = (open) => {
    if (!open) {
      this.setState({ endOpen: true });
    }
  }

  handleEndOpenChange = (open) => {
    this.setState({ endOpen: open });
  }

  render() {
    const startOption = {
      disabledDate: this.disabledStartDate,
      format: this.props.format,
      value: this.state[this.start],
      placeholder: '开始时间',
      onChange: this.onStartChange,
      onOpenChange: this.handleStartOpenChange,
      showTime: this.props.showTime,
    };

    const endOption = {
      disabledDate: this.disabledEndDate,
      format: this.props.format,
      value: this.state[this.end],
      placeholder: '结束时间',
      onChange: this.onEndChange,
      open: this.state.endOpen,
      onOpenChange: this.handleEndOpenChange,
      showTime: this.props.showTime,
    };
    const size = this.props.size || 'default';
    return (
      <div className={styles.dateranger} >
        <DatePicker size={size} {...startOption} showTime={this.props.showTime} />
        <DatePicker size={size} {...endOption} showTime={this.props.showTime} />
      </div>
    );
  }
}
