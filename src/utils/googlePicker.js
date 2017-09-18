import Vue from 'vue'
import VueResource from 'vue-resource'

Vue.use(VueResource)

import moment from 'moment'

const SCOPE = ['https://www.googleapis.com/auth/drive']
let pickerApiLoaded = false

const onPickerApiLoad = () => {
  pickerApiLoaded = true
}
const onAuthApiLoad = (CLIENT_ID) => {
  if (moment().unix() < localStorage.getItem('googleOauthTokenExpires')) {
    console.log('is signed in')
    return true
  }
  window.gapi.auth.authorize({
    'client_id': CLIENT_ID,
    'scope': SCOPE,
    'immediate': false
  }, (authResult) => {
    console.log('result', authResult)
    if (authResult && !authResult.error) {
      const oauthToken = authResult.access_token
      const expiresAt = authResult.expires_at
      localStorage.setItem('googleOauthToken', oauthToken)
      localStorage.setItem('googleOauthTokenExpires', expiresAt)
    }
  })
}

class Gapp {
  constructor () {
    this.APP_ID = ''
    this.CLIENT_ID = ''
    this.API_KEY = ''
  }
  init = (obj) => {
    console.log('configs', obj)
    this.APP_ID = obj.APP_ID
    this.CLIENT_ID = obj.CLIENT_ID
    this.API_KEY = obj.API_KEY
    return true
  }
  handleClientLoad = () => {
    gapi.load('auth', {'callback': () => onAuthApiLoad(this.CLIENT_ID)})
    gapi.load('picker', {'callback': onPickerApiLoad})
  }
  createPicker = (pickerCallback) => {
    const oauthToken = localStorage.getItem('googleOauthToken')
    console.log(oauthToken)
    const mimeTypes = 'image/png,image/jpeg,image/jpg'
    if (pickerApiLoaded && oauthToken) {
      const docsView = new google.picker.DocsView()
      .setOwnedByMe(true)
      .setMimeTypes(mimeTypes)
      const docsUploadView = new google.picker.DocsUploadView()
      const picker = new google.picker.PickerBuilder()
      .enableFeature(google.picker.Feature.MULTISELECT_ENABLED)
      .setAppId(this.APP_ID)
      .setOAuthToken(oauthToken)
      .addView(docsView)
      .addView(docsUploadView)
      .setDeveloperKey(this.API_KEY)
      .setCallback(pickerCallback)
      .setSize(500, 500)
      .build()
      picker.setVisible(true)
    }
  }
  createPermission = (fileId) => {
    const url = `https://www.googleapis.com/drive/v3/files/${fileId}/permissions`
    return Vue.http.post(url, {
      role: 'reader',
      type: 'anyone'
    }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('googleOauthToken')}`
      }
    }).then(res => {
      console.log('res', res.body)
      return true
    }, res => {
      return Promise.reject(res)
    })
  }
}

export default Gapp
