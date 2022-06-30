
export default class BaiJiaHaoAdapter {
  constructor() {
    this.version = '0.0.1'
    modifyRequestHeaders('baijiahao.baidu.com/', {
    	Origin: 'https://baijiahao.baidu.com',
      Referer: 'https://baijiahao.baidu.com/'
    }, [
    	'*://baijiahao.baidu.com/*',
    ])
  }

  async getMetaData() {
    const { data } = await axios.get('https://baijiahao.baidu.com/builder/app/appinfo?_=' + Date.now())
    if(data.errmsg != 'success') {
    	throw new Error('not found')
    }
    const accountInfo = data.data.user
    return {
      uid: accountInfo.userid,
      title: accountInfo.name,
      avatar: accountInfo.avatar,
      type: 'baijiahao',
      displayName: '百家号',
      supportTypes: ['html'],
      home: 'https://baijiahao.baidu.com/',
      icon: 'https://www.baidu.com/favicon.ico?t=20171027',
    }
  }

  async addPost(post, _instance) {
    return {
      status: 'success',
      post_id: 0,
    }
  }

  async editPost(post_id, post) {
    console.log(111111111, post)
    // todo
    // const pageHtml = await $.get('https://baijiahao.baidu.com/builder/rc/edit')
    // const markStr = 'window.__BJH__INIT__AUTH__="'
    // const authIndex = pageHtml.indexOf(markStr)
    // if(authIndex == -1) {
    // 	throw new Error('登录失效')
    // }
    //
    // const authToken = pageHtml.substring(authIndex + markStr.length, pageHtml.indexOf('",window.__BJH__EDIT__VERSION__', authIndex))

    const params = {
      "app_id" : '1724300272786781',
      "app_token" : '176d2e2e958836326e03a23ca65ecf1b',
      "title": post.post_title,
      "content": post.post_content,
      "origin_url": 'https://www.yun36.com',
      "cover_images": `[{\"src\":\"${post.thumb}\"}]`,
      "is_original" : 0,
      // "is_split_article":1,
      // "video_title":"视频-北京日报联合百家号，内容、技术相互赋能",
      // "video_cover_images":"https://pic.rmb.bdstatic.com/a7b60cf66811e27d7f7466f88ba176e5.jpeg",
    }
    const postStruct = {
      title: post.post_title,
      content: post.post_content,
      feed_cat: 1,
      len: post.post_content.length,
      activity_list: [
        {
        	id: 408,
          is_checked: 0
        }
      ],
      source_reprinted_allow: 0,
      original_status: 0,
      original_handler_status: 1,
      isBeautify: false,
      subtitle: '',
      bjhtopic_id: '',
      bjhtopic_info: '',
      type: 'news',
    }
    const res = await $.ajax({
    	// url: 'https://baijiahao.baidu.com/pcui/article/save?callback=_SAVE_DRAFT_',
    	url: 'https://baijiahao.baidu.com/builderinner/open/resource/article/publish',
      type: 'POST',
      dataType: 'JSON',
      // headers: {
      //   token: authToken
      // },
      data: params,
    })
    if(res.errno != 0) {
    	throw new Error(res.errmsg)
    }
    post_id = res.data.article_id
    return {
      status: 'success',
      post_id: post_id,
      // draftLink: 'https://baijiahao.baidu.com/builder/rc/edit?type=news&article_id=' + post_id,
      draftLink: 'https://baijiahao.baidu.com/builder/preview/s?id=' + post_id,
    }
  }

  async uploadFile(file) {
    var uploadUrl = 'https://baijiahao.baidu.com/builderinner/api/content/file/upload'
    var file = new File([file.bits], 'temp', {
      type: file.type
    });
    var formdata = new FormData()
    formdata.append('media', file)
    formdata.append('type', 'image')
    formdata.append('app_id', '1724300272786781')
    formdata.append('is_waterlog', '1')
    formdata.append('save_material', '1')
    formdata.append('no_compress', '0')
    formdata.append('is_events', '')
    formdata.append('article_type', 'news')

    var res = await axios({
      url: uploadUrl,
      method: 'post',
      data: formdata,
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    return [
      {
        url: res.data.ret.https_url,
      },
    ]
  }

  async preEditPost(post) {
    var div = $('<div>')
    $('body').append(div)

    try {
      div.html(post.content)
      var doc = div
      // var pres = doc.find("pre");
      tools.processDocCode(div)
      tools.makeImgVisible(div)

      var tempDoc = $('<div>').append(doc.clone())
      post.content =
        tempDoc.children('div').length == 1
          ? tempDoc.children('div').html()
          : tempDoc.html()

      console.log('after.predEdit', post.content)
    } catch (e) {
      console.log('preEdit.error', e)
    }
  }
}
