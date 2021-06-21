const HIDDEN_CLASS = 'popup_hidden'
const BODY_POPUP_CLASS = 'body-opened-popup'

export default class Popup {
  constructor (popupContent, popupId, callback) {
    this._id = popupId
    this._element = this._createPopupElement(popupContent)
    this._contentElement = this._element.querySelector('.js-popup-content')
    this._closeElements = Array.from(this._element.querySelectorAll('.js-close-popup'))
    this._bodyElement = document.body
    
    this._callback = callback
    
    this._documentMousedownHandler = this._documentMousedownHandler.bind(this)
    this._escKeyDownHandler = this._escKeyDownHandler.bind(this)
    
    this.remove = this.remove.bind(this)
    this.hide = this.hide.bind(this)
    this.show = this.show.bind(this)
  
    this.render()
  
    this._setHandlers()
  
    this.show()
  }
  
  render () {
    this._bodyElement.appendChild(this._element)
  }
  
  show () {
    if (this._element) {
      this._element.classList.remove(HIDDEN_CLASS)
    }
    
    if (this._bodyElement) {
      this._bodyElement.classList.add(BODY_POPUP_CLASS)
    }
  }
  
  hide () {
    if (this._element) {
      this._element.classList.add(HIDDEN_CLASS)
    }
  
    if (this._bodyElement) {
      this._bodyElement.classList.remove(BODY_POPUP_CLASS)
    }
  }
  
  destroy () {
    this._element.remove()
    this._contentElement = null
    this._closeElements = null
    this._element = null
  
    document.removeEventListener('mousedown', this._documentMousedownHandler)
    document.removeEventListener(`keydown`, this._escKeyDownHandler)
  }
  
  remove () {
    if (this._element) {
      this.hide()
      this.destroy()
    }
  }
  
  _documentMousedownHandler (evt) {
    if (this._contentElement.contains(evt.target) || evt.target === this._element) {
      return
    }
    this.remove()
  }
  
  _escKeyDownHandler (evt) {
    const isEscKey = evt.key === `Escape` || evt.key === `Esc`
  
    if (isEscKey) {
      this.remove()
    }
  }
  
  _setCloseBtnClickHandler () {
    this._closeElements.forEach((closeElement) => {
      closeElement.addEventListener(`click`, (evt) => {
        evt.preventDefault()
    
        this.remove()
      })
    })
  }
  
  _setDocumentMouseDownHandler () {
    document.addEventListener('mousedown', this._documentMousedownHandler)
  }
  
  _setEscKeydownHandler () {
    document.addEventListener(`keydown`, this._escKeyDownHandler)
  }
  
  _setHandlers() {
    this._setCloseBtnClickHandler()
    this._setDocumentMouseDownHandler()
    this._setEscKeydownHandler()
  
    if (typeof this._callback === 'function') {
      this._callback(this._contentElement, this)
    }
  }
  
  _createPopupElement (popupContent) {
    const newElement = document.createElement(`div`)
    newElement.innerHTML = this._getPopupHtml(popupContent)
    
    return newElement.firstElementChild
  }
  
  _getPopupHtml (popupContent) {
    const id = this._id
    
    return (
      `<section
          class="popup popup_hidden popup_${id} js-popup"
          id="${id}-element">
          
        <div class="popup__wrapper">
          <div class="popup__block js-popup-content">
            <button class="popup__close-btn js-close-popup" type="button">
              <span class="visually-hidden">Закрыть модальное окно</span>
            </button>
            
            <div class="popup__content">
              ${popupContent}
            </div>
          </div>
        </div>
        
      </section>`
    )
  }
}
