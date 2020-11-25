import Popup from '../components/popup'

export default function openPopup (btnElem, callback) {
  btnElem.addEventListener('click', function (evt) {
    evt.preventDefault()
    
    const popupId = btnElem.dataset.popup
    const popupTemplate = document.getElementById(popupId)
    
    if (popupTemplate) {
      return new Popup(popupTemplate.innerHTML, popupId, callback)
    }
  })
}
