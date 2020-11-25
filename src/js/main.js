import openPopup from './assets/_openPopup'

import './components/menu'
import './components/popup'

(function () {
  Array.from(document.getElementsByClassName('js-open-popup'))
    .forEach((btnElem) => {
      openPopup(btnElem)
    })
  
})()