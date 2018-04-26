// 参考 https://github.com/cssivision/qrcode-react 写的。

import React from 'react';
import _ from 'lodash';
import qr from 'qr.js';

function getBackingStorePixelRatio(ctx) {
  return (
    ctx.webkitBackingStorePixelRatio ||
    ctx.mozBackingStorePixelRatio ||
    ctx.msBackingStorePixelRatio ||
    ctx.oBackingStorePixelRatio ||
    ctx.backingStorePixelRatio ||
    1
  );
}

const defaultProps = {
  size: 128,
  bgColor: '#FFFFFF',
  fgColor: '#000000',
  value: '二维码',
};

export default class Component extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    debugAdd('qrcode', this);
  }

  componentWillMount = () => {}
  componentDidMount = () => {
    this.update();
  }

  shouldComponentUpdate = (nextProps) => {
    return !_.isEqual(nextProps, this.props);
  }

  componentDidUpdate = () => {
    this.update();
  }

  utf16to8 = (str) => {
    let out;
    const len = str.length;
    let c;
    out = '';
    for (let i = 0; i < len; i += 1) {
      c = str.charCodeAt(i);
      if ((0x0001 <= c) && (0x007F >= c)) {
        out += str.charAt(i);
      }
      else if (0x07FF < c) {
        out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));
        out += String.fromCharCode(0x80 | ((c >> 6) & 0x3F));
        out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
      }
      else {
        out += String.fromCharCode(0xC0 | ((c >> 6) & 0x1F));
        out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
      }
    }
    return out;
  }

  canvasRef = (canvas) => {
    this.canvas = canvas;
  }

  update = () => {
    const { value, size, fgColor, bgColor, logo, logoWidth, logoHeight } = Object.assign({}, defaultProps, this.props);
    const qrcode = qr(this.utf16to8(value));
    debugAdd('qrcode_qrcode', qrcode);
    const canvas = this.canvas;

    const ctx = canvas.getContext('2d');
    const cells = qrcode.modules;
    const tileW = size / cells.length;
    const tileH = size / cells.length;
    const scale = window.devicePixelRatio / getBackingStorePixelRatio(ctx);
    canvas.height = canvas.width = size * scale;
    ctx.scale(scale, scale);

    cells.forEach((row, rdx) => {
      row.forEach((cell, cdx) => {
        ctx.fillStyle = cell ? fgColor : bgColor;
        const w = (Math.ceil((cdx + 1) * tileW) - Math.floor(cdx * tileW));
        const h = (Math.ceil((rdx + 1) * tileH) - Math.floor(rdx * tileH));
        ctx.fillRect(Math.round(cdx * tileW), Math.round(rdx * tileH), w, h);
      }, this);
    }, this);

    if (logo) {
      const image = document.createElement('img');
      image.onload = () => {
        const dwidth = logoWidth || size * 0.2;
        const dheight = logoHeight || (image.height / image.width) * dwidth;
        const dx = (size - dwidth) / 2;
        const dy = (size - dheight) / 2;
        image.width = dwidth;
        image.height = dheight;
        ctx.drawImage(image, dx, dy, dwidth, dheight);
      };
      image.src = logo;
    }

    const { finishDraw } = this.props;
    if ('function' === typeof finishDraw) {
      finishDraw({
        dataUrl: canvas.toDataURL(),
      });
    }
  }

  render() {
    const { size = 128 } = Object.assign({}, defaultProps, this.props);

    return (<canvas ref={this.canvasRef} style={{ height: size, width: size }} height={size} width={size} />);
  }
}
