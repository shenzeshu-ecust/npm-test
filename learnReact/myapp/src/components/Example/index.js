/* eslint-disable jsx-a11y/alt-text */
import React, { Component } from "react";
import "./index.css";
export default class Search extends Component {
  render() {
    return (
      <div className="img__wrapper">
        <img /* 背景图片 */
          src="https://cdn.boomingtech.com/upload/612991cd58edf51b0efca4c1b3e84b6f.png"
          className="img"
        />
        <div className="header">
          {/* 头部logo等 */}
          <div className="logo">
            <img src="https://cdn.boomingtech.com/upload/01c1f0cd857c8a42d55979bced3507fd.png" />
            <img
              className="Gstar"
              src="https://cdn.boomingtech.com/upload/cd41619d26e6bc611d4e145b908242ed.png"
            />
          </div>
          <div className="right">
            <div className="media">
              <img
                className="wechat"
                src="https://cdn.boomingtech.com/upload/f79c00ca4f379f59ed726bf205f95f05.png"
              />
              <img
                className="qq"
                src="https://cdn.boomingtech.com/upload/14530bef5acaa6c575a01e7cb45c55ad.png"
              />
            </div>
            <img
              className="enter-official"
              src="https://cdn.boomingtech.com/upload/f8e9830828dd3bb96ac8bfc2ea9ba6a3.png"
            />
          </div>
        </div>
        <div className="age">
          <img src="https://cdn.boomingtech.com/upload/62aab272df77e78b78ae2b24f4a76fc5.png" />
          {/* 适龄提示 */}
        </div>
        <div className="side-img">
          <img src="https://cdn.boomingtech.com/upload/6ff008edf2ebb14df574a1873ee849bf.png" />
        </div>
        <div className="content">
          {/* 下载游戏 快速注册等 */}
          <img src="https://cdn.boomingtech.com/upload/136d1a297b853360622c7cc91ff2743c.png" />
          <div className="middle-content">
            <img src="https://cdn.boomingtech.com/upload/d6b21e269e98eb2ca4359cf4a1de194e.png" />
            <img src="https://cdn.boomingtech.com/upload/70742cc4803424be839e05e5a2f8da51.png" />
          </div>
          <img src="https://cdn.boomingtech.com/upload/7a2fe4539aef2fc6fc4995cbed5f84bc.png" />
        </div>
        <div className="more">
          <img src="https://cdn.boomingtech.com/upload/f90dc9446b3e304293451c8795efa1f8.png" />
          {/* 下拉查看更多 */}
        </div>
      </div>
    );
  }
}
