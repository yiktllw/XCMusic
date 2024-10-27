// From YesPlay Music

module.exports = [
    {
        identifier: 'user_update',
        route: '/user/update',
        module: require('@yiktllw/ncm-api/module/user_update'),
    },
    {
        identifier: 'user_subcount',
        route: '/user/subcount',
        module: require('@yiktllw/ncm-api/module/user_subcount'),
    },
    {
        identifier: 'user_replacephone',
        route: '/user/replacephone',
        module: require('@yiktllw/ncm-api/module/user_replacephone'),
    },
    {
        identifier: 'user_record',
        route: '/user/record',
        module: require('@yiktllw/ncm-api/module/user_record'),
    },
    {
        identifier: 'user_playlist',
        route: '/user/playlist',
        module: require('@yiktllw/ncm-api/module/user_playlist'),
    },
    {
        identifier: 'user_level',
        route: '/user/level',
        module: require('@yiktllw/ncm-api/module/user_level'),
    },
    {
        identifier: 'user_follows',
        route: '/user/follows',
        module: require('@yiktllw/ncm-api/module/user_follows'),
    },
    {
        identifier: 'user_followeds',
        route: '/user/followeds',
        module: require('@yiktllw/ncm-api/module/user_followeds'),
    },
    {
        identifier: 'user_event',
        route: '/user/event',
        module: require('@yiktllw/ncm-api/module/user_event'),
    },
    {
        identifier: 'user_dj',
        route: '/user/dj',
        module: require('@yiktllw/ncm-api/module/user_dj'),
    },
    {
        identifier: 'user_detail',
        route: '/user/detail',
        module: require('@yiktllw/ncm-api/module/user_detail'),
    },
    {
        identifier: 'user_cloud_detail',
        route: '/user/cloud/detail',
        module: require('@yiktllw/ncm-api/module/user_cloud_detail'),
    },
    {
        identifier: 'user_cloud_del',
        route: '/user/cloud/del',
        module: require('@yiktllw/ncm-api/module/user_cloud_del'),
    },
    {
        identifier: 'user_cloud',
        route: '/user/cloud',
        module: require('@yiktllw/ncm-api/module/user_cloud'),
    },
    {
        identifier: 'user_bindingcellphone',
        route: '/user/bindingcellphone',
        module: require('@yiktllw/ncm-api/module/user_bindingcellphone'),
    },
    {
        identifier: 'user_binding',
        route: '/user/binding',
        module: require('@yiktllw/ncm-api/module/user_binding'),
    },
    {
        identifier: 'user_audio',
        route: '/user/audio',
        module: require('@yiktllw/ncm-api/module/user_audio'),
    },
    {
        identifier: 'user_account',
        route: '/user/account',
        module: require('@yiktllw/ncm-api/module/user_account'),
    },
    {
        identifier: 'toplist_detail',
        route: '/toplist/detail',
        module: require('@yiktllw/ncm-api/module/toplist_detail'),
    },
    {
        identifier: 'toplist_artist',
        route: '/toplist/artist',
        module: require('@yiktllw/ncm-api/module/toplist_artist'),
    },
    {
        identifier: 'toplist',
        route: '/toplist',
        module: require('@yiktllw/ncm-api/module/toplist'),
    },
    {
        identifier: 'topic_sublist',
        route: '/topic/sublist',
        module: require('@yiktllw/ncm-api/module/topic_sublist'),
    },
    {
        identifier: 'topic_detail_event_hot',
        route: '/topic/detail/event/hot',
        module: require('@yiktllw/ncm-api/module/topic_detail_event_hot'),
    },
    {
        identifier: 'topic_detail',
        route: '/topic/detail',
        module: require('@yiktllw/ncm-api/module/topic_detail'),
    },
    {
        identifier: 'top_song',
        route: '/top/song',
        module: require('@yiktllw/ncm-api/module/top_song'),
    },
    {
        identifier: 'top_playlist_highquality',
        route: '/top/playlist/highquality',
        module: require('@yiktllw/ncm-api/module/top_playlist_highquality'),
    },
    {
        identifier: 'top_playlist',
        route: '/top/playlist',
        module: require('@yiktllw/ncm-api/module/top_playlist'),
    },
    {
        identifier: 'top_mv',
        route: '/top/mv',
        module: require('@yiktllw/ncm-api/module/top_mv'),
    },
    {
        identifier: 'top_list',
        route: '/top/list',
        module: require('@yiktllw/ncm-api/module/top_list'),
    },
    {
        identifier: 'top_artists',
        route: '/top/artists',
        module: require('@yiktllw/ncm-api/module/top_artists'),
    },
    {
        identifier: 'top_album',
        route: '/top/album',
        module: require('@yiktllw/ncm-api/module/top_album'),
    },
    {
        identifier: 'song_url',
        route: '/song/url/v1',
        module: require('@yiktllw/ncm-api/module/song_url_v1'),
    },
    {
        identifier: 'song_download_url',
        route: '/song/download/url',
        module: require('@yiktllw/ncm-api/module/song_download_url'),
    },
    {
        identifier: 'song_detail',
        route: '/song/detail',
        module: require('@yiktllw/ncm-api/module/song_detail'),
    },
    {
        identifier: 'simi_mv',
        route: '/simi/mv',
        module: require('@yiktllw/ncm-api/module/simi_mv'),
    },
    {
        identifier: 'simi_artist',
        route: '/simi/artist',
        module: require('@yiktllw/ncm-api/module/simi_artist'),
    },
    {
        identifier: 'search',
        route: '/search/result',
        module: require('@yiktllw/ncm-api/module/search'),
    },
    {
        identifier: 'search_default',
        route: '/search/default',
        module: require('@yiktllw/ncm-api/module/search_default'),
    },
    {
        identifier: 'search_suggest',
        route: '/search/suggest',
        module: require('@yiktllw/ncm-api/module/search_suggest'),
    },
    {
        identifier: 'search_hot',
        route: '/search/hot/detail',
        module: require('@yiktllw/ncm-api/module/search_hot'),
    },
    {
        identifier: 'search_multimatch',
        route: '/search/multimatch',
        module: require('@yiktllw/ncm-api/module/search_multimatch'),
    },
    {
        identifier: 'scrobble',
        route: '/scrobble',
        module: require('@yiktllw/ncm-api/module/scrobble'),
    },
    {
        identifier: 'song_wiki_summary',
        route: '/song/wiki/summary',
        module: require('@yiktllw/ncm-api/module/song_wiki_summary'),
    },
    {
        identifier: 'recommend_songs',
        route: '/recommend/songs',
        module: require('@yiktllw/ncm-api/module/recommend_songs'),
    },
    {
        identifier: 'recommend_resource',
        route: '/recommend/resource',
        module: require('@yiktllw/ncm-api/module/recommend_resource'),
    },
    {
        identifier: 'playmode_intelligence_list',
        route: '/playmode/intelligence/list',
        module: require('@yiktllw/ncm-api/module/playmode_intelligence_list'),
    },
    {
        identifier: 'playlist_video_recent',
        route: '/playlist/video/recent',
        module: require('@yiktllw/ncm-api/module/playlist_video_recent'),
    },
    {
        identifier: 'playlist_update_playcount',
        route: '/playlist/update/playcount',
        module: require('@yiktllw/ncm-api/module/playlist_update_playcount'),
    },
    {
        identifier: 'playlist_update',
        route: '/playlist/update',
        module: require('@yiktllw/ncm-api/module/playlist_update'),
    },
    {
        identifier: 'playlist_tracks',
        route: '/playlist/tracks',
        module: require('@yiktllw/ncm-api/module/playlist_tracks'),
    },
    {
        identifier: 'playlist_track_delete',
        route: '/playlist/track/delete',
        module: require('@yiktllw/ncm-api/module/playlist_track_delete'),
    },
    {
        identifier: 'playlist_track_all',
        route: '/playlist/track/all',
        module: require('@yiktllw/ncm-api/module/playlist_track_all'),
    },
    {
        identifier: 'playlist_track_add',
        route: '/playlist/track/add',
        module: require('@yiktllw/ncm-api/module/playlist_track_add'),
    },
    {
        identifier: 'playlist_tags_update',
        route: '/playlist/tags/update',
        module: require('@yiktllw/ncm-api/module/playlist_tags_update'),
    },
    {
        identifier: 'playlist_subscribers',
        route: '/playlist/subscribers',
        module: require('@yiktllw/ncm-api/module/playlist_subscribers'),
    },
    {
        identifier: 'playlist_subscribe',
        route: '/playlist/subscribe',
        module: require('@yiktllw/ncm-api/module/playlist_subscribe'),
    },
    {
        identifier: 'playlist_privacy',
        route: '/playlist/privacy',
        module: require('@yiktllw/ncm-api/module/playlist_privacy'),
    },
    {
        identifier: 'playlist_order_update',
        route: '/playlist/order/update',
        module: require('@yiktllw/ncm-api/module/playlist_order_update'),
    },
    {
        identifier: 'playlist_name_update',
        route: '/playlist/name/update',
        module: require('@yiktllw/ncm-api/module/playlist_name_update'),
    },
    {
        identifier: 'playlist_mylike',
        route: '/playlist/mylike',
        module: require('@yiktllw/ncm-api/module/playlist_mylike'),
    },
    {
        identifier: 'playlist_hot',
        route: '/playlist/hot',
        module: require('@yiktllw/ncm-api/module/playlist_hot'),
    },
    {
        identifier: 'playlist_highquality_tags',
        route: '/playlist/highquality/tags',
        module: require('@yiktllw/ncm-api/module/playlist_highquality_tags'),
    },
    {
        identifier: 'playlist_detail_dynamic',
        route: '/playlist/detail/dynamic',
        module: require('@yiktllw/ncm-api/module/playlist_detail_dynamic'),
    },
    {
        identifier: 'playlist_detail',
        route: '/playlist/detail',
        module: require('@yiktllw/ncm-api/module/playlist_detail'),
    },
    {
        identifier: 'playlist_desc_update',
        route: '/playlist/desc/update',
        module: require('@yiktllw/ncm-api/module/playlist_desc_update'),
    },
    {
        identifier: 'playlist_delete',
        route: '/playlist/delete',
        module: require('@yiktllw/ncm-api/module/playlist_delete'),
    },
    {
        identifier: 'playlist_create',
        route: '/playlist/create',
        module: require('@yiktllw/ncm-api/module/playlist_create'),
    },
    {
        identifier: 'playlist_cover_update',
        route: '/playlist/cover/update',
        module: require('@yiktllw/ncm-api/module/playlist_cover_update'),
    },
    {
        identifier: 'playlist_catlist',
        route: '/playlist/catlist',
        module: require('@yiktllw/ncm-api/module/playlist_catlist'),
    },
    {
        identifier: 'personalized',
        route: '/personalized',
        module: require('@yiktllw/ncm-api/module/personalized'),
    },
    {
        identifier: 'personal_fm',
        route: '/personal_fm',
        module: require('@yiktllw/ncm-api/module/personal_fm'),
    },
    {
        identifier: 'mv_url',
        route: '/mv/url',
        module: require('@yiktllw/ncm-api/module/mv_url'),
    },
    {
        identifier: 'mv_sublist',
        route: '/mv/sublist',
        module: require('@yiktllw/ncm-api/module/mv_sublist'),
    },
    {
        identifier: 'mv_sub',
        route: '/mv/sub',
        module: require('@yiktllw/ncm-api/module/mv_sub'),
    },
    {
        identifier: 'mv_first',
        route: '/mv/first',
        module: require('@yiktllw/ncm-api/module/mv_first'),
    },
    {
        identifier: 'mv_exclusive_rcmd',
        route: '/mv/exclusive/rcmd',
        module: require('@yiktllw/ncm-api/module/mv_exclusive_rcmd'),
    },
    {
        identifier: 'mv_detail_info',
        route: '/mv/detail/info',
        module: require('@yiktllw/ncm-api/module/mv_detail_info'),
    },
    {
        identifier: 'mv_detail',
        route: '/mv/detail',
        module: require('@yiktllw/ncm-api/module/mv_detail'),
    },
    {
        identifier: 'mv_all',
        route: '/mv/all',
        module: require('@yiktllw/ncm-api/module/mv_all'),
    },
    {
        identifier: 'lyric_new',
        route: '/lyric/new',
        module: require('@yiktllw/ncm-api/module/lyric_new'),
    },
    {
        identifier: 'lyric',
        route: '/lyric',
        module: require('@yiktllw/ncm-api/module/lyric'),
    },
    {
        identifier: 'logout',
        route: '/logout',
        module: require('@yiktllw/ncm-api/module/logout'),
    },
    {
        identifier: 'login_status',
        route: '/login/status',
        module: require('@yiktllw/ncm-api/module/login_status'),
    },
    {
        identifier: 'login_refresh',
        route: '/login/refresh',
        module: require('@yiktllw/ncm-api/module/login_refresh'),
    },
    {
        identifier: 'login_qr_key',
        route: '/login/qr/key',
        module: require('@yiktllw/ncm-api/module/login_qr_key'),
    },
    {
        identifier: 'login_qr_create',
        route: '/login/qr/create',
        module: require('@yiktllw/ncm-api/module/login_qr_create'),
    },
    {
        identifier: 'login_qr_check',
        route: '/login/qr/check',
        module: require('@yiktllw/ncm-api/module/login_qr_check'),
    },
    {
        identifier: 'login_cellphone',
        route: '/login/cellphone',
        module: require('@yiktllw/ncm-api/module/login_cellphone'),
    },
    {
        identifier: 'login',
        route: '/login',
        module: require('@yiktllw/ncm-api/module/login'),
    },
    {
        identifier: 'likelist',
        route: '/likelist',
        module: require('@yiktllw/ncm-api/module/likelist'),
    },
    {
        identifier: 'like',
        route: '/like',
        module: require('@yiktllw/ncm-api/module/like'),
    },
    {
        identifier: 'follow',
        route: '/follow',
        module: require('@yiktllw/ncm-api/module/follow'),
    },
    {
        identifier: 'fm_trash',
        route: '/fm_trash',
        module: require('@yiktllw/ncm-api/module/fm_trash'),
    },
    {
        identifier: 'daily_signin',
        route: '/daily_signin',
        module: require('@yiktllw/ncm-api/module/daily_signin'),
    },
    {
        identifier: 'cloudsearch',
        route: '/cloudsearch',
        module: require('@yiktllw/ncm-api/module/cloudsearch'),
    },
    {
        identifier: 'cloud',
        route: '/cloud',
        module: require('@yiktllw/ncm-api/module/cloud'),
    },
    {
        identifier: 'check_music',
        route: '/check/music',
        module: require('@yiktllw/ncm-api/module/check_music'),
    },
    {
        identifier: 'cellphone_existence_check',
        route: '/cellphone/existence/check',
        module: require('@yiktllw/ncm-api/module/cellphone_existence_check'),
    },
    {
        identifier: 'captcha_verify',
        route: '/captcha/verify',
        module: require('@yiktllw/ncm-api/module/captcha_verify'),
    },
    {
        identifier: 'captcha_sent',
        route: '/captcha/sent',
        module: require('@yiktllw/ncm-api/module/captcha_sent'),
    },
    {
        identifier: 'calendar',
        route: '/calendar',
        module: require('@yiktllw/ncm-api/module/calendar'),
    },
    {
        identifier: 'batch',
        route: '/batch',
        module: require('@yiktllw/ncm-api/module/batch'),
    },
    {
        identifier: 'banner',
        route: '/banner',
        module: require('@yiktllw/ncm-api/module/banner'),
    },
    {
        identifier: 'avatar_upload',
        route: '/avatar/upload',
        module: require('@yiktllw/ncm-api/module/avatar_upload'),
    },
    {
        identifier: 'audio_match',
        route: '/audio/match',
        module: require('@yiktllw/ncm-api/module/audio_match'),
    },
    {
        identifier: 'artists',
        route: '/artists',
        module: require('@yiktllw/ncm-api/module/artists'),
    },
    {
        identifier: 'artist_video',
        route: '/artist/video',
        module: require('@yiktllw/ncm-api/module/artist_video'),
    },
    {
        identifier: 'artist_top_song',
        route: '/artist/top/song',
        module: require('@yiktllw/ncm-api/module/artist_top_song'),
    },
    {
        identifier: 'artist_sublist',
        route: '/artist/sublist',
        module: require('@yiktllw/ncm-api/module/artist_sublist'),
    },
    {
        identifier: 'artist_sub',
        route: '/artist/sub',
        module: require('@yiktllw/ncm-api/module/artist_sub'),
    },
    {
        identifier: 'artist_songs',
        route: '/artist/songs',
        module: require('@yiktllw/ncm-api/module/artist_songs'),
    },
    {
        identifier: 'artist_new_song',
        route: '/artist/new/song',
        module: require('@yiktllw/ncm-api/module/artist_new_song'),
    },
    {
        identifier: 'artist_new_mv',
        route: '/artist/new/mv',
        module: require('@yiktllw/ncm-api/module/artist_new_mv'),
    },
    {
        identifier: 'artist_mv',
        route: '/artist/mv',
        module: require('@yiktllw/ncm-api/module/artist_mv'),
    },
    {
        identifier: 'artist_list',
        route: '/artist/list',
        module: require('@yiktllw/ncm-api/module/artist_list'),
    },
    {
        identifier: 'artist_fans',
        route: '/artist/fans',
        module: require('@yiktllw/ncm-api/module/artist_fans'),
    },
    {
        identifier: 'artist_detail',
        route: '/artist/detail',
        module: require('@yiktllw/ncm-api/module/artist_detail'),
    },
    {
        identifier: 'artist_desc',
        route: '/artist/desc',
        module: require('@yiktllw/ncm-api/module/artist_desc'),
    },
    {
        identifier: 'artist_album',
        route: '/artist/album',
        module: require('@yiktllw/ncm-api/module/artist_album'),
    },
    {
        identifier: 'album_sublist',
        route: '/album/sublist',
        module: require('@yiktllw/ncm-api/module/album_sublist'),
    },
    {
        identifier: 'album_sub',
        route: '/album/sub',
        module: require('@yiktllw/ncm-api/module/album_sub'),
    },
    {
        identifier: 'album_songsaleboard',
        route: '/album/songsaleboard',
        module: require('@yiktllw/ncm-api/module/album_songsaleboard'),
    },
    {
        identifier: 'album_newest',
        route: '/album/newest',
        module: require('@yiktllw/ncm-api/module/album_newest'),
    },
    {
        identifier: 'album_new',
        route: '/album/new',
        module: require('@yiktllw/ncm-api/module/album_new'),
    },
    {
        identifier: 'album_list_style',
        route: '/album/list/style',
        module: require('@yiktllw/ncm-api/module/album_list_style'),
    },
    {
        identifier: 'album_list',
        route: '/album/list',
        module: require('@yiktllw/ncm-api/module/album_list'),
    },
    {
        identifier: 'album_detail_dynamic',
        route: '/album/detail/dynamic',
        module: require('@yiktllw/ncm-api/module/album_detail_dynamic'),
    },
    {
        identifier: 'album_detail',
        route: '/album/detail',
        module: require('@yiktllw/ncm-api/module/album_detail'),
    },
    {
        identifier: 'album',
        route: '/album',
        module: require('@yiktllw/ncm-api/module/album'),
    },
    {
        identifier: 'activate_init_profile',
        route: '/activate/init/profile',
        module: require('@yiktllw/ncm-api/module/activate_init_profile'),
    },
    {
        identifier: 'vip_info',
        route: '/vip/info',
        module: require('@yiktllw/ncm-api/module/vip_info'),
    },
    {
        identifier: 'comment_music',
        route: '/comment/music',
        module: require('@yiktllw/ncm-api/module/comment_music'),
    },
    {
        identifier: 'comment_floor',
        route: '/comment/floor',
        module: require('@yiktllw/ncm-api/module/comment_floor'),
    },
    {
        identifier: 'comment_album',
        route: '/comment/album',
        module: require('@yiktllw/ncm-api/module/comment_album'),
    },
    {
        identifier: 'comment_playlist',
        route: '/comment/playlist',
        module: require('@yiktllw/ncm-api/module/comment_playlist'),
    },
    {
        identifier: 'comment_new',
        route: '/comment/new',
        module: require('@yiktllw/ncm-api/module/comment_new'),
    },
    {
        identifier: 'vip_timemachine',
        route: '/vip/timemachine',
        module: require('@yiktllw/ncm-api/module/vip_timemachine'),
    },
    {
        identifier: 'song_wiki_summary',
        route: '/song/wiki/summary',
        module: require('@yiktllw/ncm-api/module/song_wiki_summary'),
    },
    {
        identifier: 'sheet_list',
        route: '/sheet/list',
        module: require('@yiktllw/ncm-api/module/sheet_list'),
    },
    {
        identifier: 'sheet_preview',
        route: '/sheet/preview',
        module: require('@yiktllw/ncm-api/module/sheet_preview'),
    },
    {
        identifier: 'music_first_listen_info',
        route: '/music/first/listen/info',
        module: require('@yiktllw/ncm-api/module/music_first_listen_info'),
    },
    {
        identifier: 'song_music_detail',
        route: '/song/music/detail',
        module: require('@yiktllw/ncm-api/module/song_music_detail'),
    },
    {
        identifier: 'song_red_count',
        route: '/song/red/count',
        module: require('@yiktllw/ncm-api/module/song_red_count'),
    },
    {
        identifier: 'ugc_album_get',
        route: '/ugc/album/get',
        module: require('@yiktllw/ncm-api/module/ugc_album_get'),
    },
    {
        identifier: 'ugc_song_get',
        route: '/ugc/song/get',
        module: require('@yiktllw/ncm-api/module/ugc_song_get'),
    },
    {
        identifier: 'ugc_artist_get',
        route: '/ugc/artist/get',
        module: require('@yiktllw/ncm-api/module/ugc_artist_get'),
    },
    {
        identifier: 'album_v3_detail',
        route: '/api/album/v3/detail',
        module: require('@yiktllw/ncm-api/module/api_album_v3_detail'),
    },
    {
        identifier: 'api_v2_artist_songs',
        route: '/api/v2/artist/songs',
        module: require('@yiktllw/ncm-api/module/api_v2_artist_songs'),
    },
];