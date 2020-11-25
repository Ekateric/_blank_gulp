(function () {
  const MENU_CONTENT_OPEN_CLASS = 'header__content_opened'
  const BTN_OPEN_CLASS = 'burger-btn_opened'
  const BODY_MENU_OPEN_CLASS = 'body-opened-menu'
  
  const menuBtn = document.querySelector('.js-open-menu')
  const menuElement = document.querySelector('.js-menu-content')
  const bodyElement = document.body
  
  if (menuBtn && menuElement) {
    menuBtn.addEventListener('click', function (evt) {
      evt.preventDefault()
      
      menuBtn.classList.toggle(BTN_OPEN_CLASS)
      menuElement.classList.toggle(MENU_CONTENT_OPEN_CLASS)
      bodyElement.classList.toggle(BODY_MENU_OPEN_CLASS)
    })
  }
})()
