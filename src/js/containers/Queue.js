import { remote } from 'electron';
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { IconButton } from 'material-ui';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import classNames from 'classnames';
import QueueItem from './QueueItem';
import { queueActions, playActions } from '../actions';
import CreateContextMeun from '../utils/ContextMenu';
import flow from 'lodash.flow';

class Queue extends Component {
  constructor(props) {
    super(props);

    this.state = {
      dragging: false
    };
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.queue.active && this.props.queue.active && this.props.queue.items.length && this.props.play.video) {
      let index = (() => {
        for (let i = 0; i < this.props.queue.items.length; i++) {
          if (this.props.queue.items[i].id === this.props.play.video.id) return i;
        }
      })();

      this.refs.queue.scrollTop = (index * 56) + (this.refs.header.clientHeight - 56);
    }
  }

  contextMeun(video) {
    let menu = new CreateContextMeun(this, [
      'play',
      'playChorus',
      'nextPlay',
      'queueDelete',
      'separator',
      'videoDetail',
      'separator',
      'niconico',
      'nicofinder'
    ], video);

    remote.Menu.buildFromTemplate(menu).popup(remote.getCurrentWindow());
  }

  dragAction(bool) {
    this.setState({
      dragging: bool
    });
  }

  queueItemsRender() {
    if (!this.props.queue.items.length) return;

    return (
      this.props.queue.items.map(video => {
        return (
          <QueueItem
            type="item"
            video={video}
            active={this.props.play.active && video.id == this.props.play.video.id}
            key={video.id}
            sortAction={::this.props.actions.queueController}
            dragAction={::this.dragAction}
            onClick={this.props.actions.playMusic.bind(this, {
              account: this.props.accounts.niconico.selected,
              video: video,
              videos: []
            })}
            onContextMenu={this.contextMeun.bind(this, video)}
          />
        );
      })
    );
  }

  render() {
    if (this.props.queue.items == null) {
      return <div className="queue"></div>;
    } else if (!this.props.queue.items.length) {
      return <div className="queue"></div>;
    }

    return (
      <div ref="queue"
        className={classNames({
          queue: true,
          active: this.props.queue.active
        })}
      >
        <div className="queue-content">
          <header
            className="queue-header"
            ref="header"
          >
            <div className="queue-info">
              <h2>再生キュー</h2>
              <span className="music-count">{`${this.props.queue.items.length}曲`}</span>
              <div className="queue-action">
                <IconButton
                  onClick={this.props.actions.queueController.bind(this, {
                    type: 'shuffle'
                  })}
                  tooltip="シャッフル"
                  tooltipPosition="bottom-center"
                  iconClassName="queue-shuffle"
                />
                <IconButton
                  onClick={this.props.actions.queueController.bind(this, {
                    type: 'clear',
                    item: this.props.play.video
                  })}
                  tooltip="消去"
                  tooltipPosition="bottom-left"
                  iconClassName="queue-clear"
                />
              </div>
            </div>
          </header>

          <ul
            className={classNames({
              'queue-video-list': true,
              'dragging': this.state.dragging
            })}
          >{ this.queueItemsRender() }</ul>
        </div>
      </div>
    );
  }
}

export default flow(
  DragDropContext(
    HTML5Backend
  ),
  connect(
    state => ({
      play: state.play,
      queue: state.queue,
      accounts: state.accounts
    }),
    dispatch => ({
      actions: bindActionCreators(Object.assign({}, queueActions, playActions), dispatch)
    })
  )
)(Queue);
