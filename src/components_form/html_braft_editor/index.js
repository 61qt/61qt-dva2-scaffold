import BraftEditor from 'braft-editor';
import 'braft-editor/dist/braft.css';

import styles from './index.less';
import Services from '../../services';
import Filters from '../../filters';

export default class Component extends React.Component {
  constructor(props) {
    super(props);
    this.value = props.value || '';
    this.state = {
      key: '',
      value: props.value || '',
    };
    debugAdd('html_braft_editor', this);
  }

  componentDidMount = () => {
    this.newKey();
  }

  // 更新传输的 value
  componentWillReceiveProps = (nextProps) => {
    if ('value' in nextProps && nextProps.value !== this.state.value) {
      this.setState({
        value: nextProps.value || '',
      });
      this.newKey();
    }
  }

  onChange = (value) => {
    this.setState({
      value,
    });

    const onChange = this.props.onChange;
    if ('function' === typeof onChange) {
      onChange(value);
    }
  }

  newKey = () => {
    const key = `${new Date() * 1}_${Math.random()}`.replace('0.', '');
    window.console.log('newKey', key);
    this.setState({
      key,
    });
  }

  qiniuTokenFunc = () => {
    return Services.common.qiniuToken().then((res) => {
      const token = res.data;
      return token;
    }).catch((rej) => {
      return Promise.reject(rej);
    });
  }

  uploadFn = (options) => {
    const { file, success } = options;
    this.qiniuTokenFunc().then((token) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('token', token);
      Services.common.qiniuUpload(formData).then((res) => {
        const imgUrl = `${Filters.qiniuImage(res.hash) || ''}`.replace(/\?.+/, '');
        success({
          url: imgUrl,
        });
        return imgUrl;
      });
    });
  }

  render() {
    const controls = ['undo', 'redo', 'split', 'font-size', 'font-family', 'line-height', 'letter-spacing',
      'indent', 'text-color', 'bold', 'italic', 'underline', 'strike-through',
      'superscript', 'subscript', 'remove-styles', 'emoji', 'text-align', 'split', 'headings', 'list_ul',
      'list_ol', 'blockquote', 'code', 'split', 'link', 'split', 'hr', 'split', 'media', 'clear'];
    const excludeControls = [];
    const media = {
      allowPasteImage: true, // 是否允许直接粘贴剪贴板图片（例如QQ截图等）到编辑器
      image: true, // 图片插入功能
      video: false, // 视频插入功能
      audio: false, // 音频插入功能
      validateFn: null, // 指定本地校验函数，说明见下文
      uploadFn: this.uploadFn, // 指定上传函数，说明见下文
      removeConfirmFn: null, // 指定删除前的确认函数，说明见下文
      onRemove: null, // 指定媒体库文件被删除时的回调，参数为被删除的媒体文件列表(数组)
      onChange: null, // 指定媒体库文件列表发生变化时的回调，参数为媒体库文件列表(数组)
      onInsert: null, // 指定从媒体库插入文件到编辑器时的回调，参数为被插入的媒体文件列表(数组)
    };
    return (
      <div className={styles.normal}>
        <BraftEditor
          media={media}
          contentFormat="html"
          controls={controls}
          excludeControls={excludeControls}
          onChange={this.onChange}
          initialContent={this.state.value}
          contentId={this.state.key} />
      </div>
    );
  }
}
