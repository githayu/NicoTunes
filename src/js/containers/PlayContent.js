import { ipcRenderer } from 'electron';
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Tabs, Tab } from 'material-ui';
import classNames from 'classnames';
import Utils from '../utils/Utils';
import { appActions } from '../actions';
import LocalStorageController from '../utils/LocalStorageController';

class PlayContent extends Component {
  static defaultProps = {
    slides: [
      {
        value: 'details',
        label: '詳細'
      }, {
        value: 'lyrics',
        label: '歌詞'
      }
    ],

    detailTable: [
      {
        value: 'vocalist',
        label: 'ボーカリスト'
      }, {
        value: 'producer',
        label: 'プロデューサー'
      }, {
        value: 'animator',
        label: '動画製作者'
      }, {
        value: 'label',
        label: 'レーベル'
      }, {
        value: 'circle',
        label: 'サークル'
      }, {
        value: 'other',
        label: 'その他'
      }, {
        value: 'band',
        label: 'バンド'
      }, {
        value: 'nothing',
        label: 'その他'
      }
    ],

    appLocalStorage: new LocalStorageController('app')
  };

  constructor(props) {
    super(props);
    ipcRenderer.send('mainWindowResize', 'playing');
  }

  componentWillUpdate(prevProps) {
    if ((!this.props.play.vocaDB || !this.props.play.vocaDB.lyrics.length) &&
        (prevProps.play.selectedTab === 'lyrics' && this.props.play.selectedTab === 'lyrics')) {
      this.slideChanger('details');
    }
  }

  componentWillUnmount() {
    ipcRenderer.send('mainWindowResize', 'default');
  }

  onAlbumClick(id) {
    console.log(id);
  }

  onArtistClick(id) {
    console.log(id);
  }

  playHeadRender() {
    let renderThumbnailUrl = this.props.play.video.thumbnailLargeUrl ?
                             this.props.play.video.thumbnailLargeUrl :
                             this.props.play.video.thumbnailUrl,
        renderTitle,
        renderArtistName;

    if (!this.props.play.vocaDB) {
      renderTitle = this.props.play.video.title;
      renderArtistName = Utils.URLParamDecoder(decodeURIComponent(this.props.play.audioUrl)).artist;
    } else {
      renderTitle = this.props.play.vocaDB.defaultName;
      renderArtistName = this.props.play.vocaDB.artistString;
    }

    return (
      <div
        className={classNames({
          'play-info': true,
          'active': this.props.play.selectedTab !== 'views'
        })}
        onClick={::this.playVideo}
        style={{
          backgroundImage: `url(${renderThumbnailUrl})`
        }}
      >
        <div className="play-info-inner">
          <figure
            className="play-thumbnail"
            style={{
              backgroundImage: `url(${renderThumbnailUrl})`
            }}
          />
          <div className="play-meta">
            <h1 className="play-title">{ renderTitle }</h1>
            <p className="play-artist-name">{ renderArtistName }</p>
          </div>
        </div>
      </div>
    );
  }

  playVideo() {
    this.props.play.audio.pause();
    ipcRenderer.send('videoWindow', this.props.play.video.id);
  }

  slideChanger(value) {
    this.props.actions.tateChanger('play', { selectedTab: value });
  }

  videoInfoRender() {
    return (
      <div className="play-tab-content">
        <div
          className={classNames({
            'play-details': true,
            'selected': this.props.play.selectedTab === 'details'
          })}
        >
          <table className="play-details-table">
            <tbody>
              <tr><th>タイトル</th><td>{ this.props.play.video.title }</td></tr>
              <tr><th>投稿日時</th><td>{ Utils.FormatDateString(this.props.play.video.firstRetrieve) }</td></tr>
              <tr><th>タグ</th><td className="play-detail-tags">{ this.props.play.video.tags.map(tag => {
                return (
                  <a key={tag.name}>{tag.name}</a>
                );
              }) }</td></tr>
              <tr><th>説明文</th><td dangerouslySetInnerHTML={{__html: this.props.play.video.description }} /></tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  vocaloidInfoRender() {
    var renderAlbum = [],
        renderLyrics = [];

    // 歌詞があれば
    if (this.props.play.vocaDB.lyrics.length) {
      let lyricsInfo = this.props.play.vocaDB.lyrics.filter(lyrics => lyrics.language === 'Japanese')[0];

      renderLyrics = (
        <div
          className={classNames({
            'play-lyrics': true,
            'selected': this.props.play.selectedTab === 'lyrics'
          })}
        >
        {
          lyricsInfo.value.split(/(\r?\n){2,}/g).map((section, i) => {
            return (
              <div key={`lyrics-section-${i}`}>{section.split(/\r?\n/g).map((line, i) => {
                return (
                  <p key={`lyrics-line-${i}`}>{line}</p>
                );
              })}</div>
            );
          })
        }
        </div>
      );
    }

    // アルバムがあれば。
    if (this.props.play.vocaDB.albums.length) {
      renderAlbum = (
      <tr key="albums">
        <th>アルバム</th>
        <td>
          <ul className="play-detail-table-list">
            {
              this.props.play.vocaDB.albums.map((album, i) => {
                return (
                  <li
                    className="link"
                    onClick={this.onAlbumClick.bind(this, album.id)}
                    key={`album-${i}`}
                  >{album.name}</li>
                );
              })
            }
          </ul>
        </td>
      </tr>
      );
    }

    return (
      <div className="play-tab-content">
        <div
          className={classNames({
            'play-details': true,
            'selected': this.props.play.selectedTab === 'details'
          })}
        >
          <table className="play-details-table">
            <tbody>
              <tr>
                <th>タイトル</th>
                <td>{ this.props.play.vocaDB.defaultName }</td>
              </tr>

              {
                this.props.detailTable.map(artistType => {
                  let artists = this.props.play.vocaDB.artists.filter(artist => {
                    return artist.categories === Utils.CapitalizeFirstLetter(artistType.value);
                  });

                  if (!artists.length) return;

                  return (
                    <tr key={`detail-${artistType.value}`}>
                      <th>{artistType.label}</th>
                      <td>
                        <ul className="play-detail-table-list">
                        {
                          artists.map((artist, i) => {
                            let artistClickLink = ('artist' in artist) ? {
                              onClick: this.onArtistClick.bind(this, artist.artist.id)
                            } : {};

                            return (
                              <li
                                className={classNames({
                                  link: Object.keys(artistClickLink).length
                                })}
                                { ...artistClickLink }
                                key={`vocalist-${i}`}
                              >{artist.name}</li>
                            );
                          })
                        }
                        </ul>
                      </td>
                    </tr>
                  );
                })
              }

              <tr>
                <th>楽曲タイプ</th>
                <td>{ this.props.play.vocaDB.songType }</td>
              </tr>
              <tr>
                <th>投稿日時</th>
                <td>{ Utils.FormatDateString(this.props.play.video.firstRetrieve) }</td>
              </tr>

              { renderAlbum }
            </tbody>
          </table>
        </div>

        { renderLyrics }

      </div>
    );
  }

  render() {
    return (
      <div className="play-content">
        { this.playHeadRender() }

        <Tabs
          onChange={::this.slideChanger}
          className="play-tabs"
          tabItemContainerStyle={{
            borderBottom: '1px rgba(0,0,0,.15) solid',
            position: 'relative',
            zIndex: 1
          }}
          inkBarStyle={{
            height: '3px',
            marginTop: '-3px',
            zIndex: 2
          }}
        >
        {
          (() => {
            let slides = [];

            for (let i = 0, slide; slide = this.props.slides[i]; i++) {
              if (slide.value == 'lyrics' && (!this.props.play.vocaDB || !this.props.play.vocaDB.lyrics.length)) continue;

              slides.push(
                <Tab
                  key={slide.value}
                  label={slide.label}
                  value={slide.value}
                />
              );
            }

            return slides;
          })()
        }
        </Tabs>

        {(() => this.props.play.vocaDB ? this.vocaloidInfoRender() : this.videoInfoRender())()}
      </div>
    );
  }
}

export default connect(
  state => ({
    app: state.app,
    play: state.play,
    queue: state.queue,
    accounts: state.accounts
  }),
  dispatch => ({
    actions: bindActionCreators(appActions, dispatch)
  })
)(PlayContent);
