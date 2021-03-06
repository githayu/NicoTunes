import { remote } from 'electron';
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { FloatingActionButton } from 'material-ui';
import { mylistActions, playActions } from '../actions';
import VideoItem from '../components/VideoItem';
import CreateContextMeun from '../utils/ContextMenu';

class MyList extends Component {
  static defaultProps = {
    sortOrder: [
      { label: '登録が新しい順', code: 1 },
      { label: '登録が古い順', code: 0 },
      { label: 'タイトル昇順', code: 4 },
      { label: 'タイトル降順', code: 5 },
      { label: 'マイリストコメント昇順', code: 2 },
      { label: 'マイリストコメント降順', code: 3 },
      { label: '投稿が新しい順', code: 6 },
      { label: '投稿が古い順', code: 7 },
      { label: '再生が多い順', code: 8 },
      { label: '再生が少ない順', code: 9 },
      { label: 'コメントが新しい順', code: 10 },
      { label: 'コメントが古い順', code: 11 },
      { label: 'コメントが多い順', code: 12 },
      { label: 'コメントが少ない順', code: 13 },
      { label: 'マイリスト登録が多い順', code: 14 },
      { label: 'マイリスト登録が少ない順', code: 15 },
      { label: '再生時間が長い順', code: 16 },
      { label: '再生時間が短い順', code: 17 }
    ]
  };

  contextMeun(video) {
    let menu = new CreateContextMeun(this, [
      'play',
      'playChorus',
      'nextPlay',
      'queueAdd',
      'separator',
      'videoDetail',
      'separator',
      'niconico',
      'nicofinder'
    ], video);

    remote.Menu.buildFromTemplate(menu).popup(remote.getCurrentWindow());
  }

  introductionCreator() {
    let result = [];

    for (let i = 0; i < 9; i++) {
      let video = this.props.mylist.selected.myListEntries.items[i],
          thumbnailUrl = video.video.thumbnailLargeUrl ? video.video.thumbnailLargeUrl : video.video.thumbnailUrl;

      result.push(
        <div key={video.id}
          style={{ backgroundImage: `url(${thumbnailUrl})` }}
        />
      );
    }

    return result;
  }

  play(video) {
    this.props.actions.playMusic({
      account: this.props.accounts.niconico.selected,
      video,
      videos: this.props.mylist.selected.myListEntries.items.map(video => video.video)
    });
  }

  sortOrderChange(e) {
    this.props.actions.getMylistVideos({
      account: this.props.accounts.niconico.selected,
      request: {
        id: this.props.mylist.selected.id,
        query: {
          sortOrderTypeCode: e.target.value
        }
      }
    });
  }

  render() {
    if (!this.props.mylist.selected) {
      return <div className="mylist-container" />;
    } else if (!this.props.mylist.selected.myListEntries.items.length) {
      return <div className="mylist-container">{'動画がありません'}</div>;
    }

    return (
      <div className="mylist-container">
        <figure className="mylist-introduction">{this.introductionCreator()}</figure>

        <div className="mylist-content">
          <header className="mylist-header">
            <div className="mylist-info">
              <h2>{this.props.mylist.selected.name}</h2>
              <span className="music-count">
                {`${this.props.mylist.selected.myListEntries.items.length}曲`}
              </span>
            </div>

            <div className="mylist-play-button">
              <FloatingActionButton
                iconClassName="icon"
                onClick={
                  this.play.bind(this, this.props.mylist.selected.myListEntries.items[0].video)
                }
              />
            </div>
          </header>

          <div className="mylist-action">
            <select
              className="mylist-sort"
              defaultValue={this.props.mylist.selected.sortType.code}
              onChange={::this.sortOrderChange}
            >
            {
              this.props.sortOrder.map(o => {
                return (
                  <option
                    key={o.code}
                    label={o.label}
                    value={o.code}
                  />
                );
              })
            }
            </select>
          </div>

          <ul className="video-list"
            ref="videoList"
          >
          {
            this.props.mylist.selected.myListEntries.items.map(video => {
              return (
                <VideoItem
                  onClick={this.play.bind(this, video.video)}
                  onContextMenu={this.contextMeun.bind(this, video.video)}
                  video={video.video}
                  active={this.props.play.active && video.video.id == this.props.play.video.id}
                  key={video.video.id}
                />
              );
            })
          }
          </ul>
        </div>
      </div>
    );
  }
}

export default connect(
  state => ({
    play: state.play,
    mylist: state.mylist,
    accounts: state.accounts,
    queue: state.queue
  }),
  dispatch => ({
    actions: bindActionCreators(Object.assign({}, mylistActions, playActions), dispatch)
  })
)(MyList);
